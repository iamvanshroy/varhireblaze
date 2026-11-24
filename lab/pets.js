/* VB Pet Universe — hatch and raise an original creature. Stats decay in real time, saved locally. */
VBLab.reg("pets",{mount:function(root,L){
  var KEY="vb_pet",HOUR=3600e3,raf=0;
  var SPECIES=[{n:"Blazelet",c1:"#ff6a00",c2:"#ffb066"},{n:"Glimmo",c1:"#3de8ff",c2:"#b8f6ff"},{n:"Mossling",c1:"#2bd46b",c2:"#a8f5c4"},{n:"Violoop",c1:"#a66bff",c2:"#dcc6ff"}];
  var STAGES=[{n:"Egg",xp:0},{n:"Baby",xp:20},{n:"Kid",xp:120},{n:"Teen",xp:320},{n:"Adult",xp:700}];
  var pet=L.ls(KEY,null),anim={act:"",t:0,hearts:[]};
  function now(){return Date.now()}
  function newPet(sp,name){pet={sp:sp,name:name||SPECIES[sp].n,born:now(),xp:0,food:80,fun:80,energy:80,clean:80,last:now(),sleeping:false,hatched:false,taps:0};save()}
  function save(){L.ss(KEY,pet)}
  function decay(){if(!pet||!pet.hatched)return;var h=(now()-pet.last)/HOUR;if(h<=0)return;
    pet.food=Math.max(0,pet.food-h*6);pet.fun=Math.max(0,pet.fun-h*5);pet.clean=Math.max(0,pet.clean-h*3);
    pet.energy=pet.sleeping?Math.min(100,pet.energy+h*20):Math.max(0,pet.energy-h*4);pet.last=now();save()}
  function stage(){var s=0;for(var i=0;i<STAGES.length;i++)if(pet.xp>=STAGES[i].xp)s=i;return pet.hatched?Math.max(1,s):0}
  function mood(){var a=(pet.food+pet.fun+pet.energy+pet.clean)/4;return pet.sleeping?"sleep":a>70?"happy":a>40?"ok":"sad"}
  root.innerHTML='<div class="lab-pad"><div id="ptBody"></div></div>';
  var B=root.querySelector("#ptBody");
  function pickUI(){B.innerHTML='<div style="text-align:center;max-width:620px;margin:0 auto"><div class="lab-h">Choose your egg</div><p class="lab-mut" style="margin-bottom:20px">Four original creatures. Each one grows from egg to adult as you look after it. Your pet lives on this device and keeps living while you\'re away.</p>'+
    '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:14px">'+SPECIES.map(function(s,i){return '<button class="lab-card" data-sp="'+i+'" style="cursor:pointer;color:#fff;font:inherit"><div style="width:70px;height:88px;margin:0 auto 10px;border-radius:50% 50% 46% 46%/60% 60% 40% 40%;background:radial-gradient(circle at 35% 30%,'+s.c2+','+s.c1+');box-shadow:0 10px 30px '+s.c1+'66"></div><b>'+s.n+'</b></button>'}).join("")+'</div>'+
    '<div class="lab-row" style="justify-content:center;margin-top:20px"><input class="lab-in" id="ptName" maxlength="14" placeholder="Name your pet (optional)"></div></div>';
    B.querySelectorAll("[data-sp]").forEach(function(b){b.onclick=function(){var nm=(B.querySelector("#ptName").value||"").replace(/[<>&"]/g,"").trim();newPet(+b.dataset.sp,nm);L.beep(500,900,.15,"triangle",.06);mainUI()}})}
  function bar(k,ic){return '<div style="margin:8px 0"><div class="lab-row" style="justify-content:space-between;font-size:13px"><span>'+ic+' '+k[0].toUpperCase()+k.slice(1)+'</span><span id="pv-'+k+'"></span></div><div style="height:8px;background:#1b1b22;border-radius:9px;overflow:hidden"><div id="pb-'+k+'" style="height:100%;border-radius:9px;transition:width .5s"></div></div></div>'}
  function mainUI(){B.innerHTML='<div style="display:grid;grid-template-columns:minmax(0,1.3fr) minmax(260px,1fr);gap:20px" class="pt-wrap">'+
    '<div><canvas class="lab-cv" id="ptcv" style="width:100%;aspect-ratio:4/3;cursor:pointer"></canvas></div>'+
    '<div class="lab-card"><div class="lab-row" style="justify-content:space-between"><div><div class="lab-h" id="ptN" style="margin:0"></div><span class="lab-mut" id="ptS"></span></div><span class="coinpill" id="ptAge"></span></div>'+
    '<div style="margin:12px 0 4px">'+bar("food","🍙")+bar("fun","🎾")+bar("energy","⚡")+bar("clean","🫧")+'</div>'+
    '<div class="lab-mut" style="font-size:12px;margin-bottom:6px">Growth</div><div style="height:6px;background:#1b1b22;border-radius:9px"><div id="ptXp" style="height:100%;background:linear-gradient(90deg,#ff6a00,#ffd23f);border-radius:9px;transition:width .5s"></div></div>'+
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:16px"><button class="lab-btn" data-a="feed">🍙 Feed</button><button class="lab-btn" data-a="play">🎾 Play</button><button class="lab-btn" data-a="clean">🫧 Bath</button><button class="lab-btn" data-a="sleep" id="ptSleep">🌙 Sleep</button></div>'+
    '<p class="lab-mut" id="ptMsg" style="margin-top:12px;min-height:22px;font-size:13px"></p>'+
    '<button class="lab-btn" id="ptRel" style="margin-top:6px;font-size:12px;opacity:.6">Start over with a new egg</button></div></div><style>@media(max-width:760px){.pt-wrap{grid-template-columns:1fr!important}}</style>';
    var cv=B.querySelector("#ptcv"),c=L.fitCanvas(cv,480,360);
    cv.onclick=function(e){if(!pet.hatched){pet.taps++;L.beep(300+pet.taps*60,0,.08,"triangle",.05);anim.act="wobble";anim.t=0;if(pet.taps>=6){pet.hatched=true;pet.last=now();pet.xp=0;save();L.beep(523,1046,.4,"triangle",.07);L.coins.add(10);L.toast("🎉 "+pet.name+" hatched! +10 🪙");say(pet.name+" says hi!")}refresh();return}
      if(pet.sleeping){say("Shh... "+pet.name+" is sleeping.");return}var p=L.pos(cv,e,480,360);anim.hearts.push({x:p.x,y:p.y,t:0});pet.fun=Math.min(100,pet.fun+1);gain(1);L.beep(880,1200,.06,"sine",.04);refresh()};
    B.querySelectorAll("[data-a]").forEach(function(b){b.onclick=function(){act(b.dataset.a)}});
    B.querySelector("#ptRel").onclick=function(){if(confirm("Say goodbye to "+pet.name+" and start a new egg?")){pet=null;L.ss(KEY,null);pickUI()}};
    function draw(t){raf=requestAnimationFrame(draw);anim.t+=1/60;var sp=SPECIES[pet.sp],st=stage(),m=mood();
      var g=c.createLinearGradient(0,0,0,360);var night=pet.sleeping;g.addColorStop(0,night?"#0b0b24":"#2b1a10");g.addColorStop(1,night?"#05050c":"#120a06");c.fillStyle=g;c.fillRect(0,0,480,360);
      if(night){c.fillStyle="#fff";for(var i=0;i<30;i++){c.globalAlpha=.3+.3*Math.sin(t/600+i);c.fillRect((i*97)%480,(i*53)%200,2,2)}c.globalAlpha=1}
      c.fillStyle=night?"#14142a":"#3a2416";c.fillRect(0,290,480,70);c.fillStyle=night?"#1c1c38":"#4d301c";c.beginPath();c.ellipse(240,300,150,22,0,0,7);c.fill();
      var cx=240,cy=270,bob=Math.sin(t/(m==="sleep"?900:350))*(m==="sad"?1:4);
      if(!pet.hatched){var wob=anim.act==="wobble"?Math.sin(anim.t*40)*Math.max(0,.25-anim.t):Math.sin(t/700)*.03;c.save();c.translate(cx,cy+20);c.rotate(wob);
        var eg=c.createRadialGradient(-15,-60,5,0,-40,70);eg.addColorStop(0,sp.c2);eg.addColorStop(1,sp.c1);c.fillStyle=eg;c.beginPath();c.ellipse(0,-50,46,60,0,0,7);c.fill();
        c.strokeStyle="#0006";c.lineWidth=3;for(var k=0;k<Math.min(pet.taps,5);k++){c.beginPath();c.moveTo(-30+k*14,-60+(k%2)*10);c.lineTo(-22+k*14,-48-(k%2)*10);c.stroke()}c.restore();
        c.fillStyle="#fff";c.font="600 16px Inter";c.textAlign="center";c.fillText("Tap the egg to help it hatch ("+pet.taps+"/6)",240,40);return}
      var sz=[0,34,44,54,64][st];c.save();c.translate(cx,cy+bob);
      c.fillStyle="rgba(0,0,0,.35)";c.beginPath();c.ellipse(0,26-bob,sz*.9,9,0,0,7);c.fill();
      var bg=c.createRadialGradient(-sz*.3,-sz*.9,4,0,-sz*.5,sz*1.4);bg.addColorStop(0,sp.c2);bg.addColorStop(1,sp.c1);c.fillStyle=bg;
      c.beginPath();c.ellipse(0,-sz*.5,sz,sz*(m==="sleep"?.78:.9),0,0,7);c.fill();
      if(st>=2){c.beginPath();c.moveTo(-sz*.6,-sz*1.15);c.lineTo(-sz*.35,-sz*1.65);c.lineTo(-sz*.1,-sz*1.25);c.moveTo(sz*.6,-sz*1.15);c.lineTo(sz*.35,-sz*1.65);c.lineTo(sz*.1,-sz*1.25);c.fill()}
      if(st>=3){c.fillStyle=sp.c2;c.beginPath();c.ellipse(-sz*1.02,-sz*.45,sz*.25,sz*.14,-.6+Math.sin(t/200)*.2,0,7);c.ellipse(sz*1.02,-sz*.45,sz*.25,sz*.14,.6-Math.sin(t/200)*.2,0,7);c.fill()}
      if(st>=4){c.fillStyle="#ffd23f";c.beginPath();c.moveTo(-sz*.3,-sz*1.42);c.lineTo(-sz*.2,-sz*1.7);c.lineTo(0,-sz*1.5);c.lineTo(sz*.2,-sz*1.7);c.lineTo(sz*.3,-sz*1.42);c.fill()}
      c.fillStyle="#1b1b22";var ey=-sz*.6;
      if(m==="sleep"){c.lineWidth=3;c.strokeStyle="#1b1b22";c.beginPath();c.arc(-sz*.32,ey,6,0,Math.PI);c.moveTo(sz*.32+6,ey);c.arc(sz*.32,ey,6,0,Math.PI);c.stroke();c.fillStyle="#fff";c.font="700 18px Inter";c.fillText("z",sz*.8,-sz*1.3-(t/30%30));}
      else{var blink=(t%3200)<120;if(blink){c.fillRect(-sz*.32-7,ey,14,3);c.fillRect(sz*.32-7,ey,14,3)}else{c.beginPath();c.arc(-sz*.32,ey,7,0,7);c.arc(sz*.32,ey,7,0,7);c.fill();c.fillStyle="#fff";c.fillRect(-sz*.32-3,ey-4,3,3);c.fillRect(sz*.32-3,ey-4,3,3)}
        c.strokeStyle="#1b1b22";c.lineWidth=3;c.beginPath();if(m==="happy")c.arc(0,-sz*.38,9,.15,Math.PI-.15);else if(m==="sad")c.arc(0,-sz*.22,8,Math.PI+.3,-.3);else{c.moveTo(-6,-sz*.32);c.lineTo(6,-sz*.32)}c.stroke();
        c.fillStyle="#ff9ad566";c.beginPath();c.arc(-sz*.62,-sz*.42,7,0,7);c.arc(sz*.62,-sz*.42,7,0,7);c.fill()}
      c.restore();
      anim.hearts=anim.hearts.filter(function(h){h.t+=1/60;c.globalAlpha=Math.max(0,1-h.t);c.font="22px serif";c.textAlign="center";c.fillText("💖",h.x,h.y-h.t*60);c.globalAlpha=1;return h.t<1});
      if(anim.act&&anim.act!=="wobble"&&anim.t<1.2){c.font="40px serif";c.textAlign="center";c.fillText({feed:"🍙",play:"🎾",clean:"🫧"}[anim.act]||"",cx+Math.sin(anim.t*8)*40,cy-140+anim.t*40)}}
    raf=requestAnimationFrame(draw);refresh()}
  function gain(n){var before=stage();pet.xp+=n;var after=stage();if(after>before&&pet.hatched){L.beep(523,1568,.5,"triangle",.07);L.coins.add(20*after);L.toast("✨ "+pet.name+" grew into a "+STAGES[after].n+"! +"+(20*after)+" 🪙")}save()}
  function say(m){var el=B.querySelector("#ptMsg");if(el)el.textContent=m}
  function act(a){decay();if(!pet.hatched){say("Tap the egg first!");return}
    if(a==="sleep"){pet.sleeping=!pet.sleeping;say(pet.sleeping?pet.name+" curled up to sleep. Energy refills over time.":pet.name+" woke up!");save();refresh();return}
    if(pet.sleeping){say(pet.name+" is asleep. Wake them first.");return}
    var map={feed:"food",play:"fun",clean:"clean"},k=map[a];if(pet[k]>95){say(pet.name+" doesn't need that right now.");return}
    if(a==="play"&&pet.energy<15){say(pet.name+" is too tired to play. Try sleep.");return}
    pet[k]=Math.min(100,pet[k]+28);if(a==="play")pet.energy=Math.max(0,pet.energy-8);anim.act=a;anim.t=0;gain(6);
    say({feed:"Yum! "+pet.name+" loved that.",play:pet.name+" is bouncing with joy!",clean:"Squeaky clean ✨"}[a]);L.beep(a==="feed"?440:a==="play"?660:550,a==="feed"?330:990,.15,"triangle",.05);refresh()}
  function refresh(){decay();var el=B.querySelector("#ptN");if(!el)return;el.textContent=pet.name;var st=stage();
    B.querySelector("#ptS").textContent=SPECIES[pet.sp].n+" · "+STAGES[st].n+(pet.hatched?" · feeling "+mood().replace("ok","okay").replace("sleep","sleepy"):"");
    var days=Math.floor((now()-pet.born)/864e5);B.querySelector("#ptAge").textContent=days?days+" day"+(days>1?"s":"")+" old":"born today";
    ["food","fun","energy","clean"].forEach(function(k){var v=Math.round(pet[k]);B.querySelector("#pv-"+k).textContent=v+"%";var b=B.querySelector("#pb-"+k);b.style.width=v+"%";b.style.background=v>60?"#2bd46b":v>30?"#ffd23f":"#ff3d5e"});
    var nx=STAGES[Math.min(4,st+1)].xp,pv=STAGES[st].xp;B.querySelector("#ptXp").style.width=(st>=4?100:Math.min(100,(pet.xp-pv)/(nx-pv)*100))+"%";
    B.querySelector("#ptSleep").textContent=pet.sleeping?"☀️ Wake up":"🌙 Sleep";
    if(pet.hatched&&mood()==="sad")say(pet.name+" needs some care…")}
  if(pet)mainUI();else pickUI();
  var iv=setInterval(function(){if(pet)refresh()},15000);
  return function(){cancelAnimationFrame(raf);clearInterval(iv)}
}});
