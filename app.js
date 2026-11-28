/* VarHireBlaze app install: registers the service worker and powers the "Get the app" buttons. */
(function(){
  if ("serviceWorker" in navigator) addEventListener("load", function(){ navigator.serviceWorker.register("/sw.js").catch(function(){}); });
  var deferred = null, ua = navigator.userAgent || "";
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var isAndroid = /Android/i.test(ua);
  var standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  addEventListener("beforeinstallprompt", function(e){ e.preventDefault(); deferred = e; paint(); });
  addEventListener("appinstalled", function(){ try{gtag("event","app_installed")}catch(e){}  deferred = null; standalone = true; paint(); toast("🎉 VarHireBlaze is installed. Find it on your home screen."); });
  function toast(m){ var t=document.createElement("div"); t.textContent=m; t.style.cssText="position:fixed;left:50%;bottom:22px;transform:translateX(-50%);z-index:9999;background:#15151d;color:#fff;border:1px solid rgba(255,106,0,.5);padding:11px 18px;border-radius:999px;font:500 14px Inter,system-ui,sans-serif;max-width:92vw;text-align:center"; document.body.appendChild(t); setTimeout(function(){t.remove()},3500); }
  function paint(){
    document.querySelectorAll("[data-app-state]").forEach(function(el){
      el.textContent = standalone ? "✅ You're using the app" : deferred ? "Install now. It's free" : isIOS ? "On iPhone? Use the steps below" : isAndroid ? "Open in Chrome to install" : "Install from Chrome or Edge";
    });
    document.querySelectorAll("[data-install]").forEach(function(b){ b.disabled = standalone; if (standalone) b.textContent = "✅ Installed"; });
  }
  document.addEventListener("click", function(e){
    var b = e.target.closest && e.target.closest("[data-install]"); if (!b) return;
    e.preventDefault();
    if (deferred) { deferred.prompt(); deferred.userChoice.then(function(){ deferred = null; paint(); }); return; }
    var steps = document.getElementById(isIOS ? "appIOS" : "appAndroid");
    if (b.dataset.install === "ios" || isIOS) steps = document.getElementById("appIOS");
    if (steps) { steps.scrollIntoView({behavior:"smooth", block:"center"}); steps.classList.remove("flash"); void steps.offsetWidth; steps.classList.add("flash"); }
    else toast(isIOS ? "In Safari, tap Share, then Add to Home Screen" : "In Chrome, open the ⋮ menu, then tap Install app");
  });
  if (document.readyState !== "loading") paint(); else document.addEventListener("DOMContentLoaded", paint);
})();
