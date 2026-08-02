#!/usr/bin/env python3
"""Responsive UI and archive action verification for NK-Pro V99.4.69."""
from __future__ import annotations
import argparse, importlib.util, json
from pathlib import Path
from playwright.sync_api import sync_playwright


def load_builder(root: Path):
    path = root / "tools" / "v99469-browser-verification.py"
    spec = importlib.util.spec_from_file_location("nkpro_browser_builder", path)
    mod = importlib.util.module_from_spec(spec)
    assert spec and spec.loader
    spec.loader.exec_module(mod)
    return mod.build_inline_html


def show_tab(page, tab: str, render: str = ""):
    page.evaluate(
        """([tab,render])=>{
          if(render && typeof globalThis[render]==='function') globalThis[render]();
          if(typeof switchToTab==='function') switchToTab(tab);
          document.querySelectorAll('section.tab').forEach(el=>{el.classList.remove('active');el.hidden=true;el.style.display='none';});
          const el=document.getElementById(tab); if(!el) throw new Error('Tab fehlt: '+tab);
          el.classList.add('active'); el.hidden=false; el.style.display='block';
        }""", [tab, render]
    )
    page.wait_for_timeout(180)


def main() -> int:
    ap=argparse.ArgumentParser(); ap.add_argument('--root',required=True); ap.add_argument('--data',required=True); ap.add_argument('--out',required=True); args=ap.parse_args()
    root=Path(args.root).resolve(); data=json.loads(Path(args.data).read_text(encoding='utf-8')); out=Path(args.out).resolve(); out.mkdir(parents=True,exist_ok=True)
    html=load_builder(root)(root)
    report={"version":"V99.4.69","layouts":{},"archiveActions":{},"dialog":{},"errors":[]}
    all_page_errors=[]; all_console_errors=[]
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True,executable_path='/usr/bin/chromium',args=['--no-sandbox'])
        for name,w,h in [('desktop-large',1600,1200),('desktop-normal',1366,1050),('narrow',1024,1100),('tablet',820,1180)]:
            ctx=browser.new_context(viewport={'width':w,'height':h},accept_downloads=True)
            page=ctx.new_page(); pe=[]; ce=[]
            page.on('pageerror',lambda exc, bag=pe: bag.append(str(exc)))
            page.on('console',lambda msg, bag=ce: bag.append(msg.text) if msg.type=='error' else None)
            page.set_content(html,wait_until='load',timeout=120000); page.wait_for_timeout(250)
            page.evaluate("d=>{replaceApplicationState(normalizeLoadedData(d)); renderAll({forceAll:true,reason:'v99469-ui'});}",data)
            show_tab(page,'kostenumlagenabgleich','renderCostReconciliation')
            metrics=page.evaluate("""()=>{
              const doc=document.documentElement, main=document.querySelector('.kua-overview-main'), side=document.querySelector('.kua-side-panel');
              const topWraps=[...document.querySelectorAll('.kua-top-grid .nk-ui-table-wrap')];
              const buttons=[...document.querySelectorAll('#kostenumlagenabgleich button')].filter(b=>b.offsetParent!==null);
              const clippedButtons=buttons.filter(b=>{const wrap=b.closest('.nk-ui-table-wrap');if(wrap&&wrap.scrollWidth>wrap.clientWidth+2)return false;const r=b.getBoundingClientRect();return r.left<0||r.right>innerWidth+1||r.width<20||r.height<20;}).map(b=>b.getAttribute('aria-label')||b.textContent.trim());
              const mh=main.getBoundingClientRect(), sh=side.getBoundingClientRect();
              return {viewport:[innerWidth,innerHeight],documentOverflow:doc.scrollWidth-doc.clientWidth,main:{x:mh.x,y:mh.y,right:mh.right,bottom:mh.bottom},side:{x:sh.x,y:sh.y,right:sh.right,bottom:sh.bottom},sideRight:sh.x>=mh.right-3,sideBelow:sh.y>=mh.bottom-3,topTableOverflow:topWraps.map(el=>el.scrollWidth-el.clientWidth),clippedButtons,headBackground:getComputedStyle(document.querySelector('#kostenumlagenabgleich thead th')).backgroundColor,sections:[...document.querySelectorAll('#kostenumlagenabgleich .kua-card__number')].map(x=>x.textContent.trim())};
            }""")
            assert metrics['documentOverflow'] <= 2, metrics
            assert not metrics['clippedButtons'], metrics
            assert all(v <= 2 for v in metrics['topTableOverflow']), metrics
            if w>1180: assert metrics['sideRight'], metrics
            else: assert metrics['sideBelow'], metrics
            assert metrics['headBackground'] in ('rgb(237, 241, 245)','rgba(237, 241, 245, 1)'), metrics
            assert '8.1.' in metrics['sections'] and '8.2.' in metrics['sections'], metrics
            page.screenshot(path=str(out/f'01-kosten-umlagenabgleich-{name}.png'),full_page=True)
            report['layouts'][name]=metrics
            all_page_errors.extend(pe); all_console_errors.extend(ce); ctx.close()

        # Status/control coexistence and dialog on normal desktop.
        ctx=browser.new_context(viewport={'width':1366,'height':1050},accept_downloads=True); page=ctx.new_page(); pe=[];ce=[]
        page.on('pageerror',lambda exc: pe.append(str(exc))); page.on('console',lambda msg: ce.append(msg.text) if msg.type=='error' else None)
        page.set_content(html,wait_until='load',timeout=120000); page.wait_for_timeout(250)
        status=page.evaluate("""d=>{replaceApplicationState(normalizeLoadedData(d));renderAll({forceAll:true});const before=NK_PRO_MODULES.costReconciliation.model(state,{});NK_PRO_MODULES.costReconciliation.assignRemainingToOpen({fromYear:before.fromYear,toYear:before.toYear,year:before.toYear,updatedBy:'Browsertest'});renderCostReconciliation();const after=NK_PRO_MODULES.costReconciliation.model(state,{});return {before:{control:before.control,open:before.open,status:before.status},after:{control:after.control,open:after.open,status:after.status,statusCode:after.statusCode}};}""",data)
        show_tab(page,'kostenumlagenabgleich','renderCostReconciliation')
        text=page.locator('#kostenumlagenabgleich').inner_text()
        assert abs(status['after']['control']) <= .01 and status['after']['open'] > 0 and status['after']['statusCode']=='open-difference', status
        assert 'Kontrolldifferenz' in text and '0,00 €' in text and 'Offene Differenz vorhanden' in text
        page.screenshot(path=str(out/'02-kontrollrechnung-null-status-offen.png'),full_page=True)
        page.evaluate("costReconciliationOpenAllocation('')"); page.wait_for_timeout(150)
        dialog=page.locator('#kuaAllocationDialog'); assert dialog.get_attribute('open') is not None or dialog.evaluate("el=>el.open")
        assert 'Privatanteil' not in page.locator('#kuaAllocationCategory').all_inner_texts()
        dialog.screenshot(path=str(out/'03-pruefentscheidung-dialog.png'))
        report['dialog']={'open':True,'privateFinancialCategoryAbsent':True}; report['statusControl']=status
        page.evaluate("()=>{const d=document.getElementById('kuaAllocationDialog');if(d&&d.open)d.close();}")
        page.wait_for_timeout(80)

        # Archive correction state: exact accessible text and actual controlled update identity.
        archive_result=page.evaluate("""d=>{
          replaceApplicationState(normalizeLoadedData(d));renderAll({forceAll:true});
          const descriptor=NK_PRO_MODULES.archiveActions.archiveActionDescriptor(state);
          const countBefore=state.jahresArchiv.length;
          const pid=String(state.meta.periodId||'');
          const indexBefore=state.jahresArchiv.findIndex(x=>NK_PRO_MODULES.archiveActions.periodId(x)===pid);
          const confirmation=NK_PRO_MODULES.archiveActions.archiveCurrent({});
          const result=NK_PRO_MODULES.archiveActions.archiveCurrent({confirmed:true});
          const indexAfter=state.jahresArchiv.findIndex(x=>NK_PRO_MODULES.archiveActions.periodId(x)===pid);
          return {descriptor,confirmation,result,countBefore,countAfter:state.jahresArchiv.length,pid,indexBefore,indexAfter,closed:NK_PRO_MODULES.archiveActions.isClosedAfterArchive(state)};
        }""",data)
        assert archive_result['descriptor']['tooltip']=='Archiv aktualisieren.'
        assert archive_result['confirmation']['archiveMode']=='archive-correction'
        assert archive_result['result']['changed'] and archive_result['result']['archiveMode']=='archive-correction'
        assert archive_result['countAfter']==archive_result['countBefore'] and archive_result['indexAfter']>=0 and archive_result['closed']

        # Re-render original correction state for visible tooltip checks.
        page.evaluate("d=>{replaceApplicationState(normalizeLoadedData(d));renderAll({forceAll:true});}",data); show_tab(page,'start')
        correction_buttons=page.locator('#startArchiveTable button[title="Archiv aktualisieren."]')
        assert correction_buttons.count()==1
        assert correction_buttons.first.get_attribute('aria-label')=='Archiv aktualisieren.'
        action_titles=page.locator('#startArchiveTable tr.current-record-row button').evaluate_all("els=>els.map(x=>x.title)")
        assert 'Abrechnungszeitraum ändern' not in action_titles and 'Abrechnung löschen' not in action_titles
        page.screenshot(path=str(out/'04-abrechnungsuebersicht-archivkorrektur.png'),full_page=True)

        # Normal current billing state.
        normal=page.evaluate("""d=>{const n=JSON.parse(JSON.stringify(d));for(const k of Object.keys(n.meta||{})) if(k.startsWith('reopenedFromArchive')||k.startsWith('archiveCorrection')) delete n.meta[k];replaceApplicationState(normalizeLoadedData(n));renderAll({forceAll:true});return NK_PRO_MODULES.archiveActions.archiveCurrent({});}""",data)
        show_tab(page,'start')
        normal_buttons=page.locator('#startArchiveTable button[title="Abrechnung ins Archiv verschieben."]')
        assert normal_buttons.count()==1 and normal_buttons.first.get_attribute('aria-label')=='Abrechnung ins Archiv verschieben.'
        normal_titles=page.locator('#startArchiveTable tr.current-record-row button').evaluate_all("els=>els.map(x=>x.title)")
        assert 'Abrechnungszeitraum ändern' in normal_titles and 'Abrechnung löschen' in normal_titles
        assert normal['archiveMode']=='current-billing' and normal['requiresConfirmation']
        page.screenshot(path=str(out/'05-abrechnungsuebersicht-aktuell.png'),full_page=True)

        # Archived rows expose view + controlled correction only.
        archive_rows=page.locator('#startArchiveTable tr[data-record-kind="archive"]')
        assert archive_rows.count()>=1
        archived_actions=[]
        for i in range(archive_rows.count()):
            titles=archive_rows.nth(i).locator('button').evaluate_all("els=>els.map(x=>x.title)")
            assert titles==['Archivierte Abrechnung ansehen','Korrektur der archivierten Abrechnung starten'], titles
            archived_actions.append(titles)

        # Pure archive viewer is read-only and preserves M000 name/unit.
        viewer=page.evaluate("""d=>{replaceApplicationState(normalizeLoadedData(d));const item=state.jahresArchiv[0];const v=NK_PRO_MODULES.archiveActions.viewerStateFromItem(item);replaceApplicationState(v);renderAll({forceAll:true});const m=state.mieter.find(x=>x.id==='M000');return {archiveViewer:!!state.meta.archiveViewer,name:m&&m.name,unit:m&&m.wohnung,participant:m&&isSettlementParticipant(m)};}""",data)
        assert viewer['archiveViewer'] and viewer['name']=='Erik Zimmermann' and viewer['unit']=='W000.UG' and viewer['participant']
        show_tab(page,'umlage','renderUmlage'); page.screenshot(path=str(out/'06-archivierte-abrechnung-reine-ansicht.png'),full_page=True)

        report['archiveActions']={'correction':archive_result,'normalConfirmation':normal,'correctionVisibleTitles':action_titles,'normalVisibleTitles':normal_titles,'archivedRows':archived_actions,'archiveViewer':viewer}
        all_page_errors.extend(pe); all_console_errors.extend(ce); ctx.close(); browser.close()

    report['pageErrors']=all_page_errors; report['consoleErrors']=all_console_errors
    assert not all_page_errors, all_page_errors
    assert not all_console_errors, all_console_errors
    (out/'UI_BROWSER_VERIFICATION.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    md=['# UI- und Archiv-Browserprüfung V99.4.69','',
        '- Chromium headless über Python Playwright; Anwendung vollständig offline und inlined gestartet.',
        '- Kosten- und Umlagenabgleich bei 1600, 1366, 1024 und 820 Pixeln geprüft: keine horizontale Seitenscrollleiste, keine abgeschnittenen Hauptaktionen.',
        '- Ergebnis-/Statusbereich: Desktop rechts, unter 1180 Pixeln kontrolliert unterhalb der Hauptinhalte.',
        '- Kontrolldifferenz 0,00 € bei gleichzeitig „Offene Differenz vorhanden“ geprüft.',
        '- Prüfentscheidungsdialog geöffnet; keine separate finanzielle Privatanteilskategorie vorhanden.',
        '- Aktuelle Abrechnung: Tooltip/title/aria-label „Abrechnung ins Archiv verschieben.“.',
        '- Kontrollierte Archivkorrektur: Tooltip/title/aria-label „Archiv aktualisieren.“; zugehörige Periodenidentität beim Update erhalten.',
        '- Archivierte Abrechnung: ausschließlich Ansehen und kontrollierte Korrektur angeboten.',
        '- Reine Archivansicht sowie M000 als regulärer Teilnehmer mit Name und Wohnung geprüft.',
        '- JavaScript-Seitenfehler und Konsolenfehler: 0.','']
    (out/'UI_BROWSER_TESTBERICHT.md').write_text('\n'.join(md),encoding='utf-8')
    print(json.dumps({'ok':True,'out':str(out),'layouts':list(report['layouts']),'archiveMode':report['archiveActions']['correction']['result']['archiveMode']},ensure_ascii=False))
    return 0

if __name__=='__main__': raise SystemExit(main())
