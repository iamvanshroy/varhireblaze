/* VB Sound Machine — 16-step WebAudio sequencer, synthesised from scratch, beat saved in the URL */
VBLab.reg("sound",{mount:function(root,L){
  var ROWS=[{n:"Kick",c:"#ff6a00"},{n:"Snare",c:"#ff9a3c"},{n:"Hat",c:"#ffd23f"},{n:"Clap",c:"#ff3d5e"},{n:"Bass",c:"#a66bff"},{n:"Lead A",c:"#3de8ff"},{n:"Lead B",c:"#2bd46b"},{n:"Lead C",c:"#9dff3d"}];
  var STEPS=16,pat,bpm=110,swing=0,playing=false,step=0,timer=null,nextT=0,scale=[0,3,5,7,10],root_=45;
  var PRESETS={
    "Lo-fi":{bpm:84,p:["1000001000100000","0000100000001000","1010101010101011","0000000000000000","1000000010100000","0010000000000100","0000001000000000","0000000000100000"]},
    "Office":{bpm:118,p:["1000100010001000","0000100000001000","0010001000100010","0000000100000001","1001000010010000","1000000100001000","0001000000010000","0000010000000010"]},
    "Hype":{bpm:140,p:["1000100010001010","0000100000001000","1111111111111111","0000100000001001","1010001010100010","1000100000101000","0010000010000010","0000001000000100"]}};
  function empty(){var p=[];for(var r=0;r<ROWS.length;r++){p.push([]);for(var s=0;s<STEPS;s++)p[r].push(0)}return p}
  function fromStr(a){return a.map(function(s){return s.split("").map(Number)})}
  function encode(){return bpm+"."+pat.map(function(r){return parseInt(r.join(""),2).toString(36)}).join(".")}
  function decode(s){try{var a=s.split(".");var b=+a[0];if(!(b>=60&&b<=180)||a.length!==ROWS.length+1)return null;bpm=b;return a.slice(1).map(function(x){var bits=parseInt(x,36).toString(2);while(bits.length<STEPS)bits="0"+bits;return bits.slice(-STEPS).split("").map(Number)})}catch(e){return null}}
  var q=(location.hash.split("?")[1]||"").match(/b=([0-9a-z.]+)/);
  pat=(q&&decode(q[1]))||L.ls("vb_sound_pat",null)||fromStr(PRESETS["Lo-fi"].p);if(!q&&L.ls("vb_sound_bpm",0))bpm=L.ls("vb_sound_bpm",110);
  root.innerHTML='<div class="lab-pad"><div class="lab-row" style="justify-content:space-between;margin-bottom:16px"><div><div class="lab-h">Sound Machine</div><p class="lab-mut">Tap squares to build a loop. Every sound is synthesised live in your browser.</p></div>'+
   '<div class="lab-row"><button class="lab-btn pri" id="smplay" style="min-width:110px">▶ Play</button><button class="lab-btn" id="smshare">🔗 Share beat</button></div></div>'+
   '<div class="lab-card" style="overflow-x:auto"><div id="smgrid" style="display:grid;grid-template-columns:78px repeat(16,minmax(26px,1fr));gap:5px;min-width:560px"></div></div>'+
   '<div class="lab-row" style="margin-top:16px;gap:18px"><label class="lab-mut">Tempo <b id="smbpmv" style="color:#fff">'+bpm+'</b> BPM <input type="range" id="smbpm" min="60" max="180" value="'+bpm+'" style="vertical-align:middle;accent-color:#ff6a00"></label>'+
   '<label class="lab-mut">Swing <input type="range" id="smswing" min="0" max="60" value="0" style="vertical-align:middle;accent-color:#ff6a00"></label>'+
   '<label class="lab-mut">Key <select id="smkey" class="lab-in" style="padding:5px 8px"><option value="45">A minor</option><option value="48">C minor</option><option value="43">G minor</option><option value="50">D minor</option></select></label></div>'+
   '<div class="lab-row" style="margin-top:14px"><span class="lab-mut">Presets:</span>'+Object.keys(PRESETS).map(function(k){return '<button class="lab-btn" data-pre="'+k+'">'+k+'</button>'}).join("")+'<button class="lab-btn" id="smrand">🎲 Random</button><button class="lab-btn" id="smclear">Clear</button></div>'+
   '<div style="margin-top:22px"><div class="lab-h" style="font-size:18px">FX pads</div><p class="lab-mut" style="margin-bottom:10px">Tap or press keys 1 to 6. Works while the loop plays.</p><div class="lab-row" id="smfx"></div></div></div>'+
   '<style>.smc{height:30px;border-radius:7px;background:#1b1b22;border:1px solid #26262f;cursor:pointer;transition:transform .08s}.smc:nth-child(17n+6),.smc.q{}.smc.on{box-shadow:0 0 14px var(--cc);background:var(--cc);border-color:transparent}.smc.now{outline:2px solid #fff;outline-offset:-2px}.smc.beat{background:#22222b}.smc.on.beat{background:var(--cc)}.smn{font:600 12px Inter;color:#c9c9d1;display:flex;align-items:center;gap:6px;cursor:pointer}.smn i{width:8px;height:8px;border-radius:50%;display:inline-block}.smfx{width:84px;height:64px;border-radius:14px;border:1px solid #33333d;background:#15151b;color:#fff;font:700 13px Inter;cursor:pointer}.smfx:active,.smfx.hit{background:#ff6a00;color:#111;transform:scale(.95)}</style>';
  var g=root.querySelector("#smgrid"),cells=[];
  function build(){g.innerHTML="";cells=[];ROWS.forEach(function(r,ri){var nm=document.createElement("div");nm.className="smn";nm.innerHTML='<i style="background:'+r.c+'"></i>'+r.n;nm.onclick=function(){voice(ri,L.audio().currentTime)};g.appendChild(nm);cells.push([]);
    for(var s=0;s<STEPS;s++){var d=document.createElement("div");d.className="smc"+(s%4===0?" beat":"")+(pat[ri][s]?" on":"");d.style.setProperty("--cc",r.c);d.dataset.r=ri;d.dataset.s=s;g.appendChild(d);cells[ri].push(d)}})}
  build();
  var painting=null;
  g.addEventListener("pointerdown",function(e){var d=e.target.closest(".smc");if(!d)return;var r=+d.dataset.r,s=+d.dataset.s;painting=pat[r][s]?0:1;pat[r][s]=painting;d.classList.toggle("on",!!painting);if(painting&&!playing)voice(r,L.audio().currentTime);save()});
  g.addEventListener("pointerover",function(e){if(painting===null)return;var d=e.target.closest(".smc");if(!d)return;var r=+d.dataset.r,s=+d.dataset.s;pat[r][s]=painting;d.classList.toggle("on",!!painting)});
  function stopPaint(){painting=null;save()}window.addEventListener("pointerup",stopPaint);
  function save(){L.ss("vb_sound_pat",pat);L.ss("vb_sound_bpm",bpm)}
  /* synth voices */
  var noiseBuf=null;function noise(a){if(!noiseBuf){noiseBuf=a.createBuffer(1,a.sampleRate*0.5,a.sampleRate);var d=noiseBuf.getChannelData(0);for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1}var s=a.createBufferSource();s.buffer=noiseBuf;return s}
  var master=null;function out(a){if(!master){master=a.createDynamicsCompressor();var mg=a.createGain();mg.gain.value=0.8;master.connect(mg);mg.connect(a.destination)}return master}
  function env(a,t,peak,dec){var gn=a.createGain();gn.gain.setValueAtTime(0.0001,t);gn.gain.exponentialRampToValueAtTime(peak,t+0.004);gn.gain.exponentialRampToValueAtTime(0.0001,t+dec);gn.connect(out(a));return gn}
  function mtof(m){return 440*Math.pow(2,(m-69)/12)}
  function note(i,oct){var n=scale.length;return root_+oct*12+scale[((i%n)+n)%n]+12*Math.floor(i/n)}
  function voice(r,t){var a=L.audio();if(!a)return;var o,gn,f,s;
    if(r===0){o=a.createOscillator();o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(42,t+0.18);gn=env(a,t,0.9,0.35);o.connect(gn);o.start(t);o.stop(t+0.4)}
    else if(r===1){s=noise(a);f=a.createBiquadFilter();f.type="highpass";f.frequency.value=1200;gn=env(a,t,0.35,0.18);s.connect(f);f.connect(gn);s.start(t);s.stop(t+0.2);o=a.createOscillator();o.type="triangle";o.frequency.setValueAtTime(220,t);o.frequency.exponentialRampToValueAtTime(140,t+0.08);var g2=env(a,t,0.25,0.1);o.connect(g2);o.start(t);o.stop(t+0.12)}
    else if(r===2){s=noise(a);f=a.createBiquadFilter();f.type="highpass";f.frequency.value=7000;gn=env(a,t,0.16,0.05);s.connect(f);f.connect(gn);s.start(t);s.stop(t+0.06)}
    else if(r===3){[0,0.012,0.024].forEach(function(d){var n=noise(a),bf=a.createBiquadFilter();bf.type="bandpass";bf.frequency.value=1500;bf.Q.value=1.2;var e=env(a,t+d,0.3,0.09);n.connect(bf);bf.connect(e);n.start(t+d);n.stop(t+d+0.1)})}
    else if(r===4){o=a.createOscillator();o.type="sawtooth";o.frequency.value=mtof(note(step%8<4?0:3,-1));f=a.createBiquadFilter();f.type="lowpass";f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(120,t+0.25);gn=env(a,t,0.35,0.28);o.connect(f);f.connect(gn);o.start(t);o.stop(t+0.3)}
    else{var idx=[4,2,0][r-5]+(step%16>=8?1:0);o=a.createOscillator();o.type=r===5?"square":r===6?"triangle":"sine";o.frequency.value=mtof(note(idx,1));f=a.createBiquadFilter();f.type="lowpass";f.frequency.value=2600;gn=env(a,t,r===5?0.09:0.16,0.22);o.connect(f);f.connect(gn);o.start(t);o.stop(t+0.25)}}
  function sched(){var a=L.audio();var stepDur=60/bpm/4;while(nextT<a.currentTime+0.12){var sw=(step%2)?stepDur*swing/100:0;for(var r=0;r<ROWS.length;r++)if(pat[r][step])voice(r,nextT+sw);(function(s,t){setTimeout(function(){mark(s)},Math.max(0,(t-a.currentTime)*1000))})(step,nextT+sw);nextT+=stepDur;step=(step+1)%STEPS}}
  var lastMark=-1;function mark(s){if(!playing)return;if(lastMark>=0)cells.forEach(function(row){row[lastMark].classList.remove("now")});cells.forEach(function(row){row[s].classList.add("now")});lastMark=s}
  function play(){var a=L.audio();if(!a){L.toast("Audio is not supported in this browser");return}playing=true;step=0;nextT=a.currentTime+0.06;timer=setInterval(sched,25);root.querySelector("#smplay").textContent="■ Stop";
    var n=L.ls("vb_sound_plays",0)+1;L.ss("vb_sound_plays",n);if(n===1){L.coins.add(10);L.toast("First beat! +10 🪙")}}
  function stop(){playing=false;clearInterval(timer);if(lastMark>=0)cells.forEach(function(row){row[lastMark].classList.remove("now")});lastMark=-1;root.querySelector("#smplay").textContent="▶ Play"}
  root.querySelector("#smplay").onclick=function(){playing?stop():play()};
  root.querySelector("#smbpm").oninput=function(e){bpm=+e.target.value;root.querySelector("#smbpmv").textContent=bpm;save()};
  root.querySelector("#smswing").oninput=function(e){swing=+e.target.value};
  root.querySelector("#smkey").onchange=function(e){root_=+e.target.value};
  root.querySelectorAll("[data-pre]").forEach(function(b){b.onclick=function(){var P=PRESETS[b.dataset.pre];pat=fromStr(P.p);bpm=P.bpm;root.querySelector("#smbpm").value=bpm;root.querySelector("#smbpmv").textContent=bpm;build();save()}});
  root.querySelector("#smrand").onclick=function(){var dens=[.3,.15,.6,.12,.25,.2,.15,.12];pat=empty();pat.forEach(function(row,r){for(var s=0;s<STEPS;s++)row[s]=Math.random()<dens[r]?1:0});pat[0][0]=1;pat[0][8]=1;build();save()};
  root.querySelector("#smclear").onclick=function(){pat=empty();build();save()};
  root.querySelector("#smshare").onclick=function(){var url=location.origin+"/lab.html#sound?b="+encode();if(window.VBShare)VBShare.share("wa",{title:"My VB beat",text:"I made this beat on VarHireBlaze 🎛️ Tap to play it:",url:url});try{navigator.clipboard.writeText(url);L.toast("Beat link copied")}catch(e){}};
  var FX=[["Riser",function(t,a){var o=a.createOscillator();o.type="sawtooth";o.frequency.setValueAtTime(200,t);o.frequency.exponentialRampToValueAtTime(1800,t+1.2);var gn=a.createGain();gn.gain.setValueAtTime(0.0001,t);gn.gain.exponentialRampToValueAtTime(0.08,t+1.1);gn.gain.exponentialRampToValueAtTime(0.0001,t+1.25);o.connect(gn);gn.connect(out(a));o.start(t);o.stop(t+1.3)}],
    ["Drop",function(t,a){var o=a.createOscillator();o.frequency.setValueAtTime(120,t);o.frequency.exponentialRampToValueAtTime(30,t+0.9);var gn=env(a,t,0.9,1);o.connect(gn);o.start(t);o.stop(t+1)}],
    ["Zap",function(t,a){var o=a.createOscillator();o.type="square";o.frequency.setValueAtTime(1800,t);o.frequency.exponentialRampToValueAtTime(90,t+0.25);var gn=env(a,t,0.1,0.25);o.connect(gn);o.start(t);o.stop(t+0.3)}],
    ["Coin",function(t,a){[988,1319].forEach(function(f,i){var o=a.createOscillator();o.type="square";o.frequency.value=f;var gn=env(a,t+i*0.07,0.07,0.18);o.connect(gn);o.start(t+i*0.07);o.stop(t+i*0.07+0.2)})}],
    ["Vinyl",function(t,a){var n=noise(a),bf=a.createBiquadFilter();bf.type="bandpass";bf.frequency.setValueAtTime(3000,t);bf.frequency.exponentialRampToValueAtTime(300,t+0.4);var gn=env(a,t,0.4,0.4);n.connect(bf);bf.connect(gn);n.start(t);n.stop(t+0.45)}],
    ["Chord",function(t,a){[0,3,7,10].forEach(function(iv){var o=a.createOscillator();o.type="triangle";o.frequency.value=mtof(root_+12+iv);var gn=env(a,t,0.06,1.4);o.connect(gn);o.start(t);o.stop(t+1.5)})}]];
  var fxEl=root.querySelector("#smfx");FX.forEach(function(f,i){var b=document.createElement("button");b.className="smfx";b.innerHTML=f[0]+'<br><small style="opacity:.6">'+(i+1)+'</small>';b.onclick=function(){var a=L.audio();if(a)f[1](a.currentTime+0.01,a)};fxEl.appendChild(b)});
  function onKey(e){if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;var n=+e.key;if(n>=1&&n<=6){var b=fxEl.children[n-1];b.click();b.classList.add("hit");setTimeout(function(){b.classList.remove("hit")},120)}if(e.code==="Space"){e.preventDefault();playing?stop():play()}}
  document.addEventListener("keydown",onKey);
  if(q)L.toast("Beat loaded from a link. Press Play ▶");
  return function(){stop();document.removeEventListener("keydown",onKey);window.removeEventListener("pointerup",stopPaint)}
}});
