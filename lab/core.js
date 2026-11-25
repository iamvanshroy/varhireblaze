/* VB Lab core: shared helpers, experience list and the full-screen stage. Used by lab.html and the homepage. */
(function(){"use strict";
/* ---------- VB Lab core ---------- */
var LAB=[
 {cat:"create",k:"pixel",n:"VB Pixel Studio",d:"Draw pixel art with mirror mode, fill and a VB palette. Save it to your gallery or download a PNG.",ic:"🎨",bg:"linear-gradient(135deg,#ff6a00,#7a1f00)"},
 {cat:"create",k:"sound",n:"VB Sound Machine",d:"Make beats on a 16-step sequencer with synth drums, bass and leads. Share your beat as a link.",ic:"🎛️",bg:"linear-gradient(135deg,#a66bff,#24124d)"},
 {cat:"create",k:"studio",n:"VB Game Studio",d:"Build your own platformer level, play it, then send it to a friend as a link.",ic:"🕹️",bg:"linear-gradient(135deg,#3de8ff,#0b3b4d)"},
 {cat:"play",k:"pets",n:"VB Pet Universe",d:"Hatch, name, feed and play with your own pet. It grows up and evolves the more you care for it.",ic:"🥚",bg:"linear-gradient(135deg,#9dff3d,#1e4d0b)"},
 {cat:"play",k:"aquarium",n:"VB Aquarium",d:"Buy fish with your VB coins, decorate the tank and feed them. Your tank is saved on this device.",ic:"🐠",bg:"linear-gradient(135deg,#3da2ff,#0b1f4d)"},
 {cat:"play",k:"survival",n:"VB Survival Mode",d:"Dodge everything for as long as you can. Same arena for everyone today, with a daily global top 10.",ic:"🛡️",bg:"linear-gradient(135deg,#ff3d5e,#4d0b17)"},
 {cat:"play",k:"brain",n:"Daily Brain Challenge",d:"Three new tests every day: memory, logic and speed. Keep your streak going.",ic:"🧠",bg:"linear-gradient(135deg,#ff9ad5,#4d0b33)"},
 {cat:"explore",k:"physics",n:"VB Physics Playground",d:"Throw balls, draw ramps, flip gravity and set off explosions in a sandbox built on a custom physics engine.",ic:"🧲",bg:"linear-gradient(135deg,#ffd23f,#4d3b0b)"},
 {cat:"explore",k:"glitch",n:"VB Reality Glitch",d:"Six interactive optical illusions that trick your eyes, then show you how they work.",ic:"🌀",bg:"linear-gradient(135deg,#ffffff,#3a3a46)"},
 {cat:"explore",k:"museum",n:"Dead Internet Museum",d:"Walk through five rooms of old-school web design: under-construction pages, glossy buttons and skip-intro splash screens.",ic:"🏛️",bg:"linear-gradient(135deg,#00a0a0,#0b2b2b)"},
 {cat:"explore",k:"sixty",n:"60-Second Universe",d:"A different tiny interactive world every minute. Everyone sees the same one at the same time.",ic:"⏱️",bg:"linear-gradient(135deg,#ff6a00,#a66bff)"},
 {cat:"explore",k:"secret",n:"VB Secret Internet",d:"Hidden pages and unlockable secrets around the site. How many can you find?",ic:"🗝️",bg:"linear-gradient(135deg,#2a2a33,#000)"},
 {cat:"compete",k:"records",n:"VB World Records",d:"The #1 score in every game on VarHireBlaze. Beat one and your name goes up here.",ic:"🏆",bg:"linear-gradient(135deg,#ffd23f,#7a4d00)"},
 {cat:"compete",k:"cards",n:"VB Trading Cards",d:"Open packs, collect 36 cards across four rarities and chase the holographic legendaries.",ic:"🃏",bg:"linear-gradient(135deg,#ff3d5e,#a66bff)"},
 {cat:"compete",k:"master",n:"VB Game Master",d:"Get a custom challenge for any game. Beat it to earn bonus coins.",ic:"🎲",bg:"linear-gradient(135deg,#2bd46b,#0b4d2b)"}
];
var CATS=[["create","Create.","Make something of your own."],["play","Play.","Look after something, or survive something."],["explore","Explore.","Poke at it and see what happens."],["compete","Compete & collect.","Records, rare cards and challenges."]];
var VBLab=window.VBLab={mods:{},reg:function(k,def){this.mods[k]=def}};
function ls(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
VBLab.ls=ls;VBLab.ss=ss;
VBLab.coins={get:function(){return ls("vhb_coins",0)},add:function(n){ss("vhb_coins",VBLab.coins.get()+n);if(n>0)ss("vhb_coins_total",ls("vhb_coins_total",0)+n);paintCoins()},spend:function(n){if(VBLab.coins.get()<n)return false;ss("vhb_coins",VBLab.coins.get()-n);paintCoins();return true}};
function paintCoins(){document.querySelectorAll("[data-labcoins]").forEach(function(el){el.textContent=VBLab.coins.get().toLocaleString("en-IN")})}
VBLab.toast=function(m){var el=document.getElementById("vbToast");el.innerHTML=m;el.classList.add("on");clearTimeout(el._t);el._t=setTimeout(function(){el.classList.remove("on")},2600)};
VBLab.today=function(){var d=new Date();return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)};
VBLab.rng=function(seed){var h=1779033703^String(seed).length;for(var i=0;i<String(seed).length;i++){h=Math.imul(h^String(seed).charCodeAt(i),3432918353);h=h<<13|h>>>19}return function(){h=Math.imul(h^h>>>16,2246822507);h=Math.imul(h^h>>>13,3266489909);return((h^=h>>>16)>>>0)/4294967296}};
var AC=null;VBLab.audio=function(){if(!AC){try{AC=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}if(AC&&AC.state==="suspended")AC.resume();return AC};
VBLab.beep=function(f,f2,d,type,vol){var a=VBLab.audio();if(!a)return;var o=a.createOscillator(),g=a.createGain(),t=a.currentTime;o.type=type||"sine";o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+d);g.gain.setValueAtTime(vol||0.08,t);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+d+0.02)};
VBLab.secret=function(id,name){if(window.VBSecrets)return VBSecrets.found(id,name);var s=ls("vb_secrets",{});if(s[id])return;s[id]=Date.now();ss("vb_secrets",s);VBLab.coins.add(25);VBLab.toast("🗝️ Secret found: <b>"+name+"</b> · +25 🪙")};
/* daily global board (survival, brain) */
VBLab.esc=function(x){return String(x).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})};
VBLab.board=function(el,game,score,unit){var day=VBLab.today(),nick=ls("vhb_nick","");
  function list(top){if(!top.length)return '<p class="lab-mut">No scores yet today. Be the first!</p>';return '<ol style="list-style:none;display:grid;gap:4px">'+top.map(function(r,i){var me=r.name===ls("vhb_nick","");return '<li style="display:flex;justify-content:space-between;padding:6px 10px;border-radius:10px;background:'+(me?"rgba(255,106,0,.18)":"#15151b")+'"><span>'+(i<3?["🥇","🥈","🥉"][i]:(i+1)+".")+' '+VBLab.esc(r.name)+'</span><b>'+unit(r.score)+'</b></li>'}).join("")+'</ol>'}
  el.innerHTML=(score>0?'<form class="lab-row" style="margin-bottom:10px"><input class="lab-in" maxlength="14" placeholder="Nickname" value="'+VBLab.esc(nick)+'" style="flex:1;min-width:120px"><button class="lab-btn pri">Post '+unit(score)+' 🌍</button></form><p class="lab-mut" data-m style="min-height:20px"></p>':'')+'<div data-b><p class="lab-mut">Loading today\'s top 10…</p></div>';
  var b=el.querySelector("[data-b]"),m=el.querySelector("[data-m]"),f=el.querySelector("form");
  function err(j){return j&&j.error||"Leaderboard unavailable right now."}
  fetch("/api/leaderboard?game="+game+"&day="+day).then(function(r){return r.json().then(function(j){if(!r.ok)throw err(j);return j})}).then(function(j){b.innerHTML=list(j.top||[])}).catch(function(e){b.innerHTML='<p class="lab-mut">'+VBLab.esc(typeof e==="string"?e:"You\'re offline.")+'</p>'});
  if(f)f.onsubmit=function(e){e.preventDefault();var n=f.querySelector("input").value.trim();if(n.length<2){m.textContent="Nickname needs at least 2 characters.";return}f.querySelector("button").disabled=true;m.textContent="Posting…";
    fetch("/api/leaderboard",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({game:game,name:n,score:score,day:day})}).then(function(r){return r.json().then(function(j){if(!r.ok)throw err(j);return j})})
    .then(function(j){ss("vhb_nick",n);f.remove();m.innerHTML=j.rank?"You're <b>#"+j.rank+"</b> in the world today!":"Posted!";b.innerHTML=list(j.top||[])}).catch(function(e){m.textContent=typeof e==="string"?e:"You\'re offline.";f.querySelector("button").disabled=false})}};
