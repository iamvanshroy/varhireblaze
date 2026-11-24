/* VB Secret Internet: hidden easter eggs across VarHireBlaze. Progress is saved on this device only. */
(function(){
"use strict";
function ls(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function toast(html){var el=document.getElementById("vbSecToast");if(!el){el=document.createElement("div");el.id="vbSecToast";el.style.cssText="position:fixed;left:50%;top:18px;transform:translate(-50%,-20px);opacity:0;z-index:9999;background:#111116;color:#f5f5f7;border:1px solid rgba(255,210,63,.6);box-shadow:0 20px 50px rgba(0,0,0,.6);padding:11px 18px;border-radius:999px;font:500 14px Inter,system-ui,sans-serif;transition:.4s cubic-bezier(.2,.8,.2,1);pointer-events:none;max-width:92vw;text-align:center";document.body.appendChild(el)}
  el.innerHTML=html;el.style.opacity=1;el.style.transform="translate(-50%,0)";clearTimeout(el._t);el._t=setTimeout(function(){el.style.opacity=0;el.style.transform="translate(-50%,-20px)"},3200)}
function found(id,name){var s=ls("vb_secrets",{});if(s[id])return;s[id]=Date.now();ss("vb_secrets",s);ss("vhb_coins",ls("vhb_coins",0)+25);ss("vhb_coins_total",ls("vhb_coins_total",0)+25);
  document.querySelectorAll("[data-coins],[data-labcoins]").forEach(function(el){el.textContent=ls("vhb_coins",0).toLocaleString("en-IN")});
  toast("🗝️ Secret found: <b>"+name+"</b> · +25 🪙 · <a href='/lab.html#secret' style='color:#ffd23f;pointer-events:auto'>see all</a>")}
window.VBSecrets={found:found};
/* typed codes */
var buf="",KON=["ArrowUp","ArrowUp","ArrowDown","ArrowDown","ArrowLeft","ArrowRight","ArrowLeft","ArrowRight","b","a"],kp=0;
document.addEventListener("keydown",function(e){var tg=e.target&&e.target.tagName;if(/INPUT|TEXTAREA|SELECT/.test(tg))return;
  var k=e.key&&e.key.length===1?e.key.toLowerCase():e.key;kp=(k===KON[kp])?kp+1:(k===KON[0]?1:0);if(kp===KON.length){kp=0;found("konami","The Classic Code");document.documentElement.animate([{filter:"hue-rotate(0)"},{filter:"hue-rotate(360deg)"}],{duration:1600})}
  if(e.key&&e.key.length===1){buf=(buf+e.key.toLowerCase()).slice(-12);if(/vansh$/.test(buf))found("vansh","Say My Name");if(/blaze$/.test(buf))found("console","Console Whisperer");if(/hireme$/.test(buf)){found("hireme","Hire Me Please");document.body.animate([{transform:"rotate(0)"},{transform:"rotate(1deg)"},{transform:"rotate(-1deg)"},{transform:"rotate(0)"}],{duration:500})}}});
/* logo tapped 7 times */
var taps=0,tt=0;document.addEventListener("click",function(e){var b=e.target.closest&&e.target.closest(".brand,.logo,nav a[href='/']");if(!b)return;var now=Date.now();taps=now-tt<1200?taps+1:1;tt=now;if(taps>=7){e.preventDefault();taps=0;found("logo","Logo Tapper")}},true);
/* triple-click the views pill */
document.addEventListener("click",function(e){var v=e.target.closest&&e.target.closest("#views,.views,[data-views]");if(v&&e.detail>=3)found("views","Counter Curious")});
/* night owl */
var h=new Date().getHours();if(h>=0&&h<4)setTimeout(function(){found("night","Night Owl (visited after midnight)")},2500);
/* deep reader: scroll to the very end of any blog post */
if(/\/blog\//.test(location.pathname)){window.addEventListener("scroll",function f(){if(window.innerHeight+window.scrollY>=document.body.scrollHeight-4){found("reader","Deep Reader");window.removeEventListener("scroll",f)}},{passive:true})}
/* the vault */
if(/vb-vault/.test(location.pathname))setTimeout(function(){found("vault","The Vault")},800);
/* console hint for curious developers */
try{console.log("%cVB%c  Hey, developer. Type the word  blaze  anywhere on this page for a secret. 🔥  — Vansh","background:#ff6a00;color:#000;font:700 14px sans-serif;padding:3px 8px;border-radius:6px","color:#ff9a3c;font:600 13px sans-serif")}catch(e){}
})();
