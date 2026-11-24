/* VB World Records — the real #1 score for every game, read live from the global leaderboards. */
VBLab.reg("records",{mount:function(root,L){
  var HUB=window.VHBHub,HG=window.HireGames,NAMES=(HUB&&HUB.NAMES)||{};
  var ORDER=["wfh","boss","jam","grind","apex","drift","pulse","rope","gradient","horde","flip","photon","racer","surfers","cricket","flight","cart","football","flappy","rush","pong","snake","breakout","invaders","salary","memory","catch"];
  var GROUP={wfh:"Office Life",boss:"Office Life",jam:"Office Life",grind:"Office Life",apex:"Neon",drift:"Neon",pulse:"Neon",rope:"Neon",gradient:"Neon",horde:"Neon",flip:"Neon",photon:"Neon"};
  ORDER=ORDER.filter(function(k){return NAMES[k]});
  root.innerHTML='<div class="lab-pad"><div class="lab-row" style="justify-content:space-between;margin-bottom:6px"><div><div class="lab-h">VB World Records</div><p class="lab-mut">The #1 score in every VarHireBlaze game, live from the global leaderboards. Beat one and your nickname takes its place.</p></div>'+
   '<div class="lab-row"><button class="lab-btn on" data-f="all">All</button><button class="lab-btn" data-f="Office Life">Office Life</button><button class="lab-btn" data-f="Neon">Neon</button><button class="lab-btn" data-f="Hire">Hire Games</button></div></div>'+
   '<p class="lab-mut" id="wrStat" style="margin:10px 0 16px">Loading records…</p><div id="wrG" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px"></div></div>';
  var recs={},filter="all",G=root.querySelector("#wrG");
  function best(k){return HG&&HG.getBest?HG.getBest(k):0}
  function paint(){var list=ORDER.filter(function(k){var g=GROUP[k]||"Hire";return filter==="all"||g===filter});var claimed=ORDER.filter(function(k){return recs[k]}).length;
    root.querySelector("#wrStat").innerHTML=claimed+" of "+ORDER.length+" records claimed"+(claimed<ORDER.length?" · <span style='color:#ff9a3c'>unclaimed records are free for the taking</span>":"");
    G.innerHTML=list.map(function(k){var r=recs[k],mine=best(k),me=r&&r.name===L.ls("vhb_nick","");return '<a href="/games.html#'+k+'" class="lab-card" style="display:block;transition:.25s;'+(me?"border-color:rgba(255,210,63,.6)":"")+'"><div class="lab-row" style="justify-content:space-between"><small class="lab-mut" style="font-size:11px;letter-spacing:.1em;text-transform:uppercase">'+(GROUP[k]||"Hire Games")+'</small>'+(me?'<span style="font-size:12px;color:#ffd23f">👑 Yours</span>':'')+'</div>'+
      '<b style="font-size:18px;display:block;margin:4px 0 8px">'+L.esc(NAMES[k])+'</b>'+(r?'<div style="font:700 28px Space Grotesk;color:#ffd23f">'+r.score.toLocaleString("en-IN")+'</div><div class="lab-mut" style="font-size:13px">🏆 held by <b style="color:#fff">'+L.esc(r.name)+'</b></div>':'<div style="font:700 22px Space Grotesk;color:#8e8e99">Unclaimed</div><div class="lab-mut" style="font-size:13px">Post any score to take it</div>')+
      '<div class="lab-row" style="justify-content:space-between;margin-top:10px;font-size:13px"><span class="lab-mut">Your best: <b style="color:#fff">'+mine.toLocaleString("en-IN")+'</b></span><span style="color:#ff9a3c;font-weight:600">Play ›</span></div></a>'}).join("")}
  root.querySelectorAll("[data-f]").forEach(function(b){b.onclick=function(){filter=b.dataset.f;root.querySelectorAll("[data-f]").forEach(function(x){x.classList.toggle("on",x===b)});paint()}});
  paint();
  fetch("/api/leaderboard?game=all").then(function(r){return r.json().then(function(j){if(!r.ok)throw j.error;return j})}).then(function(j){recs=j.records||{};paint()})
    .catch(function(e){root.querySelector("#wrStat").textContent=typeof e==="string"?e:"Records are unavailable right now. Check your connection."});
  return function(){}
}});
