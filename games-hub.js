/* VarHireBlaze games hub: coins, skins, achievements and global leaderboards (no login). */
(function(){
"use strict";
var HG=window.HireGames;
function ls(k,d){try{var v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(e){return d}}
function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function fmt(n){return (n|0).toLocaleString("en-IN")}

var NAMES={racer:"Hire Racer",surfers:"Hire Surfers",cricket:"Hire Cricket",flight:"Hire Flight",cart:"Golf Cart Dash",football:"Hire Touchdown",flappy:"Flappy Hire",rush:"Hire Rush",pong:"Resume Pong",
  snake:"Resume Snake",breakout:"Glass Ceiling",invaders:"Spam Invaders",salary:"Salary 2048",memory:"Skill Match",catch:"Catch the Offer"};
(HG.NEON||[]).concat(HG.OFFICE||[]).forEach(function(g){NAMES[g.k]=g.name});
var NEONK=(HG.NEON||[]).map(function(g){return g.k});var SERIESK=NEONK.concat((HG.OFFICE||[]).map(function(g){return g.k}));

/* ---------- wallet ---------- */
var W={coins:function(){return ls("vhb_coins",0)},total:function(){return ls("vhb_coins_total",0)},
  add:function(n){if(n<=0)return;ss("vhb_coins",W.coins()+n);ss("vhb_coins_total",W.total()+n);paint()},
  spend:function(n){if(W.coins()<n)return false;ss("vhb_coins",W.coins()-n);paint();return true}};
function paint(){document.querySelectorAll("[data-coins]").forEach(function(el){el.textContent=fmt(W.coins())});
  var a=ls("vhb_ach",{}),n=Object.keys(a).length;document.querySelectorAll("[data-achn]").forEach(function(el){el.textContent=n+"/"+ACH.length})}

/* ---------- achievements ---------- */
var ACH=[
  {id:"first",n:"First Run",d:"Finish your first game",i:"🎮"},
  {id:"runs10",n:"Regular",d:"Play 10 rounds",i:"🔁"},
  {id:"runs50",n:"Can't Stop",d:"Play 50 rounds",i:"🔥"},
  {id:"coins100",n:"Pocket Money",d:"Earn 100 coins in total",i:"🪙"},
  {id:"coins1000",n:"Coin Magnet",d:"Earn 1,000 coins in total",i:"💰"},
  {id:"skin",n:"Fresh Look",d:"Unlock your first skin",i:"🎨"},
  {id:"explorer",n:"Explorer",d:"Play all 8 Neon Series games",i:"🧭"},
  {id:"board",n:"On the Board",d:"Post a score to a global leaderboard",i:"🌍"}
];
(HG.NEON||[]).concat(HG.OFFICE||[]).forEach(function(g){ACH.push({id:"g_"+g.k,n:g.ach[1],d:g.ach[2],i:"🏆",game:g.k,need:g.ach[0]})});
function unlock(id,out){var a=ls("vhb_ach",{});if(a[id])return;a[id]=Date.now();ss("vhb_ach",a);var def=ACH.filter(function(x){return x.id===id})[0];if(def){out&&out.push(def);toast(def.i+" Achievement: <b>"+esc(def.n)+"</b>")}paint()}

/* ---------- toast ---------- */
var tq=[],tbusy=false;
function toast(html){tq.push(html);if(!tbusy)nextToast()}
function nextToast(){var h=tq.shift();if(!h){tbusy=false;return}tbusy=true;var el=document.getElementById("hubToast");if(!el){el=document.createElement("div");el.id="hubToast";el.className="hub-toast";document.body.appendChild(el)}
  el.innerHTML=h;el.classList.add("on");try{HG.neonSfx&&HG.neonSfx("gate")}catch(e){}setTimeout(function(){el.classList.remove("on");setTimeout(nextToast,350)},2400)}

/* ---------- game over bookkeeping ---------- */
function onGameOver(key,r,isNew){var got=[],neon=SERIESK.indexOf(key)>=0;
  var earned=(r.coins|0)+(neon?Math.min(60,Math.floor((r.score|0)/(key==="apex"?250:key==="drift"?200:key==="pulse"||key==="horde"||key==="wfh"||key==="boss"?100:40))):Math.min(15,2+((r.score|0)>0?3:0)))+(isNew&&(r.score|0)>0?5:0);
  W.add(earned);
  var runs=ls("vhb_runs",0)+1;ss("vhb_runs",runs);unlock("first",got);if(runs>=10)unlock("runs10",got);if(runs>=50)unlock("runs50",got);
  if(W.total()>=100)unlock("coins100",got);if(W.total()>=1000)unlock("coins1000",got);
  if(NEONK.indexOf(key)>=0){var pl=ls("vhb_played",{});pl[key]=1;ss("vhb_played",pl);if(NEONK.every(function(k){return pl[k]}))unlock("explorer",got)}
  ACH.forEach(function(a){if(a.game===key&&(r.score|0)>=a.need)unlock(a.id,got)});
  /* VB Lab hooks: a trading-card pack every 3 runs, and VB Game Master challenges */
  if(runs%3===0){ss("vb_packs",ls("vb_packs",0)+1);setTimeout(function(){toast("🃏 New VB card pack! Open it in <a href='/lab.html#cards' style='color:#ff9a3c'>VB Lab</a>")},1600)}
  var gm=ls("vb_gm_active",null);
  if(gm&&gm.game===key&&(r.score|0)>=gm.target){W.add(gm.reward);earned+=gm.reward;var done=ls("vb_gm_done",0)+1;ss("vb_gm_done",done);ss("vb_gm_active",null);setTimeout(function(){toast("🎲 Game Master challenge beaten: "+esc(gm.title)+" · +"+gm.reward+" 🪙")},900)}
  return{earned:earned,ach:got}}

/* ---------- leaderboard ---------- */
var cache={};
function api(url,opt){return fetch(url,opt).then(function(r){return r.json().catch(function(){return{}}).then(function(j){if(!r.ok)throw new Error(j.error||"Leaderboard unavailable right now.");return j})},function(){throw new Error("You're offline. Scores will post when you're back.")})}
function fetchTop(key){return api("/api/leaderboard?game="+encodeURIComponent(key)).then(function(j){return j.top||[]})}
function listHTML(top,me){if(!top.length)return '<p class="lb-empty">No scores yet. Be the first!</p>';
  return '<ol class="lb-list">'+top.map(function(e,i){return '<li class="'+(me&&e.name===me?"me":"")+'"><span class="r">'+(i+1)+'</span><span class="n">'+esc(e.name)+'</span><span class="s">'+fmt(e.score)+'</span></li>'}).join("")+'</ol>'}
function boardBlock(key,score){var nick=ls("vhb_nick","");
  return '<div class="lb" data-lb="'+key+'">'+(score>0?'<form class="lb-form"><input maxlength="14" placeholder="Your nickname" value="'+esc(nick)+'" aria-label="Nickname"><button class="btn btn-o" type="submit">Post '+fmt(score)+' 🌍</button></form><p class="lb-msg"></p>':'')+
    '<div class="lb-body"><p class="lb-empty">Loading global top 10…</p></div></div>'}
function hydrate(root,key,score){var el=root.querySelector('[data-lb="'+key+'"]');if(!el)return;var body=el.querySelector(".lb-body"),msg=el.querySelector(".lb-msg"),form=el.querySelector(".lb-form");
  fetchTop(key).then(function(top){body.innerHTML=listHTML(top,ls("vhb_nick",""))}).catch(function(e){body.innerHTML='<p class="lb-empty">'+esc(e.message)+'</p>'});
  if(form)form.addEventListener("submit",function(e){e.preventDefault();e.stopPropagation();var name=form.querySelector("input").value.trim();if(name.length<2){msg.textContent="Nickname needs at least 2 characters.";return}
    var b=form.querySelector("button");b.disabled=true;msg.textContent="Posting…";
    api("/api/leaderboard",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({game:key,name:name,score:score})})
      .then(function(j){ss("vhb_nick",name);form.remove();msg.innerHTML=j.rank?"You're <b>#"+j.rank+"</b> worldwide in "+esc(NAMES[key]||key)+"!":"Posted!";body.innerHTML=listHTML(j.top||[],name);unlock("board")})
      .catch(function(err){b.disabled=false;msg.textContent=err.message})});
  ["pointerdown","keydown","click"].forEach(function(ev){el.addEventListener(ev,function(e){e.stopPropagation()})})}

/* ---------- modals ---------- */
function modal(title,html){var m=document.getElementById("hubModal");if(!m){m=document.createElement("div");m.id="hubModal";m.className="hub-modal";document.body.appendChild(m);
    m.addEventListener("click",function(e){if(e.target===m||e.target.closest("[data-close]"))m.classList.remove("on")});
    document.addEventListener("keydown",function(e){if(e.key==="Escape")m.classList.remove("on")})}
  m.innerHTML='<div class="hub-box" role="dialog" aria-modal="true" aria-label="'+esc(title)+'"><div class="hub-head"><h3>'+title+'</h3><button class="hub-x" data-close aria-label="Close">✕</button></div><div class="hub-body">'+html+'</div></div>';
  m.classList.add("on");return m}
function swatch(s){var bg=s.a==="aurora"?"conic-gradient(#ff3d5e,#ffd23f,#9dff3d,#3de8ff,#a66bff,#ff3d5e)":"radial-gradient(circle at 35% 30%,"+s.b+","+s.a+" 70%)";return '<span class="sw" style="background:'+bg+'"></span>'}
function openSkins(){var owned=ls("vhb_skins",["blaze"]),cur=HG.skinId?HG.skinId():"blaze";
  var html='<p class="hub-sub">Skins change your ship, car, cube and Vee\'s scarf in every Neon game. You have <b>🪙 <span data-coins>'+fmt(W.coins())+'</span></b> coins.</p><div class="skin-grid">'+
    HG.SKINS.map(function(s){var own=owned.indexOf(s.id)>=0,eq=cur===s.id;return '<button class="skin'+(eq?" eq":"")+'" data-skin="'+s.id+'">'+swatch(s)+'<b>'+s.name+'</b><small>'+(eq?"Equipped":own?"Tap to equip":"🪙 "+fmt(s.price))+'</small></button>'}).join("")+'</div>';
  var m=modal("🎨 Skins",html);
  m.querySelector(".skin-grid").addEventListener("click",function(e){var b=e.target.closest("[data-skin]");if(!b)return;var id=b.dataset.skin,s=HG.SKINS.filter(function(x){return x.id===id})[0],owned2=ls("vhb_skins",["blaze"]);
    if(owned2.indexOf(id)<0){if(!W.spend(s.price)){b.classList.add("no");setTimeout(function(){b.classList.remove("no")},500);toast("Not enough coins yet. Play a few rounds!");return}owned2.push(id);ss("vhb_skins",owned2);unlock("skin");HG.neonSfx&&HG.neonSfx("power")}
    try{localStorage.setItem("vhb_skin",id)}catch(err){}openSkins()})}
function openAch(){var a=ls("vhb_ach",{});modal("🏆 Achievements",'<p class="hub-sub">'+Object.keys(a).length+' of '+ACH.length+' unlocked. Saved on this device.</p><div class="ach-grid">'+
  ACH.map(function(x){var on=!!a[x.id];return '<div class="ach'+(on?" on":"")+'"><span>'+(on?x.i:"🔒")+'</span><div><b>'+esc(x.n)+'</b><small>'+esc(x.d)+'</small></div></div>'}).join("")+'</div>')}
function openBoards(key){key=key||NEONK[0]||"racer";var opts=Object.keys(NAMES).map(function(k){return '<option value="'+k+'"'+(k===key?" selected":"")+'>'+esc(NAMES[k])+'</option>'}).join("");
  var m=modal("🌍 Global leaderboards",'<select class="lb-sel" aria-label="Choose a game">'+opts+'</select><div class="lb-body"><p class="lb-empty">Loading…</p></div>');
  var body=m.querySelector(".lb-body");function load(k){body.innerHTML='<p class="lb-empty">Loading…</p>';fetchTop(k).then(function(t){body.innerHTML=listHTML(t,ls("vhb_nick",""))}).catch(function(e){body.innerHTML='<p class="lb-empty">'+esc(e.message)+'</p>'})}
  m.querySelector(".lb-sel").addEventListener("change",function(e){load(e.target.value)});load(key)}

window.VHBHub={wallet:W,paint:paint,onGameOver:onGameOver,boardBlock:boardBlock,hydrate:hydrate,openSkins:openSkins,openAch:openAch,openBoards:openBoards,toast:toast,ACH:ACH,NAMES:NAMES};
document.addEventListener("click",function(e){var b=e.target.closest("[data-hub]");if(!b)return;e.preventDefault();var k=b.dataset.hub;if(k==="skins")openSkins();else if(k==="ach")openAch();else if(k==="boards")openBoards(b.dataset.game)});
paint();
})();
