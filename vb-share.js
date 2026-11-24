/* VB share buttons: WhatsApp, X, Instagram, SMS. Usage: VBShare.row({title,text,url}) -> HTML; buttons work via event delegation. */
(function(){
"use strict";
var IC={
  wa:'<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1-.7-.3-1.4-.7-2-1.3-.5-.5-1-1.1-1.3-1.7-.1-.2 0-.4.1-.5l.4-.5.2-.4v-.4l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.6.6-.9 1.3-.9 2.1.1.9.4 1.8 1 2.6 1.1 1.6 2.5 2.9 4.2 3.6.4.2.9.3 1.3.4.5.1 1.1.1 1.6 0 .6-.1 1.2-.5 1.5-1 .2-.3.2-.7.1-1.1z"/></svg>',
  x:'<svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true"><path fill="currentColor" d="M17.8 3h3.1l-6.8 7.8L22 21h-6.2l-4.9-6.4L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5z"/></svg>',
  ig:'<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M12 7.3A4.7 4.7 0 1 0 12 16.7 4.7 4.7 0 0 0 12 7.3zm0 7.7a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm6-7.9a1.1 1.1 0 1 1-2.2 0 1.1 1.1 0 0 1 2.2 0zM12 3.6c2.7 0 3 0 4.1.1 2.6.1 3.8 1.4 4 4 .1 1 .1 1.4.1 4.1s0 3-.1 4.1c-.1 2.6-1.4 3.8-4 4-1 .1-1.4.1-4.1.1s-3 0-4.1-.1c-2.6-.1-3.8-1.4-4-4C3.8 15 3.8 14.7 3.8 12s0-3 .1-4.1c.1-2.6 1.4-3.8 4-4 1-.1 1.4-.1 4.1-.1zM12 2c-2.7 0-3.1 0-4.1.1C4.3 2.2 2.3 4.2 2.1 7.9 2 8.9 2 9.3 2 12s0 3.1.1 4.1c.2 3.6 2.2 5.6 5.8 5.8 1 .1 1.4.1 4.1.1s3.1 0 4.1-.1c3.6-.2 5.6-2.2 5.8-5.8.1-1 .1-1.4.1-4.1s0-3.1-.1-4.1c-.2-3.6-2.2-5.6-5.8-5.8C15.1 2 14.7 2 12 2z"/></svg>',
  sms:'<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><path fill="currentColor" d="M4 3h16a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2zm3 7a1.3 1.3 0 1 0 0 2.6A1.3 1.3 0 0 0 7 10zm5 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6zm5 0a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6z"/></svg>'
};
var NAME={wa:"WhatsApp",x:"X (Twitter)",ig:"Instagram",sms:"SMS"};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function abs(u){try{return new URL(u||location.href,location.href).href}catch(e){return location.href}}
function toast(msg){var el=document.getElementById("vbShareToast");if(!el){el=document.createElement("div");el.id="vbShareToast";el.style.cssText="position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#15151d;border:1px solid rgba(255,106,0,.55);color:#f4f4f6;padding:10px 18px;border-radius:999px;font:500 14px Inter,sans-serif;z-index:200;opacity:0;transition:.3s;pointer-events:none;max-width:92vw;text-align:center";document.body.appendChild(el)}
  el.textContent=msg;el.style.opacity="1";clearTimeout(el._t);el._t=setTimeout(function(){el.style.opacity="0"},2600)}
function share(kind,o){o=o||{};var url=abs(o.url),text=(o.text||"Play free on VarHireBlaze")+" "+url,t=encodeURIComponent(text);
  if(kind==="ig"){if(navigator.share){navigator.share({title:o.title||"VarHireBlaze",text:o.text||"",url:url}).catch(function(){})}
    else{try{navigator.clipboard.writeText(text)}catch(e){}window.open("https://www.instagram.com/","_blank","noopener");toast("Link copied. Paste it in your Insta story or DM 📋")}return}
  var links={wa:"https://wa.me/?text="+t,x:"https://twitter.com/intent/tweet?text="+t,sms:"sms:?&body="+t};
  var w=window.open(links[kind],"_blank","noopener");if(!w&&kind!=="sms")location.href=links[kind];if(kind==="sms"&&!w)location.href=links.sms}
function row(o,cls){return '<div class="vbshare '+(cls||"")+'" data-vbshare="'+esc(JSON.stringify(o))+'">'+["wa","x","ig","sms"].map(function(k){return '<button type="button" class="vbs vbs-'+k+'" data-k="'+k+'" aria-label="Share on '+NAME[k]+'" title="Share on '+NAME[k]+'">'+IC[k]+'</button>'}).join("")+'</div>'}
var css='.vbshare{display:inline-flex;gap:6px;align-items:center}.vbs{width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.05);color:#e8e8ee;display:inline-grid;place-items:center;cursor:pointer;transition:transform .2s,background .2s,color .2s;padding:0}.vbs:hover{transform:translateY(-2px)}.vbs-wa:hover{background:#1fae54;color:#fff;border-color:#1fae54}.vbs-x:hover{background:#000;color:#fff;border-color:#555}.vbs-ig:hover{background:linear-gradient(45deg,#f58529,#dd2a7b,#8134af);color:#fff;border-color:transparent}.vbs-sms:hover{background:#2b2b36;color:#fff}';
var st=document.createElement("style");st.textContent=css;document.head.appendChild(st);
document.addEventListener("click",function(e){var b=e.target.closest(".vbs");if(!b)return;var r=b.closest("[data-vbshare]");if(!r)return;e.preventDefault();e.stopPropagation();var o={};try{o=JSON.parse(r.getAttribute("data-vbshare"))}catch(err){}share(b.dataset.k,o)},true);
["pointerdown","keydown"].forEach(function(ev){document.addEventListener(ev,function(e){if(e.target.closest&&e.target.closest(".vbs"))e.stopPropagation()},true)});
window.VBShare={row:row,share:share,toast:toast};
})();
