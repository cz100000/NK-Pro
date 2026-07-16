"use strict";
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=f=>fs.readFileSync(path.join(root,f),"utf8");
const assert=(v,m)=>{if(!v)throw new Error(m);};
const css=read("assets/app.css"),html=read("index.html"),js=read("js/ui-design-system.js"),project=JSON.parse(read("nk-pro-project.json"));
assert(css.includes("AP22A: zentrale UI-Bibliothek"),"AP22A-CSS-Fundament fehlt.");
for(const token of ["--nk-ui-color-accent","--nk-ui-space-md","--nk-ui-radius-lg","--nk-ui-control-height"]){assert(css.includes(token),`Token fehlt: ${token}`);}
for(const component of [".nk-ui-button",".nk-ui-field",".nk-ui-card",".nk-ui-accordion",".nk-ui-table",".nk-ui-status",".nk-ui-notice",".nk-ui-toolbar",".nk-ui-dialog",".nk-ui-empty-state"]){assert(css.includes(component),`Komponente fehlt: ${component}`);}
assert(html.includes('./js/ui-design-system.js?v=99.4.29-ap22a'),"UI-Bibliothek wird nicht geladen.");
assert(js.includes("global.NKProUIDesignSystem")&&js.includes("const COMPONENTS = Object.freeze")&&js.includes("function statusVariant"),"UI-Bibliotheks-API ist unvollständig.");
assert(project.uiDesignSystemVersion===1,"UI-Design-System-Version fehlt.");
console.log("AP22A UI-Bibliotheks-Fundament: bestanden.");
