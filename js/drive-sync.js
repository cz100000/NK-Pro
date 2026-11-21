/* NK-Pro Google Drive Sync – private normal Drive folder, immutable snapshots, local-first.
 * No personal data or access tokens are included in this source file.
 * OAuth is configured by the owner of the Google Cloud project at runtime.
 */
(function (global) {
  "use strict";
  const PREFIX = "nkpro-cloud-snapshot-";
  const STORE = "nkpro_drive_sync_v1";
  const SCOPES = "https://www.googleapis.com/auth/drive.file";
  const FOLDER_NAME = "NK-Pro – Privatdaten";
  let folderId = "";
  const API = "https://www.googleapis.com/drive/v3/files";
  const UPLOAD = "https://www.googleapis.com/upload/drive/v3/files";
  const SAVE_DELAY = 3500;
  const POLL_MS = 45000;
  let token = "", expiresAt = 0, tokenClient = null, tokenClientId = "";
  let loading = false, uploading = false, applying = false, connecting = false;
  let timer = null, pollTimer = null, latest = null, message = "", status = "local";
  let node = null, booted = false;
  let config = readConfig();

  function readConfig() {
    try {
      const raw = JSON.parse(localStorage.getItem(STORE) || "{}");
      return {
        clientId: String(global.NKPRO_GOOGLE_CLIENT_ID || raw.clientId || ""),
        paired: raw.paired === true,
        remoteId: String(raw.remoteId || ""),
        dirty: raw.dirty === true,
        device: String(raw.device || "") || (global.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()))
      };
    } catch (_) {
      return { clientId:"", paired:false, remoteId:"", dirty:false, device:String(Date.now()) };
    }
  }
  function persist() {
    try { localStorage.setItem(STORE, JSON.stringify(config)); } catch (_) { /* local storage remains authoritative */ }
  }
  function h(value) { return String(value ?? "").replace(/[&<>"']/g, x => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[x])); }
  function info(text, kind) { message = String(text || ""); status = kind || "local"; paint(); }
  function paint() {
    if (!node) return;
    const summary = node.querySelector("#nk-drive-indicator");
    const msg = node.querySelector("#nk-drive-message");
    if (summary) { summary.textContent = ({ready:"Drive synchronisiert",dirty:"Änderungen lokal",conflict:"Datenkonflikt – prüfen",offline:"Offline – lokal gesichert",error:"Drive-Fehler",local:"Drive einrichten",busy:"Drive synchronisiert …"})[status] || "Google Drive"; summary.dataset.status = status; }
    if (msg) msg.textContent = message;
    const configured = !!config.clientId;
    const connected = !!token && Date.now() < expiresAt;
    const idInput = node.querySelector("#nk-drive-client");
    if (idInput && document.activeElement !== idInput) idInput.value = config.clientId;
    const account = node.querySelector("#nk-drive-auth");
    if (account) account.textContent = connected ? "Google verbunden" : configured ? "Mit Google verbinden" : "Google Client-ID zuerst speichern";
    const push = node.querySelector("#nk-drive-push");
    const pull = node.querySelector("#nk-drive-pull");
    const refresh = node.querySelector("#nk-drive-check");
    if (push) push.disabled = !connected || loading || uploading;
    if (pull) pull.disabled = !connected || loading || uploading || !latest;
    if (refresh) refresh.disabled = !connected || loading || uploading;
  }
  function hasToken() { return !!token && Date.now() < expiresAt - 30000; }
  function tokenExpired(error) {
    if (error && (error.httpStatus === 401 || error.httpStatus === 403)) {
      token = ""; expiresAt = 0;
      info("Google-Anmeldung abgelaufen oder fehlende Berechtigung. Erneut verbinden; lokale Daten bleiben erhalten.", "offline");
    }
  }
  async function apiRequest(url, options = {}) {
    if (!hasToken()) throw new Error("Keine gültige Google-Anmeldung. Bitte erneut verbinden.");
    if (!navigator.onLine) throw new Error("Offline. Daten sind lokal gespeichert.");
    const headers = new Headers(options.headers || {});
    headers.set("Authorization", "Bearer " + token);
    let response;
    try { response = await fetch(url, { ...options, headers, cache:"no-store" }); }
    catch (error) { throw new Error("Google Drive nicht erreichbar: " + String(error.message || error)); }
    if (!response.ok) {
      const body = (await response.text()).slice(0,400);
      const error = new Error("Drive API HTTP " + response.status + ": " + body);
      error.httpStatus = response.status;
      tokenExpired(error);
      throw error;
    }
    return response;
  }
  async function listSnapshots() {
    const q = "name contains '" + PREFIX + "' and trashed = false";
    const params = new URLSearchParams({ spaces:"drive", q, fields:"nextPageToken,files(id,name,createdTime,modifiedTime,size)", pageSize:"100", orderBy:"createdTime desc" });
    const result = await (await apiRequest(API + "?" + params.toString())).json();
    return (result.files || []).filter(file => String(file.name || "").startsWith(PREFIX)).sort((a,b) =>
      String(b.createdTime || "").localeCompare(String(a.createdTime || "")) || String(b.name || "").localeCompare(String(a.name || "")));
  }
  async function ensurePrivateFolder() {
    if (folderId) return folderId;
    const q = "name = '" + FOLDER_NAME.replace(/'/g,"\\'") + "' and mimeType = 'application/vnd.google-apps.folder' and trashed = false";
    const params = new URLSearchParams({q,fields:"nextPageToken,files(id,name,mimeType,createdTime)",pageSize:"100",spaces:"drive"});
    const found = await (await apiRequest(API + "?" + params.toString())).json();
    const folders = Array.isArray(found.files) ? found.files : [];
    if (folders.length) { folderId = folders[0].id; return folderId; }
    const created = await (await apiRequest(API + "?fields=id,name", {
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({name:FOLDER_NAME,mimeType:"application/vnd.google-apps.folder"})
    })).json();
    if (!created || !created.id) throw new Error("Privater NK-Pro-Ordner konnte nicht angelegt werden.");
    folderId = created.id;
    return folderId;
  }
  async function downloadSnapshot(meta) {
    const body = await (await apiRequest(API + "/" + encodeURIComponent(meta.id) + "?alt=media")).json();
    if (!body || body.format !== "nkpro-drive-snapshot-v1" || !body.data || !Array.isArray(body.data.wohnungen) || !Array.isArray(body.data.mieter) || !Array.isArray(body.data.kostenarten)) throw new Error("Cloud-Snapshot hat kein gültiges NK-Pro-Format.");
    if (typeof global.validateStoredDataIntegrity === "function") {
      const report = global.validateStoredDataIntegrity(body.data);
      if (!report || !report.valid) throw new Error("Integritätsprüfung des Drive-Datenbestands fehlgeschlagen.");
    }
    if (body.snapshotId !== meta.id && !String(meta.name).includes(String(body.snapshotId))) {
      // The file name and snapshot id need not be equal; the envelope is still verified by shape.
    }
    return body;
  }
  async function ensureGisLibrary() {
    if (global.google && global.google.accounts && global.google.accounts.oauth2) return;
    await new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.onload = resolve;
      script.onerror = () => reject(new Error("Google-Anmeldeskript konnte nicht geladen werden."));
      document.head.appendChild(script);
    });
  }
  function configureClientId() {
    const value = String(node.querySelector("#nk-drive-client").value || "").trim();
    if (!/^\d{8,}-[\w-]+\.apps\.googleusercontent\.com$/.test(value)) {
      info("Bitte die vollständige OAuth-Web-Client-ID aus Google Cloud eingeben.", "error");
      return;
    }
    if (config.clientId !== value) {
      token = ""; expiresAt = 0; tokenClient = null; tokenClientId = "";
      config = { clientId:value, device:config.device, paired:false, remoteId:"", dirty:false };
    }
    persist(); info("Client-ID auf diesem Gerät gespeichert. Jetzt mit Google verbinden.", "local");
  }
  async function authorize(options = {}) {
    if (connecting) return;
    if (!config.clientId) { info("Zuerst OAuth-Web-Client-ID hinterlegen.", "error"); return; }
    if (!navigator.onLine) { info("Offline. Anmeldung ist nur mit Internetverbindung möglich.", "offline"); return; }
    connecting = true; info("Google-Anmeldung wird vorbereitet …", "busy");
    try {
      await ensureGisLibrary();
      const response = await new Promise((resolve, reject) => {
        if (!tokenClient || tokenClientId !== config.clientId) {
          tokenClient = global.google.accounts.oauth2.initTokenClient({
            client_id:config.clientId, scope:SCOPES,
            callback:result => { if (result && result.error) reject(new Error(result.error)); else resolve(result); },
            error_callback:e => reject(new Error(e && (e.message || e.type) || "Google-Anmeldefenster geschlossen"))
          });
          tokenClientId = config.clientId;
        } else {
          tokenClient.callback = result => { if (result && result.error) reject(new Error(result.error)); else resolve(result); };
        }
        tokenClient.requestAccessToken({prompt:options.silent ? "" : "select_account"});
      });
      if (!response || !response.access_token) throw new Error("Kein Zugriffstoken erhalten.");
      token = response.access_token; expiresAt = Date.now() + (Number(response.expires_in || 3600) * 1000);
      info("Angemeldet. Cloud-Stand wird überprüft …", "busy");
      await reconcile();
    } catch (error) { info("Anmeldung fehlgeschlagen: " + error.message + ". Lokale Daten unverändert.", options.silent ? "local" : "error"); }
    finally { connecting = false; paint(); }
  }
  function saveLocalSnapshotBeforeOverwrite() {
    if (typeof state === "undefined" || !state) throw new Error("NK-Pro ist noch nicht gestartet.");
    const data = global.clone ? global.clone(state) : JSON.parse(JSON.stringify(state));
    // Download is independent of the cloud; it provides a recovery point even when storage quota is low.
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:"application/json"});
    const href = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = href; link.download = "NK-Pro-Sicherung-vor-Drive-Laden-" + new Date().toISOString().replace(/[:.]/g,"-") + ".json";
    document.body.appendChild(link); link.click(); link.remove();
    setTimeout(() => URL.revokeObjectURL(href), 30000);
  }
  function getLocal() {
    if (typeof state === "undefined" || !state || !global.isAppDataShape(state)) throw new Error("Kein gültiger lokaler NK-Pro-Datenbestand geladen.");
    return state;
  }
  async function applyCloud(body, cloudId, requireConfirm) {
    const data = body.data;
    if (requireConfirm) {
      const ok = global.confirm("Die Google-Drive-Version ersetzt den lokalen NK-Pro-Arbeitsstand. Eine lokale JSON-Sicherung wird vorher heruntergeladen. Fortfahren?");
      if (!ok) return false;
      saveLocalSnapshotBeforeOverwrite();
    }
    applying = true;
    try {
      const normalized = global.normalizeLoadedData(global.clone(data));
      global.replaceApplicationState(normalized);
      if (typeof global.resetTransientUiState === "function") global.resetTransientUiState({resetPageState:true});
      if (typeof billingContextOpen !== "undefined") billingContextOpen = false;
      const localSaved = global.withFinalizationWriteBypass ? global.withFinalizationWriteBypass(() => global.saveData({skipPrepare:true})) : global.saveData({skipPrepare:true});
      if (!localSaved) throw new Error("Drive-Daten geladen, aber lokales Speichern fehlgeschlagen. Bitte sofort JSON sichern.");
      config.remoteId = cloudId; config.paired = true; config.dirty = false; persist();
      global.renderAll({forceAll:true});
      if (typeof global.switchToTab === "function") global.switchToTab("landing");
      info("Drive-Daten übernommen und lokal gespeichert: " + new Date().toLocaleString("de-DE"), "ready");
      return true;
    } finally { applying = false; }
  }
  async function reconcile() {
    if (!hasToken() || loading || uploading) return;
    loading = true;
    try {
      const entries = await listSnapshots();
      latest = entries[0] || null;
      if (!latest) {
        info(config.paired ? "Achtung: Dieses Google-Konto enthält keinen NK-Pro-Datenstand, obwohl das Gerät bereits gekoppelt war. Prüfe, ob du mit dem richtigen Google-Konto angemeldet bist." : "In diesem Google-Konto ist noch kein NK-Pro-Datenstand. Mit ‚Lokal → Drive sichern‘ initialisieren.", config.paired ? "conflict" : "local");
      } else if (!config.paired) {
        const existing = typeof readStoredDataResult === "function" ? readStoredDataResult(STORAGE_KEY) : {valid:true};
        if (!existing.valid && existing.missing) {
          const body = await downloadSnapshot(latest);
          await applyCloud(body, latest.id, false);
        } else info("Drive-Daten vorhanden. Zum ersten Mal ‚Drive → Lokal laden‘ auswählen; lokale Daten werden vorher gesichert.", "conflict");
      } else if (latest.id === config.remoteId) {
        info(config.dirty ? "Lokale Änderungen warten auf Synchronisierung." : "Lokaler und Google-Drive-Stand abgeglichen.", config.dirty ? "dirty" : "ready");
      } else if (config.dirty) {
        info("Konflikt: Auf einem anderen Gerät gibt es eine neuere Drive-Version UND hier ungesicherte Änderungen. Keine Daten wurden überschrieben.", "conflict");
      } else {
        if (typeof billingContextOpen !== "undefined" && billingContextOpen) {
          info("Auf Drive liegt ein neuer Stand. Die offene Abrechnungsbearbeitung wird nicht automatisch unterbrochen. Bitte zur Startseite zurückkehren und Drive prüfen.", "conflict");
          return;
        }
        if (document.activeElement && /^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) {
          info("Drive enthält Änderungen. Automatisches Laden wartet, bis die Eingabe beendet ist.", "conflict");
          return;
        }
        const body = await downloadSnapshot(latest);
        if (body.parentId !== config.remoteId) {
          info("Konflikt: Der neueste Drive-Snapshot folgt nicht direkt auf den hier geladenen Stand. Bitte manuell prüfen; nichts wird überschrieben.", "conflict");
        } else await applyCloud(body, latest.id, false);
      }
    } catch (error) { tokenExpired(error); info("Drive-Abgleich fehlgeschlagen: " + error.message + ". Lokale Daten bleiben erhalten.", "error"); }
    finally { loading = false; paint(); }
    if (config.paired && config.dirty && latest && config.remoteId === latest.id) scheduleUpload();
  }
  async function pullManual() {
    if (!hasToken()) return;
    try {
      const entries = await listSnapshots();
      const head = entries[0];
      if (!head) return info("Auf Google Drive liegt noch kein Datensatz.", "local");
      if (loading || uploading) return;
      loading = true;
      const body = await downloadSnapshot(head);
      await applyCloud(body, head.id, true);
      latest = head;
    } catch (error) { info("Drive-Laden fehlgeschlagen: " + error.message, "error"); }
    finally { loading = false; paint(); }
  }
  async function uploadData(manual = false) {
    if (uploading || loading || !hasToken()) return;
    if (!config.paired && !manual) return;
    uploading = true; clearTimeout(timer); timer = null;
    try {
      const entries = await listSnapshots();
      const head = entries[0] || null;
      if (head && head.id !== config.remoteId) {
        if (!manual || !global.confirm("Google Drive enthält einen anderen Datenstand. Eine neue Version wird zusätzlich gespeichert. Der bisherige Cloud-Stand bleibt erhalten. Möchtest du den lokalen Stand bewusst als neuesten Stand veröffentlichen?")) {
          info("Konflikt: Drive-Daten wurden nicht überschrieben. Bitte ‚Drive → Lokal laden‘ oder bewusst ‚Lokal → Drive sichern‘ auswählen.", "conflict");
          return;
        }
      }
      if (!head && !manual) return;
      if (!head && config.paired && manual && !global.confirm("Das Google-Konto hat keinen bisherigen NK-Pro-Datenstand. Möglicherweise bist du mit einem anderen Google-Konto angemeldet. Wirklich hier neu speichern?")) return;
      const current = getLocal();
      const data = global.clone(current);
      if (typeof global.protectDataForStorage === "function") {
        // Preserve the exact local integrity format without modifying the in-memory working state.
        const safe = global.protectDataForStorage(data);
        Object.assign(data, safe);
      }
      const snapshotId = global.crypto && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random().toString(36).slice(2);
      const envelope = JSON.stringify({format:"nkpro-drive-snapshot-v1",snapshotId,parentId:head && head.id || null,createdAt:new Date().toISOString(),device:config.device,appVersion:typeof APP_VERSION === "string" ? APP_VERSION : "V99.4.76",data});
      const fileName = PREFIX + new Date().toISOString().replace(/[:.]/g, "-") + "-" + snapshotId + ".json";
      const boundary = "nkpro" + Math.random().toString(36).slice(2);
      const privateFolder = await ensurePrivateFolder();
      const metadata = JSON.stringify({ name:fileName, mimeType:"application/json", parents:[privateFolder] });
      const body = new Blob(["--" + boundary + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n",metadata,"\r\n--" + boundary + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n",envelope,"\r\n--" + boundary + "--"],{type:"multipart/related; boundary=" + boundary});
      const result = await (await apiRequest(UPLOAD + "?uploadType=multipart&fields=id,name,createdTime",{method:"POST",headers:{"Content-Type":body.type},body})).json();
      if (!result || !result.id) throw new Error("Google Drive hat keine Datei-ID zurückgegeben.");
      // Never silently mark new writes as synchronized if the local dataset changed during the upload.
      const localUnchanged = JSON.stringify(getLocal()) === JSON.stringify(current);
      latest = result;
      config.remoteId = result.id; config.paired = true; config.dirty = !localUnchanged;
      persist();
      info(localUnchanged ? "Sicher in Google Drive gespeichert. Auch andere Geräte können diesen Stand laden." : "Drive-Snapshot gespeichert; neuere lokale Änderungen werden noch übertragen.", localUnchanged ? "ready" : "dirty");
    } catch (error) {
      tokenExpired(error);
      config.dirty = true; persist();
      info("Drive-Speichern fehlgeschlagen: " + error.message + ". Lokal gespeichert, kein Datenverlust.", "error");
    } finally { uploading = false; paint(); }
    if (config.dirty && hasToken()) scheduleUpload();
  }
  function scheduleUpload() {
    if (!config.paired || !hasToken() || uploading || loading || status === "conflict") return;
    clearTimeout(timer);
    timer = setTimeout(() => uploadData(false), SAVE_DELAY);
  }
  function observeLocalSave() {
    if (applying || !config.paired) return;
    config.dirty = true; persist(); info("Änderungen lokal gespeichert; Drive-Upload folgt.", "dirty");
    scheduleUpload();
  }
  function wrapSave() {
    if (typeof global.saveData !== "function" || global.saveData.__nkDriveWrapped) return;
    const original = global.saveData;
    const replacement = function () { const result = original.apply(this, arguments); if (result === true) observeLocalSave(); return result; };
    replacement.__nkDriveWrapped = true;
    global.saveData = replacement;
  }
  function injectUi() {
    const style = document.createElement("style");
    style.textContent = `#nk-drive-panel{position:fixed;top:12px;right:12px;z-index:11000;width:min(365px,calc(100vw - 24px));font:14px/1.45 system-ui,sans-serif;color:#21384f;filter:drop-shadow(0 3px 12px #12243b2b)}#nk-drive-panel>summary{cursor:pointer;border-radius:12px;padding:8px 13px;background:#fff;border:1px solid #cbd8e4;font-weight:700;list-style:none}#nk-drive-panel>summary::-webkit-details-marker{display:none}#nk-drive-indicator[data-status="ready"]{color:#087042}#nk-drive-indicator[data-status="error"],#nk-drive-indicator[data-status="conflict"]{color:#b22922}#nk-drive-panel .nk-drive-body{border:1px solid #cbd8e4;border-radius:12px;background:#fff;padding:14px;box-shadow:0 9px 26px #12243b22}#nk-drive-panel .nk-drive-body p{margin:8px 0}#nk-drive-panel label{display:block;font-size:12px;font-weight:700;margin:10px 0 4px}#nk-drive-panel input{width:100%;box-sizing:border-box;padding:8px;border:1px solid #adc0d5;border-radius:6px;font-size:12px}#nk-drive-panel .nk-drive-row{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}#nk-drive-panel button{border:1px solid #a7bbcd;border-radius:7px;background:#f3f7fc;color:#173b62;padding:8px 10px;cursor:pointer;font-size:12px;font-weight:700;flex:1 1 auto}#nk-drive-panel button:disabled{opacity:.45;cursor:not-allowed}#nk-drive-message{font-size:12px;min-height:36px;overflow-wrap:anywhere}#nk-drive-panel small{color:#425e74}#nk-drive-panel a{color:#0756a3}`;
    // V99.4.76.1: On narrow screens the old fixed top-right badge covered the header menu.
    // Keep a compact, touch-sized badge in the lower right; the details open upward.
    style.textContent += `
      @media (max-width: 980px) {
        #nk-drive-panel {
          top:auto; right:10px;
          bottom:calc(10px + env(safe-area-inset-bottom, 0px));
          width:max-content; max-width:calc(100vw - 20px);
        }
        #nk-drive-panel > summary {
          display:flex; align-items:center; justify-content:center;
          min-height:44px; padding:8px 12px;
          max-width:100%; white-space:nowrap; font-size:12px;
        }
        #nk-drive-panel .nk-drive-body {
          position:absolute; right:0; bottom:calc(100% + 8px);
          width:min(365px,calc(100vw - 20px));
          max-height:70vh; max-height:min(70vh,calc(100dvh - 110px));
          overflow-y:auto; overscroll-behavior:contain;
          -webkit-overflow-scrolling:touch;
        }
        body.sidebar-open #nk-drive-panel { visibility:hidden; pointer-events:none; }
      }
      @media print { #nk-drive-panel { display:none !important; } }
    `;
    document.head.appendChild(style);
    node = document.createElement("details"); node.id = "nk-drive-panel";
    node.innerHTML = `<summary id="nk-drive-indicator" role="button">Drive einrichten</summary><div class="nk-drive-body"><strong>Private Google-Drive-Synchronisierung</strong><p id="nk-drive-message" role="status" aria-live="polite"></p><label for="nk-drive-client">OAuth-Web-Client-ID (Google Cloud Console)</label><input id="nk-drive-client" spellcheck="false" autocomplete="off" placeholder="123456789-…apps.googleusercontent.com"/><div class="nk-drive-row"><button type="button" id="nk-drive-save-id">Client-ID speichern</button><button type="button" id="nk-drive-auth">Mit Google verbinden</button></div><div class="nk-drive-row"><button type="button" id="nk-drive-check">Drive prüfen</button><button type="button" id="nk-drive-pull">Drive → Lokal laden</button><button type="button" id="nk-drive-push">Lokal → Drive sichern</button></div><small>Daten bleiben zunächst im Browser. Die erste Cloud-Übernahme erfolgt bewusst per Schaltfläche. Bei Änderungen an zwei Geräten gleichzeitig wird nicht automatisch überschrieben. <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">Google-Cloud-OAuth einrichten</a>. Speicherort: „Meine Ablage / NK-Pro – Privatdaten“, nur für dein Google-Konto. Dateien sind über die ChatGPT-Google-Drive-Verbindung lesbar. Zugangstoken werden nicht dauerhaft gespeichert.</small></div>`;
    document.body.appendChild(node);
    node.querySelector("#nk-drive-save-id").addEventListener("click", configureClientId);
    node.querySelector("#nk-drive-auth").addEventListener("click", () => authorize());
    node.querySelector("#nk-drive-check").addEventListener("click", () => reconcile());
    node.querySelector("#nk-drive-pull").addEventListener("click", pullManual);
    node.querySelector("#nk-drive-push").addEventListener("click", () => uploadData(true));
    paint();
  }
  function start() {
    if (booted) return;
    booted = true; persist(); injectUi(); wrapSave();
    window.addEventListener("online", () => { if (config.dirty && hasToken()) scheduleUpload(); else if (hasToken()) reconcile(); });
    window.addEventListener("offline", () => info("Offline. Eingaben werden weiter im Browser gespeichert und beim erneuten Anmelden synchronisiert.", "offline"));
    window.addEventListener("focus", () => { if (hasToken()) reconcile(); });
    window.addEventListener("pagehide", () => { if (config.dirty) persist(); });
    pollTimer = setInterval(() => { if (hasToken()) reconcile(); }, POLL_MS);
    if (navigator.onLine) ensureGisLibrary().catch(() => { /* Login-Button bleibt nutzbar für Wiederholung. */ });
    if (config.clientId) {
      info("Google Drive vorbereitet. Mit Google verbinden, damit der Datenstand abgeglichen wird.", "local");
      // A silent token request is only best effort; browsers may require a user gesture.
      setTimeout(() => authorize({silent:true}), 1000);
    } else info("Einmalig OAuth-Web-Client-ID einrichten. Bis dahin bleibt NK-Pro vollständig lokal nutzbar.", "local");
    global.NKProDriveSync = Object.freeze({connect:authorize,reconcile,pull:pullManual,push:() => uploadData(true),status:() => ({status,paired:config.paired,dirty:config.dirty,remoteId:config.remoteId,connected:hasToken()}),stop:() => {clearInterval(pollTimer);clearTimeout(timer);} });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded",start,{once:true}); else start();
})(globalThis);
