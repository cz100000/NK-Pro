(function(){
  "use strict";
  const triggers=Array.from(document.querySelectorAll("[data-open-dialog]"));
  const dialogs=Array.from(document.querySelectorAll("dialog.dialog"));
  let opener=null;

  function focusable(dialog){
    return Array.from(dialog.querySelectorAll("button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex='-1'])"));
  }
  function openDialog(id,trigger){
    const dialog=document.getElementById(id);
    if(!dialog||typeof dialog.showModal!=="function") return;
    opener=trigger;
    dialog.showModal();
    const items=focusable(dialog);
    if(items.length) items[0].focus();
  }
  function restoreFocus(){
    if(opener&&typeof opener.focus==="function") opener.focus();
    opener=null;
  }
  triggers.forEach(trigger=>trigger.addEventListener("click",()=>openDialog(trigger.dataset.openDialog,trigger)));
  dialogs.forEach(dialog=>{
    dialog.addEventListener("close",restoreFocus);
    dialog.addEventListener("cancel",event=>{
      if(dialog.dataset.protected==="true") event.preventDefault();
    });
    dialog.addEventListener("click",event=>{
      if(event.target===dialog&&dialog.dataset.protected!=="true") dialog.close("backdrop");
    });
    dialog.addEventListener("keydown",event=>{
      if(event.key!=="Tab") return;
      const items=focusable(dialog);
      if(!items.length) return;
      const first=items[0],last=items[items.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
    });
  });
  document.querySelectorAll("form[action='#']").forEach(form=>form.addEventListener("submit",event=>event.preventDefault()));
})();
