#!/usr/bin/env python3
"""Headless browser verification for NK-Pro V99.4.68.
Uses an inlined build so the offline application can be tested without a web server.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright


def build_inline_html(root: Path) -> str:
    soup = BeautifulSoup((root / "index.html").read_text(encoding="utf-8"), "html.parser")
    for link in list(soup.find_all("link", rel="stylesheet")):
        href = link.get("href", "").split("?")[0]
        path = root / href.lstrip("./")
        style = soup.new_tag("style")
        style.string = path.read_text(encoding="utf-8")
        link.replace_with(style)
    for link in list(soup.find_all("link", rel="preload")):
        link.decompose()
    shim = soup.new_tag("script")
    shim.string = """
    (() => {
      const createStorage = () => { const values = new Map(); return {
        get length(){ return values.size; }, key(i){ return Array.from(values.keys())[i] || null; },
        getItem(k){ k=String(k); return values.has(k) ? values.get(k) : null; },
        setItem(k,v){ values.set(String(k),String(v)); }, removeItem(k){ values.delete(String(k)); }, clear(){ values.clear(); }
      }; };
      try { Object.defineProperty(window, 'localStorage', { value:createStorage(), configurable:true }); } catch (_) {}
      try { Object.defineProperty(window, 'sessionStorage', { value:createStorage(), configurable:true }); } catch (_) {}
    })();
    """
    if soup.head:
        soup.head.insert(0, shim)
    for script in list(soup.find_all("script", src=True)):
        src = script.get("src", "").split("?")[0]
        if "service-worker-register.js" in src:
            script.decompose()
            continue
        path = root / src.lstrip("./")
        script.attrs = {}
        script.string = path.read_text(encoding="utf-8")
    return str(soup)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", required=True)
    parser.add_argument("--data", required=True)
    parser.add_argument("--out", required=True)
    args = parser.parse_args()
    root = Path(args.root).resolve()
    data_file = Path(args.data).resolve()
    out = Path(args.out).resolve()
    out.mkdir(parents=True, exist_ok=True)
    data = json.loads(data_file.read_text(encoding="utf-8"))
    inline_html = build_inline_html(root)
    page_errors: list[str] = []
    console_errors: list[str] = []

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path="/usr/bin/chromium", args=["--no-sandbox"])
        context = browser.new_context(accept_downloads=True, viewport={"width": 1440, "height": 1200})
        page = context.new_page()
        page.on("pageerror", lambda exc: page_errors.append(str(exc)))
        page.on("console", lambda msg: console_errors.append(msg.text) if msg.type == "error" else None)
        page.set_content(inline_html, wait_until="load", timeout=120_000)
        page.wait_for_timeout(500)

        result = page.evaluate(
            """data => {
              replaceApplicationState(normalizeLoadedData(data));
              if (typeof prepareStateForPersistence === 'function') prepareStateForPersistence('v99468-browser-test');
              renderAll();
              const calc = calculateUmlage();
              const participant = state.mieter.find(row => row.id === 'M000');
              const participantResult = calc.tenantResults.find(row => row.tenant.id === 'M000');
              const privateResult = calc.privateResults.find(row => row.tenant.id === 'M000');
              const letterResult = briefResultRows(calc).find(row => row.tenant.id === 'M000');
              const letterHtml = buildBriefHtml(calc, letterResult);
              const adjustment = prepaymentAdjustmentData();
              const adjustmentSummary = adjustment.summaries.find(row => row.tenant && row.tenant.id === 'M000');
              const snapshot = NK_PRO_MODULES.billingWorkflow.createSnapshot();
              const snapshotM000 = snapshot.data.mieter.find(row => row.id === 'M000');
              const viewer = NK_PRO_MODULES.archiveActions.viewerStateFromItem(snapshot);
              const viewerM000 = viewer && viewer.mieter && viewer.mieter.find(row => row.id === 'M000');
              const nextYear = JSON.parse(JSON.stringify(state));
              NK_PRO_MODULES.yearTransitionActions.resetAnnualValues(nextYear, 2024, '2024-01-01', '2024-12-31');
              const nextM000 = nextYear.mieter.find(row => row.id === 'M000');
              const roles = ['Privatanteil','Eigenanteil','Eigentümer/Privat'].map((role,index) => {
                const record={id:'GEN-'+index,name:'Generisch '+index,wohnung:'WG-'+index,abrechnungRolle:role,einzug:'2010-01-01',auszug:''};
                return { role, privateUse:isPrivateUse(record), participant:isSettlementParticipant(record), billable:isBillableTenant(record) };
              });
              const originalStateForCaseB = JSON.parse(JSON.stringify(state));
              const caseBData = JSON.parse(JSON.stringify(state).replaceAll('M000', 'P900'));
              const caseBIndex = caseBData.mieter.findIndex(row => row.id === 'P900');
              const caseBParticipant = caseBData.mieter[caseBIndex];
              Object.assign(caseBParticipant, {
                name:'Testperson Eigenanteil', abrechnungRolle:'Eigenanteil', einzug:'2010-01-01', auszug:'',
                kaltSoll:2400, kaltErhalten:2380, nkVoraus:240, einnahmen:2620,
                vorjahresKorrektur:25, kaltmietKorrektur:10, bemerkung:'Generischer V99.4.68 Testfall B'
              });
              [caseBData.objektStandard && caseBData.objektStandard.partner, caseBData.stammdaten && caseBData.stammdaten.mieter].forEach(rows => {
                const row = Array.isArray(rows) ? rows.find(item => item && item.id === 'P900') : null;
                if (row) Object.assign(row, { name:'Testperson Eigenanteil', abrechnungRolle:'Eigenanteil', einzug:'2010-01-01', auszug:'' });
              });
              if (caseBData.briefSettings) caseBData.briefSettings.tenantId = 'P900';
              (caseBData.vorauszahlungen || []).forEach(row => {
                if (!Array.isArray(row.werte)) row.werte = [];
                if (row.kostenId === 'K006') row.werte[caseBIndex] = 120;
                if (row.kostenId === 'K002') row.werte[caseBIndex] = 60;
                if (row.kostenId === 'K009') row.werte[caseBIndex] = 60;
                row.summe = row.werte.reduce((sum,value) => sum + Number(value || 0), 0);
              });
              replaceApplicationState(normalizeLoadedData(caseBData));
              renderAll();
              const calcB = calculateUmlage();
              const resultB = calcB.tenantResults.find(row => row.tenant.id === 'P900');
              const privateB = calcB.privateResults.find(row => row.tenant.id === 'P900');
              const letterRowsB = briefResultRows(calcB);
              const letterB = letterRowsB.find(row => row.tenant.id === 'P900');
              const letterHtmlB = buildBriefHtml(calcB, letterB);
              const adjustmentB = prepaymentAdjustmentData().summaries.find(row => row.tenant && row.tenant.id === 'P900');
              const snapshotB = NK_PRO_MODULES.billingWorkflow.createSnapshot();
              const viewerB = NK_PRO_MODULES.archiveActions.viewerStateFromItem(snapshotB);
              const nextYearB = JSON.parse(JSON.stringify(state));
              NK_PRO_MODULES.yearTransitionActions.resetAnnualValues(nextYearB, 2024, '2024-01-01', '2024-12-31');
              const nextParticipantB = nextYearB.mieter.find(row => row.id === 'P900');
              const csvB = NKProExportService.toCsv([['Typ','Mieter-ID','Wohnungs-ID','Name','Rolle','Kostenanteil','Vorauszahlungen','NK-Korrektur','Saldo'], ...calcB.tenantResults.map(row => ['Abrechnungsteilnehmer',row.tenant.id,row.tenant.wohnung,row.tenant.name,row.tenant.abrechnungRolle,row.costShare,row.prepayments,row.correction,row.balance])]);
              const caseB = {
                participant:{ id:resultB && resultB.tenant.id, name:resultB && resultB.tenant.name, unit:resultB && resultB.tenant.wohnung, role:resultB && resultB.tenant.abrechnungRolle, entryDate:resultB && resultB.tenant.einzug },
                result:{ costShare:resultB && resultB.costShare, prepayments:resultB && resultB.prepayments, correction:resultB && resultB.correction, rentCorrection:resultB && resultB.rentCorrection, balance:resultB && resultB.balance },
                privateResultSame:privateB === resultB,
                letterIncluded:!!letterB,
                letterHasName:letterHtmlB.includes('Testperson Eigenanteil'),
                letterHasUnit:letterHtmlB.includes('Wohnung UG') || letterHtmlB.includes('W000.UG'),
                collectivePrintIncluded:letterRowsB.some(row => row.tenant.id === 'P900'),
                adjustmentIncluded:!!adjustmentB,
                snapshotIncluded:!!(snapshotB.data && snapshotB.data.mieter && snapshotB.data.mieter.some(row => row.id === 'P900')) && !!(snapshotB.calculation && snapshotB.calculation.tenantResults && snapshotB.calculation.tenantResults.some(row => row.tenant.id === 'P900')),
                reopenIncluded:!!(viewerB && viewerB.mieter && viewerB.mieter.some(row => row.id === 'P900')),
                nextYear:{ exists:!!nextParticipantB, role:nextParticipantB && nextParticipantB.abrechnungRolle, entryDate:nextParticipantB && nextParticipantB.einzug, participant:nextParticipantB && isSettlementParticipant(nextParticipantB) },
                nextYearIncluded:!!nextParticipantB && nextParticipantB.abrechnungRolle === 'Eigenanteil' && nextParticipantB.einzug === '2010-01-01' && isSettlementParticipant(nextParticipantB),
                csvIncluded:csvB.includes('P900') && csvB.includes('Testperson Eigenanteil') && csvB.includes('Eigenanteil'),
                jsonRoundtrip:JSON.stringify(JSON.parse(JSON.stringify(state))) === JSON.stringify(state),
                readinessValid:validateBillingReadiness(state).valid
              };
              replaceApplicationState(normalizeLoadedData(originalStateForCaseB));
              renderAll();
              const totals = umlageTotals(calc);
              const k006 = calc.costResults.find(row => row.cost.id === 'K006');
              const k002 = calc.costResults.find(row => row.cost.id === 'K002');
              const k009 = calc.costResults.find(row => row.cost.id === 'K009');
              return {
                appVersion:APP_VERSION,
                startupOk:STARTUP_RESULT.ok,
                year:state.meta.abrechnungsjahr,
                participant:{ id:participant.id, name:participant.name, unit:participant.wohnung, entryDate:participant.einzug, role:participant.abrechnungRolle },
                counts:{ tenantResults:calc.tenantResults.length, privateInformationRows:calc.privateResults.length, letterRows:briefResultRows(calc).length },
                participantResult:{ costShare:participantResult.costShare, prepayments:participantResult.prepayments, correction:participantResult.correction, balance:participantResult.balance },
                privateResultSame:privateResult === participantResult,
                letter:{ included:!!letterResult, hasName:letterHtml.includes('Erik Zimmermann'), hasUnit:letterHtml.includes('Wohnung UG') || letterHtml.includes('W000.UG'), plain:plainLetterTextFromHtml(letterHtml), html:letterHtml },
                adjustment:{ included:!!adjustmentSummary, annualCurrent:adjustmentSummary && adjustmentSummary.currentAnnual, annualRecommended:adjustmentSummary && adjustmentSummary.recommendedAnnual },
                costs:{
                  water:k002 && k002.allocations[participantResult.tenant.originalIndex],
                  heating:k006 && k006.allocations[participantResult.tenant.originalIndex],
                  waste:k009 && k009.allocations[participantResult.tenant.originalIndex]
                },
                totals:{ totalCosts:totals.totalCosts, participantShare:totals.billableShare, privateInformationShare:totals.privateShare, ownerShare:totals.ownerShare, prepayments:totals.prepayments, balance:totals.balance, allocationDelta:totals.allocationDelta },
                snapshot:{ hasM000:!!snapshotM000, entryDate:snapshotM000 && snapshotM000.einzug, resultIncluded:!!(snapshot.calculation && snapshot.calculation.tenantResults && snapshot.calculation.tenantResults.some(row => row.tenant.id === 'M000')), participantCount:snapshot.summary && snapshot.summary.mietverhaeltnisse },
                reopened:{ hasM000:!!viewerM000, entryDate:viewerM000 && viewerM000.einzug },
                nextYear:{ hasM000:!!nextM000, entryDate:nextM000 && nextM000.einzug, role:nextM000 && nextM000.abrechnungRolle },
                roles,
                caseB,
                jsonRoundtrip:JSON.stringify(JSON.parse(JSON.stringify(state))) === JSON.stringify(state),
                readiness:validateBillingReadiness(state)
              };
            }""",
            data,
        )

        assert result["appVersion"] == "V99.4.68"
        assert result["startupOk"] is True
        assert result["participant"] == {"id":"M000","name":"Erik Zimmermann","unit":"W000.UG","entryDate":"2010-01-01","role":"Eigentümer/Privat"}
        assert result["counts"]["tenantResults"] == 5
        assert result["counts"]["letterRows"] == 5
        assert result["privateResultSame"] is True
        assert result["participantResult"]["costShare"] > 0
        assert result["participantResult"]["balance"] == result["participantResult"]["costShare"]
        assert result["letter"]["included"] and result["letter"]["hasName"] and result["letter"]["hasUnit"]
        assert result["adjustment"]["included"]
        assert abs(result["costs"]["heating"] - 2624.58) < 0.01
        assert result["costs"]["water"] > 0 and result["costs"]["waste"] > 0
        assert result["snapshot"]["hasM000"] and result["snapshot"]["resultIncluded"] and result["snapshot"]["entryDate"] == "2010-01-01"
        assert result["snapshot"]["participantCount"] == 5
        assert result["reopened"]["hasM000"] and result["reopened"]["entryDate"] == "2010-01-01"
        assert result["nextYear"]["hasM000"] and result["nextYear"]["entryDate"] == "2010-01-01"
        assert all(row["privateUse"] and row["participant"] and row["billable"] for row in result["roles"])
        case_b = result["caseB"]
        assert case_b["participant"] == {"id":"P900","name":"Testperson Eigenanteil","unit":"W000.UG","role":"Eigenanteil","entryDate":"2010-01-01"}
        assert case_b["result"]["costShare"] > 0 and case_b["result"]["prepayments"] == 240 and case_b["result"]["correction"] == 25
        assert case_b["result"]["rentCorrection"] == 10 and case_b["privateResultSame"]
        assert case_b["letterIncluded"] and case_b["letterHasName"] and case_b["letterHasUnit"] and case_b["collectivePrintIncluded"]
        assert case_b["adjustmentIncluded"] and case_b["snapshotIncluded"] and case_b["reopenIncluded"] and case_b["nextYearIncluded"]
        assert case_b["csvIncluded"] and case_b["jsonRoundtrip"] and case_b["readinessValid"]
        assert result["jsonRoundtrip"] is True

        # UI sight tests.
        page.evaluate("switchToTab('umlage'); renderUmlage(); document.querySelectorAll('.tab').forEach(el=>el.classList.remove('active')); const el=document.getElementById('umlage'); el.classList.add('active'); el.hidden=false; el.style.display='block';")
        page.wait_for_timeout(150)
        umlage_text = page.locator("#umlage").inner_text()
        assert "Erik Zimmermann" in umlage_text
        page.locator("#umlage").screenshot(path=str(out / "01-ergebnis-abrechnung.png"))

        page.evaluate("switchToTab('manuellewerte'); renderIndividualValues(); document.querySelectorAll('.tab').forEach(el=>el.classList.remove('active')); const el=document.getElementById('manuellewerte'); el.classList.add('active'); el.hidden=false; el.style.display='block';")
        page.wait_for_timeout(150)
        individual_text = page.locator("#manuellewerte").inner_text()
        assert "Erik Zimmermann" in individual_text
        page.locator("#manuellewerte").screenshot(path=str(out / "02-individuelle-werte.png"))

        page.evaluate("state.briefSettings.tenantId='M000'; switchToTab('briefe'); renderBrief(); document.querySelectorAll('.tab').forEach(el=>el.classList.remove('active')); const el=document.getElementById('briefe'); el.classList.add('active'); el.hidden=false; el.style.display='block';")
        page.wait_for_timeout(250)
        brief_option = page.locator("#briefSettings select option[value='M000']")
        assert brief_option.count() == 1
        assert "Erik Zimmermann" in brief_option.text_content()
        page.locator("#briefe").screenshot(path=str(out / "03-abrechnungsbrief.png"))

        # Export tests.
        downloads = {}
        for name, expression in [
            ("umlage_csv", "downloadUmlageCsv()"),
            ("mieter_csv", "downloadMieterCsv()"),
            ("full_json", "downloadFullJson()"),
            ("excel_xml", "costReconciliationExportExcel()"),
        ]:
            with page.expect_download(timeout=30_000) as info:
                page.evaluate(expression)
            download = info.value
            target = out / download.suggested_filename
            download.save_as(str(target))
            downloads[name] = str(target)
        assert "M000" in Path(downloads["umlage_csv"]).read_text(encoding="utf-8-sig")
        assert "Erik Zimmermann" in Path(downloads["mieter_csv"]).read_text(encoding="utf-8-sig")
        exported = json.loads(Path(downloads["full_json"]).read_text(encoding="utf-8"))
        assert any(row.get("id") == "M000" for row in exported.get("mieter", []))
        assert "Workbook" in Path(downloads["excel_xml"]).read_text(encoding="utf-8-sig")

        # Print/PDF proof for M000.
        pdf_page = context.new_page()
        pdf_page.set_content("<!doctype html><html lang='de'><head><meta charset='utf-8'></head><body>" + result["letter"].pop("html") + "</body></html>", wait_until="load")
        pdf_page.emulate_media(media="print")
        pdf_path = out / "M000-Abrechnungsbrief-Browsertest.pdf"
        pdf_page.pdf(path=str(pdf_path), format="A4", print_background=True, margin={"top":"0","right":"0","bottom":"0","left":"0"})
        pdf_page.close()

        result["uiSightTests"] = {"umlageContainsM000":True,"individualValuesContainsM000":True,"briefSelectionContainsM000":True}
        result["exports"] = {key:Path(value).name for key,value in downloads.items()}
        result["pdf"] = pdf_path.name
        result["pageErrors"] = page_errors
        result["consoleErrors"] = console_errors
        assert not page_errors, page_errors
        assert not console_errors, console_errors

        (out / "browser-verification.json").write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding="utf-8")
        browser.close()

    md = [
        "# Browser- und Echtdatenprüfung V99.4.68",
        "",
        "- Chromium headless über Python Playwright, vollständig offline/inlined.",
        "- Start der Anwendung: bestanden.",
        "- M000 in regulärem Abrechnungsergebnis, individuellen Werten, Briefauswahl und Exporten: bestanden.",
        "- Generische Rollenvarianten Privatanteil, Eigenanteil und Eigentümer/Privat: bestanden.",
        "- Vollständiger generischer Testfall B (P900 / Eigenanteil / W000.UG) mit Kosten, Vorauszahlungen, Korrekturen, Ergebnis, Dokument, Sammeldruck, Export, Snapshot, Wiederöffnung und Jahreswechsel: bestanden.",
        "- Snapshot, Wiederöffnung, Jahreswechsel und JSON-Roundtrip: bestanden.",
        "- CSV-, Mieter-CSV-, Gesamt-JSON- und Excel-kompatibler XML-Export: bestanden.",
        "- Druck-/PDF-Ausgabe für Erik Zimmermann: erzeugt.",
        "- JavaScript-Seitenfehler und Konsolenfehler: 0.",
        "",
        "## Echtdaten-Kernergebnis",
        f"- Kostenanteil M000: {result['participantResult']['costShare']:.2f} EUR",
        f"- Vorauszahlungen M000: {result['participantResult']['prepayments']:.2f} EUR",
        f"- Saldo M000: {result['participantResult']['balance']:.2f} EUR",
        f"- Heiz-/Warmwasserkosten M000: {result['costs']['heating']:.2f} EUR",
        f"- Wasseranteil M000: {result['costs']['water']:.2f} EUR",
        f"- Abfallanteil M000: {result['costs']['waste']:.2f} EUR",
    ]
    (out / "BROWSER_ECHTDATENPRUEFUNG.md").write_text("\n".join(md) + "\n", encoding="utf-8")
    print(json.dumps({"ok": True, "out": str(out), "participantResult": result["participantResult"]}, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
