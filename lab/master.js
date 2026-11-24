/* VB Game Master — AI-written challenges (Groq via /api/gamemaster) with a built-in offline generator. */
VBLab.reg("master",{mount:function(root,L){
  var HUB=window.VHBHub,HG=window.HireGames,NAMES=(HUB&&HUB.NAMES)||{},keys=Object.keys(NAMES);
  var UNIT={boss:"chill points",jam:"metres",grind:"metres",racer:"points",cricket:"runs",football:"points",apex:"points",drift:"points"};
  var MOODS=[["chill","😌 Chill",20],["spicy","🌶️ Spicy",40],["chaotic","🌀 Chaotic",70],["pro","🧠 Pro",120]];
  var mood="spicy",game=keys.indexOf("wfh")>=0?"wfh":keys[0],pending=null;
  function best(k){return HG&&HG.getBest?HG.getBest(k):0}
  function unit(k){return UNIT[k]||"points"}
  function local(k,m){var b=best(k),mult={chill:.8,spicy:1.1,chaotic:1.35,pro:1.75}[m],target=Math.max(b?Math.ceil(b*mult):({chill:5,spicy:10,chaotic:20,pro:40})[m],1);
    var T=[["The Comeback","Your last interviewer said you lack drive. Prove them wrong: hit "+target+" "+unit(k)+" in one run."],["Monday Energy","It's Monday, the coffee machine is broken, and you still need "+target+" "+unit(k)+". Go."],
      ["Overqualified","Recruiters say you're too good for this. Score "+target+" "+unit(k)+" and make it official."],["Notice Period","You have one run to show your boss what you're worth: "+target+" "+unit(k)+"."],
      ["Promotion Season","Beat "+target+" "+unit(k)+" and the corner office is basically yours."],["Out of Office","Auto-reply on. Phone on silent. Only goal: "+target+" "+unit(k)+"."]];
    var t=T[Math.floor(Math.random()*T.length)];return{title:t[0],text:t[1],target:target,ai:false}}
  root.innerHTML='<div class="lab-pad" style="max-width:820px"><div class="lab-h">VB Game Master</div><p class="lab-mut">Pick a game and a mood. The Game Master writes you a custom challenge based on your best score. Beat it in the real game to earn bonus coins.</p>'+
   '<div class="lab-card" style="margin-top:18px"><label class="lab-mut" style="display:block;margin-bottom:6px">Game</label><select class="lab-in" id="gmG" style="width:100%;margin-bottom:14px">'+keys.map(function(k){return '<option value="'+k+'"'+(k===game?" selected":"")+'>'+L.esc(NAMES[k])+'</option>'}).join("")+'</select>'+
   '<label class="lab-mut" style="display:block;margin-bottom:6px">Mood</label><div class="lab-row" id="gmM" style="margin-bottom:16px">'+MOODS.map(function(m){return '<button class="lab-btn" data-m="'+m[0]+'">'+m[1]+' <small style="opacity:.7">+'+m[2]+'🪙</small></button>'}).join("")+'</div>'+
   '<button class="lab-btn pri" id="gmGo" style="width:100%;padding:13px">🎲 Give me a challenge</button></div>'+
   '<div id="gmOut" style="margin-top:16px"></div><div id="gmAct" style="margin-top:16px"></div>'+
   '<p class="lab-mut" style="margin-top:18px;font-size:12px">How it works: the challenge text is written by an AI model (served through Groq) when it\'s available. Only the game name, your best score and the mood are sent, never anything personal. If AI is busy, a built-in generator takes over. Completed challenges: <b id="gmDone">'+L.ls("vb_gm_done",0)+'</b></p></div>';
  function setM(m){mood=m;root.querySelectorAll("[data-m]").forEach(function(b){b.classList.toggle("on",b.dataset.m===m)})}setM(mood);
  root.querySelector("#gmM").onclick=function(e){var b=e.target.closest("[data-m]");if(b)setM(b.dataset.m)};
  root.querySelector("#gmG").onchange=function(e){game=e.target.value};
  function reward(){return MOODS.filter(function(m){return m[0]===mood})[0][2]}
  function show(ch){pending={game:game,title:ch.title,text:ch.text,target:ch.target,reward:reward(),mood:mood};
    root.querySelector("#gmOut").innerHTML='<div class="lab-card" style="border-color:rgba(43,212,107,.5);animation:stin .45s cubic-bezier(.2,.8,.2,1)"><small class="lab-mut" style="letter-spacing:.1em;text-transform:uppercase;font-size:11px">'+L.esc(NAMES[game])+' · '+mood+(ch.ai?" · ✨ AI":"")+'</small><div style="font:700 26px Space Grotesk;margin:6px 0">'+L.esc(ch.title)+'</div><p style="color:#d6d6de">'+L.esc(ch.text)+'</p>'+
      '<div class="lab-row" style="margin-top:14px;gap:16px"><div><b style="font:700 22px Space Grotesk;color:#ffd23f">'+ch.target.toLocaleString("en-IN")+'</b><br><span class="lab-mut" style="font-size:12px">target ('+unit(game)+')</span></div><div><b style="font:700 22px Space Grotesk;color:#2bd46b">+'+reward()+' 🪙</b><br><span class="lab-mut" style="font-size:12px">reward</span></div><div style="margin-left:auto" class="lab-row"><button class="lab-btn" id="gmRe">🔄 Another</button><button class="lab-btn pri" id="gmAcc">Accept & play ›</button></div></div></div>';
    root.querySelector("#gmRe").onclick=gen;root.querySelector("#gmAcc").onclick=function(){L.ss("vb_gm_active",pending);location.href="/games.html#"+pending.game}}
  function gen(){var btn=root.querySelector("#gmGo");btn.disabled=true;btn.textContent="The Game Master is thinking…";L.beep(300,600,.2,"triangle",.04);
    var done=function(ch){btn.disabled=false;btn.textContent="🎲 Give me a challenge";show(ch)};
    var ctl=window.AbortController?new AbortController():null;var to=setTimeout(function(){if(ctl)ctl.abort()},9000);
    fetch("/api/gamemaster",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({game:game,name:NAMES[game],best:best(game),unit:unit(game),mood:mood}),signal:ctl?ctl.signal:undefined})
      .then(function(r){return r.json().then(function(j){if(!r.ok||!j.title)throw j;return j})}).then(function(j){clearTimeout(to);done(j)}).catch(function(){clearTimeout(to);done(local(game,mood))})}
  root.querySelector("#gmGo").onclick=gen;
  function active(){var a=L.ls("vb_gm_active",null),el=root.querySelector("#gmAct");if(!a){el.innerHTML="";return}
    el.innerHTML='<div class="lab-card"><b>🎯 Your active challenge</b><p style="margin:6px 0">'+L.esc(a.title)+': reach <b style="color:#ffd23f">'+a.target.toLocaleString("en-IN")+'</b> in '+L.esc(NAMES[a.game]||a.game)+' for <b style="color:#2bd46b">+'+a.reward+' 🪙</b></p><div class="lab-row"><a class="lab-btn pri" href="/games.html#'+a.game+'">Play now ›</a><button class="lab-btn" id="gmDrop">Give up</button></div></div>';
    root.querySelector("#gmDrop").onclick=function(){L.ss("vb_gm_active",null);active()}}
  active();
  return function(){}
}});