VBLab.fitCanvas=function(cv,w,h){var d=Math.min(window.devicePixelRatio||1,2);cv.width=w*d;cv.height=h*d;var c=cv.getContext("2d");c.setTransform(d,0,0,d,0,0);return c};
VBLab.pos=function(cv,e,w,h){var r=cv.getBoundingClientRect();return{x:(e.clientX-r.left)/r.width*w,y:(e.clientY-r.top)/r.height*h}};


/* ---------- stage + lazy module loading ---------- */
if(!document.getElementById("vbStage")){var sd=document.createElement("div");sd.className="stage";sd.id="vbStage";sd.setAttribute("role","dialog");sd.setAttribute("aria-modal","true");sd.setAttribute("aria-labelledby","vbStTitle");
  sd.innerHTML='<div class="st-bar"><button class="btn btn-g back" id="vbStBack">← Back</button><h2 id="vbStTitle">VB Lab</h2><span id="vbStShare"></span><span class="coinpill">🪙 <span data-labcoins>0</span></span></div><div class="st-body" id="vbStBody"></div>';document.body.appendChild(sd)}
if(!document.getElementById("vbToast")){var td=document.createElement("div");td.className="vb-toast";td.id="vbToast";document.body.appendChild(td)}
var stage=document.getElementById("vbStage"),body=document.getElementById("vbStBody"),cur=null,cleanup=null,openedFrom=null;
function load(k,cb){if(VBLab.mods[k])return cb();var s=document.createElement("script");s.src="/lab/"+k+".js?v=1";s.onload=cb;s.onerror=function(){body.innerHTML='<div class="st-load">Could not load. Check your connection and try again.</div>'};document.body.appendChild(s)}
function open(k,push){var meta=LAB.filter(function(x){return x.k===k})[0];if(!meta)return;close(true);cur=k;
  document.getElementById("vbStTitle").textContent=meta.n;document.getElementById("vbStShare").innerHTML=window.VBShare?VBShare.row({title:meta.n,text:"Try "+meta.n+" on VarHireBlaze ✨ Free, no login:",url:"/lab.html#"+k}):"";
  body.innerHTML='<div class="st-load">Loading '+meta.n+'…</div>';stage.classList.add("on");document.body.style.overflow="hidden";
  if(push!==false)try{history.pushState({k:k},"","#"+k)}catch(e){}
  var seen=ls("vb_lab_seen",{});seen[k]=1;ss("vb_lab_seen",seen);if(Object.keys(seen).length>=15)VBLab.secret("lab15","Lab Rat (opened all 15)");
  load(k,function(){if(cur!==k)return;body.innerHTML="";var root=document.createElement("div");body.appendChild(root);try{cleanup=VBLab.mods[k].mount(root,VBLab)||null}catch(e){body.innerHTML='<div class="st-load">Something went wrong. Please reload.</div>';console.error(e)}})}
function close(silent){if(cleanup){try{cleanup()}catch(e){}cleanup=null}cur=null;body.innerHTML="";if(!silent){stage.classList.remove("on");document.body.style.overflow=""}}
document.getElementById("vbStBack").addEventListener("click",function(){close();try{history.pushState(null,"",location.pathname+location.search)}catch(e){}});
document.addEventListener("click",function(e){var t=e.target.closest("[data-open]");if(t){e.preventDefault();open(t.dataset.open)}});
document.addEventListener("keydown",function(e){if(e.key==="Enter"&&e.target.matches&&e.target.matches("[data-open]"))open(e.target.dataset.open);if(e.key==="Escape"&&stage.classList.contains("on")&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))document.getElementById("vbStBack").click()});
window.addEventListener("popstate",function(){var k=location.hash.slice(1).split("?")[0];if(k&&VBLab.mods!==undefined&&LAB.some(function(x){return x.k===k}))open(k,false);else if(cur)close()});
var h0=location.hash.slice(1).split("?")[0];if(LAB.some(function(x){return x.k===h0}))open(h0,false);

VBLab.open=open;VBLab.close=close;VBLab.LAB=LAB;VBLab.CATS=CATS;
paintCoins();
})();
