"use strict";
const fs=require("fs"),os=require("os"),path=require("path"),{spawn}=require("child_process");
const candidates=[process.env.CHROMIUM_BIN,"/usr/bin/chromium","/usr/bin/chromium-browser","/usr/bin/google-chrome"].filter(Boolean);
const chromium=candidates.find(p=>fs.existsSync(p));
if(!chromium){console.error("Kein lokaler Chromium/Chrome für V99.4.70-Browsertest gefunden.");process.exit(2);}
const port=9237+Math.floor(Math.random()*300);
const profile=fs.mkdtempSync(path.join(os.tmpdir(),"nkpro-v99470-"));
const args=["--headless=new","--no-sandbox","--disable-dev-shm-usage","--disable-gpu","--disable-background-networking","--disable-default-apps","--disable-extensions","--disable-sync","--no-first-run","--remote-debugging-address=127.0.0.1",`--remote-debugging-port=${port}`,`--user-data-dir=${profile}`,"about:blank"];
const browser=spawn(chromium,args,{stdio:["ignore","ignore","ignore"]});
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function waitReady(){for(let i=0;i<120;i++){try{const r=await fetch(`http://127.0.0.1:${port}/json/version`);if(r.ok)return;}catch{}await sleep(100);}throw new Error("Chromium DevTools wurde nicht erreichbar.");}
(async()=>{let child;try{await waitReady();child=spawn(process.execPath,[path.join(__dirname,"v99470-cdp-browser-test.cjs")],{stdio:"inherit",env:{...process.env,NKPRO_CDP_PORT:String(port)}});const code=await new Promise((resolve,reject)=>{child.on("exit",c=>resolve(c??1));child.on("error",reject);});process.exitCode=code;}catch(e){console.error(e);process.exitCode=1;}finally{try{child&&child.kill("SIGKILL");}catch{}try{browser.kill("SIGKILL");}catch{}try{fs.rmSync(profile,{recursive:true,force:true});}catch{}}})();
