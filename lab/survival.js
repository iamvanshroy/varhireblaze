/* VB Survival Mode — same daily-seeded arena for everyone; survive as long as you can. */
VBLab.reg("survival",{mount:function(root,L){
  var VW=800,VH=500,raf=0,state="ready",P={x:400,y:250,r:9},H=[],t,last=0,rnd,spawnAt,score=0,shake=0,parts=[],keys={},ptr=null,best=L.ls("vb_surv_best_"+L.today(),0),tries=L.ls("vb_surv_tries_"+L.today(),0);
  var day=L.today(),seedR=L.rng("vb-surv-"+day);
  /* the day's "rules": two featured hazards and an arena colour, picked from the seed */
  var TYPES=["dart","orb","laser","ring","seeker"],feat=[TYPES[Math.floor(seedR()*5)]];do{var f2=TYPES[Math.floor(seedR()*5)]}while(f2===feat[0]);feat.push(f2);
  var HUES=[[255,106,0],[166,107,255],[61,232,255],[255,61,94],[43,212,107]],hue=HUES[Math.floor(seedR()*5)],HC="rgb("+hue+")";
  var NAMES={dart:"Darts",orb:"Bouncers",laser:"Lasers",ring:"Shockwaves",seeker:"Seekers"};
  function fmt(ds){return (ds/10).toFixed(1)+"s"}
  root.innerHTML='<div class="lab-pad"><div style="display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:20px" class="sv-wrap"><div>'+
    '<canvas class="lab-cv" id="svcv" style="width:100%;aspect-ratio:8/5;cursor:none"></canvas><p class="lab-mut" style="margin-top:10px">Move with the mouse, your finger, or the arrow keys / WASD. Touch nothing.</p></div>'+
    '<div><div class="lab-card" style="margin-bottom:14px"><span class="lab-mut" style="font-size:12px;letter-spacing:.1em;text-transform:uppercase">Today · '+day+'</span><div class="lab-h" style="margin:4px 0">Featured: '+NAMES[feat[0]]+' + '+NAMES[feat[1]]+'</div><p class="lab-mut">Everyone in the world gets this exact arena today. It changes at midnight.</p>'+
    '<div class="lab-row" style="margin-top:10px;gap:20px"><div><b id="svBest" style="font:700 24px Space Grotesk">'+fmt(best)+'</b><br><span class="lab-mut" style="font-size:12px">your best today</span></div><div><b id="svTries" style="font:700 24px Space Grotesk">'+tries+'</b><br><span class="lab-mut" style="font-size:12px">tries</span></div></div></div>'+
    '<div class="lab-card"><b>🌍 Today\'s top 10</b><div id="svBoard" style="margin-top:10px"></div></div></div></div></div><style>@media(max-width:820px){.sv-wrap{grid-template-columns:1fr!important}}</style>';
  var cv=root.querySelector("#svcv"),c=L.fitCanvas(cv,VW,VH);
  function board(sc){L.board(root.querySelector("#svBoard"),"survival",sc||0,fmt)}board(0);
  function reset(){rnd=L.rng("vb-surv-"+day+"-run");P={x:VW/2,y:VH/2,r:9};H=[];t=0;spawnAt=0.8;score=0;parts=[];state="play";tries++;L.ss("vb_surv_tries_"+day,tries);root.querySelector("#svTries").textContent=tries}
  function pick(){var lvl=Math.min(1,t/90),pool=feat.concat(feat).concat(t>20?TYPES:[]);return pool[Math.floor(rnd()*pool.length)]}
  function edge(){var s=Math.floor(rnd()*4),u=rnd();return s===0?{x:u*VW,y:-20}:s===1?{x:VW+20,y:u*VH}:s===2?{x:u*VW,y:VH+20}:{x:-20,y:u*VH}}
  function spawn(){var k=pick(),sp=1+t/60;
    if(k==="dart"){var e=edge(),a=Math.atan2(P.y-e.y,P.x-e.x)+(rnd()-.5)*.5;H.push({k:k,x:e.x,y:e.y,vx:Math.cos(a)*230*sp,vy:Math.sin(a)*230*sp,r:6,life:6})}
    else if(k==="orb"){var e2=edge(),a2=rnd()*Math.PI*2;H.push({k:k,x:Math.max(30,Math.min(VW-30,e2.x)),y:Math.max(30,Math.min(VH-30,e2.y)),vx:Math.cos(a2)*150*sp,vy:Math.sin(a2)*150*sp,r:14,life:9})}
    else if(k==="laser"){var hor=rnd()<.5;H.push({k:k,hor:hor,p:hor?40+rnd()*(VH-80):40+rnd()*(VW-80),warn:1.1,on:.35,life:1.45,r:0})}
    else if(k==="ring"){H.push({k:k,x:60+rnd()*(VW-120),y:60+rnd()*(VH-120),warn:.9,rad:0,life:2.6})}
    else{var e3=edge();H.push({k:k,x:e3.x,y:e3.y,vx:0,vy:0,r:8,life:5.5})}}
  function hit(h){if(h.k==="laser")return h.warn<=0&&h.on>0&&(h.hor?Math.abs(P.y-h.p)<P.r+7:Math.abs(P.x-h.p)<P.r+7);
    if(h.k==="ring"){if(h.warn>0)return false;var d=Math.hypot(P.x-h.x,P.y-h.y);return Math.abs(d-h.rad)<P.r+5}
    return Math.hypot(P.x-h.x,P.y-h.y)<P.r+h.r-2}
  function die(){state="over";shake=14;for(var i=0;i<40;i++){var a=Math.random()*7,s=60+Math.random()*260;parts.push({x:P.x,y:P.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:1})}L.beep(400,60,.5,"sawtooth",.08);
    if(score>best){best=score;L.ss("vb_surv_best_"+day,best);root.querySelector("#svBest").textContent=fmt(best)}
    var c5=Math.min(40,Math.floor(score/50));if(c5>0)L.coins.add(c5);board(score)}
  function update(dt){t+=dt;score=Math.floor(t*10);
    var mx=(keys.r?1:0)-(keys.l?1:0),my=(keys.d?1:0)-(keys.u?1:0);if(mx||my){var m=Math.hypot(mx,my);P.x+=mx/m*300*dt;P.y+=my/m*300*dt;ptr=null}
    else if(ptr){var dx=ptr.x-P.x,dy=ptr.y-P.y,dd=Math.hypot(dx,dy),mv=Math.min(dd,420*dt);if(dd>0.5){P.x+=dx/dd*mv;P.y+=dy/dd*mv}}
    P.x=Math.max(P.r,Math.min(VW-P.r,P.x));P.y=Math.max(P.r,Math.min(VH-P.r,P.y));
    spawnAt-=dt;if(spawnAt<=0){spawn();spawnAt=Math.max(.28,1.1-t/70)*(0.7+rnd()*.6)}
    H=H.filter(function(h){h.life-=dt;
      if(h.k==="seeker"){var a=Math.atan2(P.y-h.y,P.x-h.x);h.vx+=(Math.cos(a)*170-h.vx)*dt*1.4;h.vy+=(Math.sin(a)*170-h.vy)*dt*1.4}
      if(h.k==="laser"){if(h.warn>0)h.warn-=dt;else h.on-=dt}
      else if(h.k==="ring"){if(h.warn>0)h.warn-=dt;else h.rad+=260*dt}
      else{h.x+=h.vx*dt;h.y+=h.vy*dt;if(h.k==="orb"){if(h.x<h.r||h.x>VW-h.r)h.vx*=-1;if(h.y<h.r||h.y>VH-h.r)h.vy*=-1}}
      if(hit(h)){die()}return h.life>0});
    if(score>0&&score%100===0)L.beep(880,1320,.08,"triangle",.04)}
  function draw(){var sx=0,sy=0;if(shake>0){sx=(Math.random()-.5)*shake;sy=(Math.random()-.5)*shake;shake*=.88}c.save();c.translate(sx,sy);
    c.fillStyle="#07070b";c.fillRect(-20,-20,VW+40,VH+40);c.strokeStyle="rgba("+hue+",.08)";c.lineWidth=1;for(var x=0;x<=VW;x+=40){c.beginPath();c.moveTo(x,0);c.lineTo(x,VH);c.stroke()}for(var y=0;y<=VH;y+=40){c.beginPath();c.moveTo(0,y);c.lineTo(VW,y);c.stroke()}
    H.forEach(function(h){c.shadowColor=HC;c.shadowBlur=14;
      if(h.k==="laser"){if(h.warn>0){c.strokeStyle="rgba(255,255,255,"+(0.15+0.25*Math.abs(Math.sin(h.warn*14)))+")";c.setLineDash([10,10]);c.lineWidth=2}else{c.strokeStyle="#fff";c.setLineDash([]);c.lineWidth=12}c.beginPath();if(h.hor){c.moveTo(0,h.p);c.lineTo(VW,h.p)}else{c.moveTo(h.p,0);c.lineTo(h.p,VH)}c.stroke();if(h.warn<=0){c.strokeStyle=HC;c.lineWidth=5;c.stroke()}c.setLineDash([])}
      else if(h.k==="ring"){if(h.warn>0){c.fillStyle="rgba("+hue+","+(0.3+0.3*Math.sin(h.warn*20))+")";c.beginPath();c.arc(h.x,h.y,8,0,7);c.fill()}else{c.strokeStyle=HC;c.lineWidth=5;c.globalAlpha=Math.max(0,h.life/2);c.beginPath();c.arc(h.x,h.y,h.rad,0,7);c.stroke();c.globalAlpha=1}}
      else{c.fillStyle=h.k==="seeker"?"#ff3d5e":h.k==="orb"?HC:"#fff";c.beginPath();if(h.k==="dart"){var a=Math.atan2(h.vy,h.vx);c.save();c.translate(h.x,h.y);c.rotate(a);c.moveTo(10,0);c.lineTo(-8,-5);c.lineTo(-8,5);c.fill();c.restore()}else{c.arc(h.x,h.y,h.r,0,7);c.fill()}}c.shadowBlur=0});
    if(state!=="over"){c.shadowColor="#fff";c.shadowBlur=20;c.fillStyle="#fff";c.beginPath();c.arc(P.x,P.y,P.r,0,7);c.fill();c.shadowBlur=0;c.fillStyle=HC;c.beginPath();c.arc(P.x,P.y,4,0,7);c.fill()}
    parts=parts.filter(function(p){p.x+=p.vx/60;p.y+=p.vy/60;p.l-=1/50;c.globalAlpha=Math.max(0,p.l);c.fillStyle=HC;c.fillRect(p.x,p.y,3,3);c.globalAlpha=1;return p.l>0});
    c.restore();c.fillStyle="#fff";c.font="700 22px Space Grotesk";c.textAlign="left";if(state==="play")c.fillText(fmt(score),16,32);
    if(state!=="play"){c.fillStyle="rgba(0,0,0,.55)";c.fillRect(0,0,VW,VH);c.textAlign="center";c.fillStyle="#fff";c.font="700 46px Space Grotesk";c.fillText(state==="ready"?"VB Survival":fmt(score),VW/2,VH/2-20);c.font="500 17px Inter";c.fillStyle="#c9c9d1";
      c.fillText(state==="ready"?"Today: "+NAMES[feat[0]]+" + "+NAMES[feat[1]]+". Tap or press Space to start.":(score>=best?"New best today! ":"")+"Tap or press Space to try again.",VW/2,VH/2+20)}}
  function loop(ts){raf=requestAnimationFrame(loop);var dt=Math.min(.033,(ts-(last||ts))/1000);last=ts;if(state==="play")update(dt);draw()}
  function start(){if(state!=="play"){reset();L.audio()}}
  cv.addEventListener("pointerdown",function(e){var p=L.pos(cv,e,VW,VH);if(state!=="play"){start();P.x=p.x;P.y=p.y}ptr=p;try{cv.setPointerCapture(e.pointerId)}catch(err){}});
  cv.addEventListener("pointermove",function(e){if(e.pointerType==="mouse"||e.buttons)ptr=L.pos(cv,e,VW,VH)});
  var KM={ArrowLeft:"l",KeyA:"l",ArrowRight:"r",KeyD:"r",ArrowUp:"u",KeyW:"u",ArrowDown:"d",KeyS:"d"};
  function kd(e){if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(KM[e.code]){keys[KM[e.code]]=true;e.preventDefault()}if(e.code==="Space"){e.preventDefault();start()}}
  function ku(e){if(KM[e.code])keys[KM[e.code]]=false}
  document.addEventListener("keydown",kd);document.addEventListener("keyup",ku);raf=requestAnimationFrame(loop);
  return function(){cancelAnimationFrame(raf);document.removeEventListener("keydown",kd);document.removeEventListener("keyup",ku)}
}});
