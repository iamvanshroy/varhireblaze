/* VarHireBlaze — Hire Games core (shared by games.html and the homepage live demo) */
(function(){
"use strict";
var W=800,H=500;
var O="#ff6a00",O2="#ff9a3c",TXT="#f4f4f6",MUT="#9a9aa8",LINE="#23232e",RED="#ff4d4d",GRN="#2bd46b";

/* ---------- sound (synth, no files) + juice ---------- */
var AC=null,muted=false;try{muted=localStorage.getItem("vhb_mute")==="1"}catch(e){}
function ac(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)()}catch(e){AC=null}}if(AC&&AC.state==="suspended")AC.resume();return AC}
function tone(f1,f2,dur,type,vol,delay){var a=ac();if(!a||muted)return;var t=a.currentTime+(delay||0),o=a.createOscillator(),g=a.createGain();
  o.type=type||"square";o.frequency.setValueAtTime(f1,t);if(f2)o.frequency.exponentialRampToValueAtTime(Math.max(20,f2),t+dur);
  g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.12,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
  o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+0.02)}
function noise(dur,vol,hp){var a=ac();if(!a||muted)return;var n=Math.floor(a.sampleRate*dur),b=a.createBuffer(1,n,a.sampleRate),d=b.getChannelData(0);
  for(var i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);var s=a.createBufferSource(),g=a.createGain(),f=a.createBiquadFilter();
  f.type="lowpass";f.frequency.value=hp||1800;s.buffer=b;g.gain.value=vol||0.35;s.connect(f);f.connect(g);g.connect(a.destination);s.start()}
var SFX={
  flap:function(){tone(420,760,0.09,"triangle",0.09)},
  point:function(){tone(880,0,0.07,"square",0.06);tone(1320,0,0.09,"square",0.05,0.06)},
  jump:function(){tone(300,620,0.12,"square",0.07)},
  jump2:function(){tone(500,900,0.1,"square",0.06)},
  coin:function(){tone(988,0,0.06,"square",0.06);tone(1319,0,0.12,"square",0.06,0.05)},
  lane:function(){tone(260,180,0.06,"sawtooth",0.04)},
  hit:function(sp){var f=300+Math.min(sp||400,820)*0.5;tone(f,f*0.6,0.07,"square",0.1);noise(0.05,0.15,3000)},
  wall:function(){tone(220,180,0.05,"triangle",0.06)},
  goal:function(){tone(660,0,0.08,"square",0.07);tone(880,0,0.08,"square",0.07,0.08);tone(1100,0,0.14,"square",0.07,0.16)},
  miss:function(){tone(300,110,0.3,"sawtooth",0.08)},
  crash:function(){noise(0.45,0.5,1200);tone(160,40,0.45,"sawtooth",0.12)},
  tick:function(){tone(660,0,0.08,"square",0.07)},
  go:function(){tone(990,0,0.18,"square",0.08)},
  win:function(){[523,659,784,1047].forEach(function(f,i){tone(f,0,0.14,"square",0.07,i*0.1)})},
  lose:function(){[392,330,262].forEach(function(f,i){tone(f,0,0.2,"triangle",0.09,i*0.14)})},
  boost:function(){tone(200,900,0.35,"sawtooth",0.06)},
  rev:function(){tone(90,160,0.25,"sawtooth",0.05)},
  whoosh:function(){noise(0.18,0.12,900)},
  thud:function(){tone(120,60,0.15,"triangle",0.12)},
  swing:function(){noise(0.12,0.1,2500)},
  bat:function(){tone(1200,500,0.06,"square",0.1);noise(0.08,0.3,4000)},
  tap:function(){tone(700,0,0.05,"triangle",0.07)}
};
function sfx(n,a){if(typeof QUIET!=="undefined"&&QUIET)return;try{if(SFX[n])SFX[n](a)}catch(e){}}
function buzz(ms){if(typeof QUIET!=="undefined"&&QUIET)return;try{if(!muted&&navigator.vibrate)navigator.vibrate(ms)}catch(e){}}
var FX={shake:0,rings:[],freeze:0};
function boom(x,y,col,power){if(typeof QUIET!=="undefined"&&QUIET)return;FX.shake=Math.max(FX.shake,power||6);FX.rings.push({x:x,y:y,r:6,l:1,col:col||"#ff9a3c",w:(power||6)/2+2})}
function ring(x,y,col){if(typeof QUIET!=="undefined"&&QUIET)return;FX.rings.push({x:x,y:y,r:4,l:0.7,col:col||"rgba(255,255,255,.8)",w:2})}
function stepFX(c,dt){for(var i=FX.rings.length-1;i>=0;i--){var r=FX.rings[i];r.l-=dt*2.2;r.r+=dt*260;if(r.l<=0){FX.rings.splice(i,1);continue}
  c.globalAlpha=Math.max(0,r.l);c.strokeStyle=r.col;c.lineWidth=r.w;c.beginPath();c.arc(r.x,r.y,r.r,0,Math.PI*2);c.stroke()}c.globalAlpha=1;
  FX.shake=Math.max(0,FX.shake-dt*40)}
function shakeOffset(){var k=FX.shake;return k>0?[(Math.random()*2-1)*k,(Math.random()*2-1)*k]:[0,0]}

/* ---------- storage (safe) ---------- */
function getBest(k){try{return +localStorage.getItem("vhb_best_"+k)||0}catch(e){return 0}}
function setBest(k,v){try{localStorage.setItem("vhb_best_"+k,v)}catch(e){}}
function paintBest(){document.querySelectorAll("[data-best]").forEach(function(el){el.textContent=getBest(el.dataset.best)})}
paintBest();

/* ---------- drawing helpers ---------- */
function stick(c,x,y,s,o){ // x,y = feet centre; o: {t,run,flap,color,tie,arm}
  o=o||{};var col=o.color||TXT,t=o.t||0;c.save();c.translate(x,y);c.scale(s,s);
  c.strokeStyle=col;c.lineWidth=3.2;c.lineCap="round";c.lineJoin="round";
  var leg=o.run?Math.sin(t*14)*0.9:0.25, arm=o.flap!=null?o.flap:(o.run?Math.sin(t*14+Math.PI)*0.8:0.35);
  // legs
  c.beginPath();c.moveTo(0,-26);c.lineTo(Math.sin(leg)*14,0);c.moveTo(0,-26);c.lineTo(-Math.sin(leg)*14,0);c.stroke();
  // body
  c.beginPath();c.moveTo(0,-26);c.lineTo(0,-54);c.stroke();
  // arms
  c.beginPath();
  if(o.arm==="up"){c.moveTo(0,-48);c.lineTo(-12,-66);c.moveTo(0,-48);c.lineTo(12,-66)}
  else{c.moveTo(0,-48);c.lineTo(Math.cos(arm+1.2)*-16,-48+Math.sin(arm+1.2)*16);c.moveTo(0,-48);c.lineTo(Math.cos(-arm+1.9)*-16,-48+Math.sin(-arm+1.9)*16)}
  c.stroke();
  // head
  c.beginPath();c.arc(0,-64,9,0,Math.PI*2);c.stroke();
  // tie
  if(o.tie!==false){c.fillStyle=O;c.beginPath();c.moveTo(0,-53);c.lineTo(-3,-50);c.lineTo(0,-38);c.lineTo(3,-50);c.closePath();c.fill()}
  c.restore();
}
function bgGrid(c,off,col){c.save();c.strokeStyle=col||"rgba(255,255,255,.035)";c.lineWidth=1;var g=40,o=((off%g)+g)%g;
  for(var x=-o;x<W;x+=g){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}for(var y=0;y<H;y+=g){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}c.restore()}
function glowBg(c,t){var g=c.createRadialGradient(W*0.8,H*0.15,10,W*0.8,H*0.15,420);g.addColorStop(0,"rgba(255,106,0,.22)");g.addColorStop(1,"rgba(255,106,0,0)");
  c.fillStyle="#0b0b10";c.fillRect(0,0,W,H);c.fillStyle=g;c.fillRect(0,0,W,H)}
function label(c,txt,x,y,size,col,align){c.font="700 "+size+"px 'Space Grotesk',Inter,sans-serif";c.fillStyle=col;c.textAlign=align||"center";c.textBaseline="middle";c.fillText(txt,x,y)}
function rr(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath()}
function particles(list,x,y,col,n){for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2,v=80+Math.random()*220;list.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:.6+Math.random()*.4,col:col})}}
function stepParts(c,list,dt){for(var i=list.length-1;i>=0;i--){var p=list[i];p.l-=dt;if(p.l<=0){list.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=500*dt;
  c.globalAlpha=Math.max(0,p.l);c.fillStyle=p.col;c.fillRect(p.x-2,p.y-2,4,4)}c.globalAlpha=1}

/* ---------- GAME: Flappy Hire ---------- */
function Flappy(){
  var S={};
  S.title="Flappy Hire";S.keys="Tap / click / <kbd>Space</kbd> to flap";
  S.intro="Flap between the rejection letters. Every gap you clear is another interview.";
  S.reset=function(){S.y=H/2;S.vy=-320;S.pipes=[];S.next=0.6;S.score=0;S.t=0;S.parts=[];S.dead=false;S.scroll=0};
  S.action=function(){if(!S.dead){S.vy=-420;S.squash=1;sfx("flap");particles(S.parts,160,S.y-10,"rgba(255,255,255,.6)",4)}};
  S.hud=function(){return["Interviews <b>"+S.score+"</b>","Best <b>"+Math.max(getBest("flappy"),S.score)+"</b>"]};
  var WORDS=["REJECTED","GHOSTED","NO REPLY","ON HOLD","OVERQUALIFIED"];
  S.update=function(dt){
    S.t+=dt;S.scroll+=180*dt;var sp=200+Math.min(S.score*4,120);
    S.vy+=1350*dt;S.y+=S.vy*dt;
    S.next-=dt;if(S.next<=0){S.next=1.35-Math.min(S.score*0.01,0.3);var gap=Math.max(165,215-S.score*2);var top=70+Math.random()*(H-140-gap);
      S.pipes.push({x:W+40,top:top,gap:gap,w:74,passed:false,word:WORDS[(Math.random()*WORDS.length)|0]})}
    for(var i=S.pipes.length-1;i>=0;i--){var p=S.pipes[i];p.x-=sp*dt;if(p.x<-120)S.pipes.splice(i,1);
      if(!p.passed&&p.x+p.w<170){p.passed=true;S.score++;particles(S.parts,170,S.y-30,O2,10);sfx("point");ring(170,S.y-30,O2)}
      var px=170,top=S.y-50,bot=S.y-4; // figure box (forgiving)
      if(px+12>p.x&&px-12<p.x+p.w&&(top<p.top||bot>p.top+p.gap)){sfx("crash");buzz([60,40,90]);boom(170,S.y-30,RED,14);particles(S.parts,170,S.y-30,RED,26);return "over"}}
    if(S.y>H-20||S.y<40){sfx("crash");buzz([60,40,90]);boom(170,Math.min(S.y,H-20)-20,RED,14);return "over"}
    S.squash=Math.max(0,(S.squash||0)-dt*5);
  };
  S.draw=function(c){glowBg(c);bgGrid(c,S.scroll*0.5);
    S.pipes.forEach(function(p){
      [[0,p.top],[p.top+p.gap,H-p.top-p.gap]].forEach(function(seg,i){var y=seg[0],h=seg[1];
        var g=c.createLinearGradient(p.x,0,p.x+p.w,0);g.addColorStop(0,"#1b1b24");g.addColorStop(1,"#14141b");c.fillStyle=g;rr(c,p.x,y-(i?0:10),p.w,h+10,10);c.fill();
        c.strokeStyle="rgba(255,77,77,.65)";c.lineWidth=2;c.stroke();
        c.save();c.translate(p.x+p.w/2,i?y+h/2:y/2);c.rotate(-Math.PI/2);label(c,p.word,0,0,15,RED);c.restore()})});
    var tilt=Math.max(-0.5,Math.min(0.9,S.vy/700));
    c.save();c.translate(170,S.y-29);c.rotate(tilt);var sq=S.squash||0;c.scale(1-sq*0.12,1+sq*0.18);stick(c,0,29,0.8,{flap:S.vy<0?-1.2+Math.sin(S.t*30)*0.6:0.6,t:S.t});
    // briefcase
    c.fillStyle=O2;c.fillRect(8,2,13,9);c.restore();
    stepParts(c,S.parts,1/60);
    c.fillStyle="rgba(255,106,0,.12)";c.fillRect(0,H-14,W,14);
  };
  S.over=function(){return{title:"Ghosted! 👻",big:S.score,text:S.score+" interview"+(S.score==1?"":"s")+" cleared. Recruiters love persistence.",score:S.score}};
  S.preview=function(c,t){var s=S;s.y=H/2+Math.sin(t*3)*50;s.vy=Math.cos(t*3)*-150;s.t=t;s.scroll=t*180;
    s.pipes=[0,1,2].map(function(i){var x=((W+300)-((t*200+i*300)%(W+300)));return{x:x-100,top:110+((i*97)%140),gap:215,w:74,word:WORDS[i]}});s.parts=[];s.draw(c)};
  return S;
}

/* ---------- GAME: Resume Pong ---------- */
function Pong(){
  var S={};S.title="Resume Pong";S.keys="Drag / move mouse, or <kbd>↑</kbd> <kbd>↓</kbd> / <kbd>W</kbd> <kbd>S</kbd>";
  S.intro="You (left) vs the Recruiter (right). Get your resume past their desk. First to 7 wins.";
  var PH=96,PW=14;
  S.reset=function(){S.py=H/2;S.ay=H/2;S.ps=0;S.as=0;S.t=0;S.parts=[];S.serve(1);S.target=null;S.keyDir=0};
  S.serve=function(dir){S.err=(Math.random()*2-1)*40;S.bx=W/2;S.by=H/2;var a=(Math.random()*0.8-0.4);S.sp=360;S.vx=Math.cos(a)*S.sp*dir;S.vy=Math.sin(a)*S.sp;S.wait=0.7};
  S.action=function(){};
  S.pointer=function(y){S.target=y};
  S.hud=function(){return["You <b>"+S.ps+"</b> : <b>"+S.as+"</b> Recruiter","Wins <b>"+getBest("pong")+"</b>"]};
  S.update=function(dt){S.t+=dt;
    if(S.keyDir){S.target=null;S.py+=S.keyDir*520*dt}
    if(S.target!=null)S.py+=(S.target-S.py)*Math.min(1,dt*14);
    S.py=Math.max(PH/2+10,Math.min(H-PH/2-10,S.py));
    var aiSp=290+S.ps*12,lead=(S.vx>0&&S.bx>W*0.35)?S.by+S.err:H/2;S.ay+=Math.max(-aiSp*dt,Math.min(aiSp*dt,(lead-S.ay)*0.9));S.ay=Math.max(PH/2+10,Math.min(H-PH/2-10,S.ay));
    if(S.wait>0){S.wait-=dt;return}
    S.bx+=S.vx*dt;S.by+=S.vy*dt;
    if(S.by<20){S.by=20;S.vy=Math.abs(S.vy);sfx("wall");ring(S.bx,20)}if(S.by>H-20){S.by=H-20;S.vy=-Math.abs(S.vy);sfx("wall");ring(S.bx,H-20)}
    function hit(px,py,dir){var off=(S.by-py)/(PH/2);off=Math.max(-1,Math.min(1,off));S.sp=Math.min(S.sp*1.06,820);var a=off*1.0+(Math.random()-0.5)*0.3;if(dir>0)S.err=(Math.random()*2-1)*(78-S.ps*3);else S.err=0;
      S.vx=Math.cos(a)*S.sp*dir;S.vy=Math.sin(a)*S.sp;particles(S.parts,px,S.by,O2,12);flash(0.25);sfx("hit",S.sp);boom(px,S.by,dir>0?O2:"#9a9aa8",3+S.sp/160);if(dir>0)buzz(18)}
    if(S.vx<0&&S.bx-12<60+PW&&S.bx>40&&Math.abs(S.by-S.py)<PH/2+12){S.bx=60+PW+12;hit(60+PW,S.py,1)}
    if(S.vx>0&&S.bx+12>W-60-PW&&S.bx<W-40&&Math.abs(S.by-S.ay)<PH/2+12){S.bx=W-60-PW-12;hit(W-60-PW,S.ay,-1)}
    if(S.bx<-20){S.as++;particles(S.parts,10,S.by,RED,20);sfx("miss");buzz(80);boom(20,S.by,RED,10);if(S.as>=7)return"over";S.serve(1)}
    if(S.bx>W+20){S.ps++;particles(S.parts,W-10,S.by,GRN,24);sfx("goal");boom(W-20,S.by,GRN,8);if(S.ps>=7)return"over";S.serve(-1)}
  };
  S.draw=function(c){glowBg(c);bgGrid(c,0);
    c.setLineDash([10,14]);c.strokeStyle="rgba(255,255,255,.12)";c.lineWidth=2;c.beginPath();c.moveTo(W/2,20);c.lineTo(W/2,H-20);c.stroke();c.setLineDash([]);
    label(c,S.ps,W/2-70,60,54,"rgba(255,255,255,.14)");label(c,S.as,W/2+70,60,54,"rgba(255,255,255,.14)");
    // paddles
    c.fillStyle=O;rr(c,60,S.py-PH/2,PW,PH,7);c.fill();c.fillStyle="#3a3a48";rr(c,W-60-PW,S.ay-PH/2,PW,PH,7);c.fill();
    c.strokeStyle=RED;c.lineWidth=2;c.stroke();
    stick(c,30,S.py+40,0.8,{arm:"up",t:S.t});
    stick(c,W-30,S.ay+40,0.8,{color:MUT,tie:false,t:S.t});
    label(c,"YOU",30,S.py-PH/2-14,12,O2);label(c,"RECRUITER",W-46,S.ay-PH/2-14,12,MUT);
    // resume ball
    c.save();c.translate(S.bx,S.by);c.rotate(S.t*4);c.fillStyle="#fff";rr(c,-11,-14,22,28,3);c.fill();
    c.fillStyle=O;c.fillRect(-7,-9,14,3);c.fillStyle="#bbb";c.fillRect(-7,-3,14,2);c.fillRect(-7,2,10,2);c.fillRect(-7,7,12,2);c.restore();
    stepParts(c,S.parts,1/60);
  };
  S.over=function(){var win=S.ps>S.as;if(win)setBest("pong",getBest("pong")+1);
    return{title:win?"You're hired! 🎉":"Rejected… for now",big:S.ps+" : "+S.as,text:win?"The recruiter couldn't stop your resume.":"Tweak your resume and try again.",score:null}};
  S.preview=function(c,t){S.t=t;S.ps=3;S.as=2;S.parts=[];var x=W/2+Math.sin(t*1.6)*(W/2-100);S.bx=x;S.by=H/2+Math.sin(t*2.7)*160;S.py=S.by;S.ay=S.by*0.8+H*0.1;S.draw(c)};
  return S;
}

/* ---------- GAME: Hire Rush ---------- */
function Rush(){
  var S={};S.title="Hire Rush";S.keys="Tap / click / <kbd>Space</kbd> / <kbd>↑</kbd> to jump · tap again in the air to double-jump";
  S.intro="Run to the offer letter. Jump over deadlines, bugs and layoffs. Grab skills to boost your package.";
  var GY=410;
  var OBS=[{w:46,h:40,t:"BUG"},{w:70,h:48,t:"DEADLINE"},{w:44,h:86,t:"LAYOFF"},{w:58,h:58,t:"2 YRS EXP"}];
  var SK=["Python","SQL","React","ML","DSA","Git","Excel","AWS"];
  S.reset=function(){S.y=GY;S.vy=0;S.jumps=0;S.obs=[];S.coins=[];S.t=0;S.dist=0;S.bonus=0;S.sp=330;S.next=1.1;S.nextC=0.8;S.parts=[];S.pops=[]};
  S.action=function(){if(S.jumps<2){S.vy=S.jumps?-560:-640;sfx(S.jumps?"jump2":"jump");S.jumps++;S.squash=-1;particles(S.parts,140,S.y,MUT,6);if(S.jumps===2)ring(140,S.y-30,O2)}};
  S.score=function(){return Math.floor(S.dist/250)+S.bonus};
  S.hud=function(){return["Package <b>"+S.score()+" LPA</b>","Best <b>"+Math.max(getBest("rush"),S.score())+"</b>"]};
  S.update=function(dt){S.t+=dt;S.sp=Math.min(330+S.t*9,720);S.dist+=S.sp*dt;
    S.vy+=1900*dt;S.y+=S.vy*dt;if(S.y>=GY){if(S.vy>600){S.squash=1;particles(S.parts,140,GY,MUT,8);FX.shake=Math.max(FX.shake,2)}S.y=GY;S.vy=0;S.jumps=0}
    S.squash=(S.squash||0)*Math.max(0,1-dt*8);
    S.next-=dt;if(S.next<=0){var o=OBS[(Math.random()*OBS.length)|0];S.obs.push({x:W+30,w:o.w,h:o.h,t:o.t});S.next=0.9+Math.random()*0.9-Math.min(S.t*0.006,0.4)}
    S.nextC-=dt;if(S.nextC<=0){S.coins.push({x:W+30,y:GY-90-Math.random()*130,t:SK[(Math.random()*SK.length)|0]});S.nextC=1.2+Math.random()*1.4}
    var fx=140;
    for(var i=S.obs.length-1;i>=0;i--){var o=S.obs[i];o.x-=S.sp*dt;if(o.x<-120){S.obs.splice(i,1);continue}
      if(fx+9>o.x+4&&fx-9<o.x+o.w-4&&S.y>GY-o.h+6){sfx("crash");buzz([60,40,90]);boom(fx+10,S.y-36,RED,14);particles(S.parts,fx+10,S.y-36,RED,26);return"over"}}
    for(i=S.coins.length-1;i>=0;i--){var k=S.coins[i];k.x-=S.sp*dt;if(k.x<-60){S.coins.splice(i,1);continue}
      if(Math.abs(k.x-fx)<34&&Math.abs(k.y-(S.y-36))<44){S.bonus+=2;sfx("coin");buzz(12);ring(k.x,k.y,GRN);particles(S.parts,k.x,k.y,GRN,14);S.pops.push({x:k.x,y:k.y,t:"+"+k.t,l:0.9});S.coins.splice(i,1)}}
    for(i=S.pops.length-1;i>=0;i--){S.pops[i].l-=dt;S.pops[i].y-=40*dt;if(S.pops[i].l<=0)S.pops.splice(i,1)}
  };
  S.draw=function(c){glowBg(c);
    // skyline
    c.fillStyle="#12121a";for(var i=0;i<12;i++){var bx=((i*110-(S.dist*0.15))%(W+220)+W+220)%(W+220)-110;var bh=80+((i*53)%120);c.fillRect(bx,GY-bh-20,80,bh+20);
      c.fillStyle="rgba(255,154,60,.18)";for(var wy=GY-bh;wy<GY-30;wy+=22){c.fillRect(bx+12,wy,10,8);c.fillRect(bx+50,wy,10,8)}c.fillStyle="#12121a"}
    bgGrid(c,S.dist*0.5);
    c.fillStyle="#17171f";c.fillRect(0,GY,W,H-GY);c.strokeStyle=O;c.lineWidth=2;c.beginPath();c.moveTo(0,GY);c.lineTo(W,GY);c.stroke();
    c.strokeStyle="rgba(255,106,0,.25)";for(var x=-(S.dist%60);x<W;x+=60){c.beginPath();c.moveTo(x,GY+20);c.lineTo(x+30,GY+20);c.stroke()}
    S.obs.forEach(function(o){c.fillStyle="#2a1214";rr(c,o.x,GY-o.h,o.w,o.h,6);c.fill();c.strokeStyle=RED;c.lineWidth=2;c.stroke();
      var fs=o.t.length>5?10:13;label(c,o.t,o.x+o.w/2,GY-o.h/2,fs,RED)});
    S.coins.forEach(function(k){var b=Math.sin(S.t*6+k.x*0.02)*4;c.fillStyle="rgba(43,212,107,.12)";c.beginPath();c.arc(k.x,k.y+b,26,0,7);c.fill();
      c.strokeStyle=GRN;c.lineWidth=2;c.beginPath();c.arc(k.x,k.y+b,20,0,7);c.stroke();label(c,k.t,k.x,k.y+b,11,GRN)});
    var sq=S.squash||0;c.save();c.translate(140,S.y);c.scale(1+sq*0.15,1-sq*0.15);stick(c,0,0,1.05,{run:S.y>=GY,t:S.t,flap:S.y<GY?-1:null});c.restore();
    stepParts(c,S.parts,1/60);
    S.pops.forEach(function(p){c.globalAlpha=Math.max(0,p.l);label(c,p.t,p.x,p.y,16,GRN);c.globalAlpha=1});
  };
  S.over=function(){var s=S.score();return{title:"Laid off! 💼",big:s+" LPA",text:"You ran "+Math.floor(S.dist/10)+"m toward the offer. Grab more skills next time.",score:s}};
  S.preview=function(c,t){S.reset();S.t=t;S.dist=t*330;S.y=GY-Math.max(0,Math.sin(t*3))*110;
    S.obs=[{x:((W+200)-(t*330)%(W+200))-60,w:70,h:48,t:"DEADLINE"},{x:((W+200)-(t*330+450)%(W+200))-60,w:44,h:86,t:"LAYOFF"}];
    S.coins=[{x:((W+200)-(t*330+220)%(W+200))-60,y:GY-170,t:"Python"}];S.draw(c)};
  return S;
}

/* ---------- GAME: Hire Racer ---------- */
function Racer(){
  var S={};S.title="Hire Racer";S.keys="Swipe up / down or tap above / below your car · <kbd>↑</kbd> <kbd>↓</kbd> on keyboard · <kbd>M</kbd> mute";
  S.intro="Race to your dream job. Switch lanes to dodge rejection traffic and grab offer letters for a boost.";
  var TOP=150,BOT=480,LN=3,LH=(BOT-TOP)/LN,PX=150;function ly(i){return TOP+LH*(i+0.5)}
  var CARS=[["REJECTED","#ff4d4d"],["GHOSTED","#8a8aa0"],["LOW PAY","#d4a72c"],["SPAM","#b05cff"],["NO REPLY","#4d8dff"]];
  S.reset=function(){S.lane=1;S.y=ly(1);S.t=0;S.dist=0;S.sp=420;S.cars=[];S.offers=[];S.next=1.0;S.nextO=2.2;S.bonus=0;S.parts=[];S.pops=[];S.boost=0;S.road=0};
  S.move=function(d){var n=Math.max(0,Math.min(LN-1,S.lane+d));if(n!==S.lane){S.lane=n;S.tilt=d;particles(S.parts,PX-50,S.y,MUT,5);sfx("lane");buzz(8)}};
  S.action=function(){S.move(-1)};
  S.key=function(k){if(k==="ArrowUp"||k==="w"||k==="W"){S.move(-1);return true}if(k==="ArrowDown"||k==="s"||k==="S"){S.move(1);return true}return false};
  S.tap=function(y){if(y<S.y-8)S.move(-1);else if(y>S.y+8)S.move(1)};
  S.score=function(){return Math.floor(S.dist/500)+S.bonus};
  S.hud=function(){return["Distance <b>"+S.score()+" km</b>","Best <b>"+Math.max(getBest("racer"),S.score())+"</b>"]};
  S.update=function(dt){S.t+=dt;S.boost=Math.max(0,S.boost-dt);
    S.sp=Math.min(420+S.t*11,960)+(S.boost>0?220:0);var rel=S.sp*0.62;S.dist+=S.sp*dt;S.road+=S.sp*dt;
    S.y+=(ly(S.lane)-S.y)*Math.min(1,dt*13);
    S.next-=dt;if(S.next<=0){
      var lanes=[0,1,2].sort(function(){return Math.random()-0.5});var two=S.t>8&&Math.random()<0.35;
      var pick=two?lanes.slice(0,2):lanes.slice(0,1);
      var recent={};S.cars.forEach(function(c){if(c.x>W-320)recent[c.lane]=1});
      pick=pick.filter(function(l){var u=Object.assign({},recent);u[l]=1;var ok=Object.keys(u).length<3;if(ok)recent[l]=1;return ok});
      pick.forEach(function(l,i){var c=CARS[(Math.random()*CARS.length)|0];S.cars.push({x:W+60+i*(30+Math.random()*60),lane:l,y:ly(l),t:c[0],col:c[1],sp:0.92+Math.random()*0.12})});
      S.next=Math.max(0.42,1.05-S.t*0.012)+Math.random()*0.35}
    S.nextO-=dt;if(S.nextO<=0){var l=(Math.random()*3)|0;S.offers.push({x:W+40,y:ly(l)});S.nextO=2.5+Math.random()*2}
    for(var i=S.cars.length-1;i>=0;i--){var c=S.cars[i];c.x-=rel*c.sp*dt;if(c.x<-140){S.cars.splice(i,1);continue}
      if(Math.abs(c.y-S.y)<LH*0.42&&c.x<PX+46&&c.x+96>PX-46){particles(S.parts,PX+40,S.y,RED,30);sfx("crash");buzz([80,40,120]);boom(PX+40,S.y,RED,16);return"over"}}
    for(i=S.offers.length-1;i>=0;i--){var o=S.offers[i];o.x-=rel*dt;if(o.x<-40){S.offers.splice(i,1);continue}
      if(Math.abs(o.y-S.y)<LH*0.45&&Math.abs(o.x-PX)<56){S.bonus+=3;S.boost=1.2;sfx("coin");sfx("boost");buzz(20);boom(PX,S.y,GRN,5);particles(S.parts,o.x,o.y,GRN,16);S.pops.push({x:o.x,y:o.y-30,t:"+3 km OFFER!",l:1});S.offers.splice(i,1)}}
    for(i=S.pops.length-1;i>=0;i--){S.pops[i].l-=dt;S.pops[i].y-=40*dt;if(S.pops[i].l<=0)S.pops.splice(i,1)}
  };
  function car(c,x,y,col,lab,me){c.save();c.translate(x,y);
    c.fillStyle="rgba(0,0,0,.35)";rr(c,-44,-20,96,46,12);c.fill();
    c.fillStyle=col;rr(c,-48,-24,96,48,12);c.fill();
    c.fillStyle="rgba(0,0,0,.35)";rr(c,-14,-19,38,38,8);c.fill();
    c.fillStyle="rgba(255,255,255,.75)";rr(c,24,-18,10,36,4);c.fill();
    c.fillStyle="#111";c.fillRect(-36,-28,20,6);c.fillRect(20,-28,20,6);c.fillRect(-36,22,20,6);c.fillRect(20,22,20,6);
    if(me){c.strokeStyle=TXT;c.lineWidth=2.4;c.beginPath();c.arc(4,0,8,0,7);c.stroke();c.fillStyle=O;c.fillRect(-3,8,4,9);
      c.fillStyle="#fff7";c.fillRect(48,-16,8,8);c.fillRect(48,8,8,8)}
    else{c.fillStyle="#fff";c.font="700 10px 'Space Grotesk',Inter,sans-serif";c.textAlign="center";c.textBaseline="middle";c.save();c.translate(-30,0);c.rotate(-Math.PI/2);c.fillText(lab,0,0);c.restore();
      c.fillStyle="#ff4d4d";c.fillRect(-50,-16,4,8);c.fillRect(-50,8,4,8)}
    c.restore()}
  S.draw=function(c){glowBg(c);
    // skyline + dream job tower
    for(var i=0;i<14;i++){var bx=((i*95-(S.road*0.05))%(W+190)+W+190)%(W+190)-95;var bh=40+((i*41)%70);c.fillStyle="#13131b";c.fillRect(bx,TOP-bh-8,70,bh+8);
      c.fillStyle="rgba(255,154,60,.2)";for(var wy=TOP-bh;wy<TOP-16;wy+=16){c.fillRect(bx+10,wy,8,6);c.fillRect(bx+46,wy,8,6)}}
    label(c,"DREAM JOB →",W-90,40,16,O2);
    // road
    c.fillStyle="#141419";c.fillRect(0,TOP-8,W,BOT-TOP+16);
    c.fillStyle=O;c.fillRect(0,TOP-8,W,4);c.fillRect(0,BOT+4,W,4);
    c.fillStyle="rgba(255,255,255,.35)";var off=S.road*0.62%80;
    for(var l=1;l<LN;l++){var yy=TOP+LH*l;for(var x=-off;x<W;x+=80)c.fillRect(x,yy-2,44,4)}
    // speed lines
    c.strokeStyle="rgba(255,154,60,"+(0.08+Math.min(S.sp,1000)/1000*0.15)+")";c.lineWidth=2;
    for(i=0;i<10;i++){var sy=TOP+((i*67+S.t*90)%(BOT-TOP));var sx=W-((S.road*1.1+i*137)%(W+200));c.beginPath();c.moveTo(sx,sy);c.lineTo(sx+60,sy);c.stroke()}
    S.offers.forEach(function(o){var b=Math.sin(S.t*6+o.x*0.03)*3;c.fillStyle="rgba(43,212,107,.15)";c.beginPath();c.arc(o.x,o.y+b,30,0,7);c.fill();
      c.fillStyle="#fff";rr(c,o.x-13,o.y+b-17,26,34,3);c.fill();c.fillStyle=GRN;c.fillRect(o.x-8,o.y+b-11,16,4);c.fillStyle="#bbb";c.fillRect(o.x-8,o.y+b-3,16,2);c.fillRect(o.x-8,o.y+b+3,11,2);
      label(c,"OFFER",o.x,o.y+b+30,10,GRN)});
    S.cars.forEach(function(k){car(c,k.x+48,k.y,k.col,k.t,false)});
    if(S.boost>0){c.fillStyle="rgba(255,154,60,.5)";for(i=0;i<3;i++){c.beginPath();c.moveTo(PX-50,S.y-12+i*12);c.lineTo(PX-80-Math.random()*40,S.y-12+i*12);c.lineTo(PX-50,S.y-8+i*12);c.fill()}}
    c.save();c.translate(PX,S.y);c.rotate(Math.max(-0.3,Math.min(0.3,(ly(S.lane)-S.y)/LH*0.35)));car(c,0,0,O,"",true);c.restore();
    stepParts(c,S.parts,1/60);
    S.pops.forEach(function(p){c.globalAlpha=Math.max(0,p.l);label(c,p.t,p.x,p.y,15,GRN);c.globalAlpha=1});
  };
  S.over=function(){var s=S.score();return{title:"Crashed into rejection! 💥",big:s+" km",text:"Every crash is practice. Your dream job is still down that road.",score:s}};
  S.preview=function(c,t){S.reset();S.t=t;S.road=t*500;S.lane=Math.round(1+Math.sin(t*1.3));S.y=ly(1)+Math.sin(t*1.3)*LH*0.9;
    S.cars=[0,1,2].map(function(i){var x=((W+300)-((t*260+i*330)%(W+300)))-80;var c=CARS[i];return{x:x,y:ly((i*2+1)%3),t:c[0],col:c[1]}});
    S.offers=[{x:((W+300)-((t*260+170)%(W+300)))-40,y:ly(1)}];S.draw(c)};
  return S;
}

/* ---------- live preview helper (bot plays silently) ---------- */
var QUIET=false;
function livePreview(S,bot){var lt=null;return function(c,t){
  if(!S._pv||lt===null||t<lt){S.reset();S._pv=true;lt=t;S._warm=0}
  var dt=Math.min(Math.max(t-lt,0),1/30);lt=t;QUIET=true;
  try{bot(S);if(S.update(dt||1/60)==="over"){S.reset()}}catch(e){S.reset()}finally{QUIET=false}
  S.draw(c)}}
function sky(c,top,bot){var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,top);g.addColorStop(1,bot);c.fillStyle=g;c.fillRect(0,0,W,H)}
function confetti(list,x,y,n){var cols=[O,O2,GRN,"#4d8dff","#ffd23f",TXT];for(var i=0;i<n;i++){var a=-Math.PI/2+(Math.random()-0.5)*2.2,v=200+Math.random()*320;list.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:1+Math.random()*0.6,col:cols[i%cols.length]})}}

/* ---------- GAME: Golf Cart Dash ---------- */
function Cart(){
  var S={};S.title="Golf Cart Dash";S.keys="Hold to drive, let go to brake · in the air: hold = lean back · <kbd>Space</kbd> / <kbd>↑</kbd>";
  S.intro="Drive your golf cart over the hills to the job fair. Land on your wheels and grab the green OFFER flags.";
  S.hold=true;var CX=210,G=950;
  function hY(x){var r=Math.min(1,x/2500);return 350+Math.sin(x*0.004)*50*(0.4+0.6*r)+Math.sin(x*0.011+1)*22*r+Math.sin(x*0.0023+2)*38*r+Math.max(0,Math.sin(x*0.0017))*-60*r}
  function slope(x){return Math.atan2(hY(x+3)-hY(x-3),6)}
  S.reset=function(){S.x=0;S.v=60;S.y=hY(CX);S.vy=0;S.ang=slope(CX);S.va=0;S.air=false;S.on=false;S.t=0;S.flags=[];S.nextF=900;S.bonus=0;S.parts=[];S.pops=[];S.airT=0};
  S.press=function(on){S.on=on;if(on)sfx("rev")};
  S.action=function(){};
  S.score=function(){return Math.floor(S.x/80)+S.bonus};
  S.hud=function(){return["Distance <b>"+S.score()+" m</b>","Best <b>"+Math.max(getBest("cart"),S.score())+"</b>"]};
  S.update=function(dt){S.t+=dt;var wx=S.x+CX;
    var vmax=430+Math.min(S.t*3,200);
    if(!S.air){var a=slope(wx);S.v+=(S.on?300:-260)*dt+Math.sin(a)*420*dt;S.v=Math.max(S.on?40:0,Math.min(vmax,S.v));
      var nx=S.x+S.v*Math.cos(a)*dt,ny=hY(nx+CX),pvy=(ny-S.y)/dt;
      if(pvy-S.vy>G*dt*1.0&&S.v>150){S.air=true;S.airT=0;S.vy=S.vy+G*dt;S.va=0;S.x=nx;S.y+=S.vy*dt;sfx("whoosh")}
      else{S.x=nx;S.vy=pvy;S.y=ny;S.ang+=(slope(nx+CX)-S.ang)*Math.min(1,dt*18)}
      if(S.v>200&&Math.random()<0.3)S.parts.push({x:CX-40,y:S.y-4,vx:-80-Math.random()*60,vy:-60*Math.random(),l:0.4,col:"rgba(120,200,120,.7)"})}
    else{S.airT+=dt;S.vy+=G*dt;S.x+=S.v*dt;S.y+=S.vy*dt;S.va+=(S.on?-3.6:2.6)*dt;S.va*=0.985;S.ang+=S.va*dt;
      var gy=hY(S.x+CX);if(S.y>=gy){var d=Math.abs(S.ang-slope(S.x+CX));
        if(d>0.8){sfx("crash");buzz([70,40,110]);boom(CX,gy-20,RED,16);particles(S.parts,CX,gy-20,RED,28);return"over"}
        S.air=false;S.y=gy;S.ang=slope(S.x+CX);var hard=S.vy>520;S.vy=0;
        if(S.airT>0.7){S.bonus+=2;S.pops.push({x:CX,y:gy-90,t:"+2 AIR TIME!",l:1});sfx("coin")}
        if(hard){FX.shake=Math.max(FX.shake,6);buzz(30);sfx("thud")}particles(S.parts,CX,gy,"rgba(160,220,140,.8)",10)}}
    if(S.x+CX+W>S.nextF){S.flags.push({x:S.nextF});S.nextF+=700+Math.random()*900}
    for(var i=S.flags.length-1;i>=0;i--){var f=S.flags[i];if(f.x<S.x-100){S.flags.splice(i,1);continue}
      if(!f.got&&Math.abs(f.x-(S.x+CX))<34&&S.y>hY(f.x)-110){f.got=true;S.bonus+=5;sfx("coin");buzz(15);ring(CX,S.y-40,GRN);S.pops.push({x:CX,y:S.y-90,t:"+5 OFFER!",l:1})}}
    for(i=S.pops.length-1;i>=0;i--){S.pops[i].l-=dt;S.pops[i].y-=40*dt;if(S.pops[i].l<=0)S.pops.splice(i,1)}
  };
  S.draw=function(c){sky(c,"#120b08","#0b0b10");var cam=S.x;
    var g=c.createRadialGradient(W*0.75,90,10,W*0.75,90,300);g.addColorStop(0,"rgba(255,140,40,.45)");g.addColorStop(1,"rgba(255,106,0,0)");c.fillStyle=g;c.fillRect(0,0,W,H);
    c.fillStyle="#ffb066";c.beginPath();c.arc(W*0.75,95,34,0,7);c.fill();
    c.fillStyle="#15151d";c.beginPath();c.moveTo(0,H);for(var x=0;x<=W;x+=20)c.lineTo(x,250+Math.sin((x+cam*0.2)*0.006)*40);c.lineTo(W,H);c.fill();
    c.fillStyle="#122016";c.beginPath();c.moveTo(0,H);for(x=0;x<=W+10;x+=10)c.lineTo(x,hY(x+cam));c.lineTo(W,H);c.closePath();c.fill();
    c.strokeStyle="#3ba55c";c.lineWidth=4;c.beginPath();for(x=0;x<=W+10;x+=10){var yy=hY(x+cam);x?c.lineTo(x,yy):c.moveTo(x,yy)}c.stroke();
    S.flags.forEach(function(f){var fx=f.x-cam,fy=hY(f.x);if(fx<-40||fx>W+40)return;c.strokeStyle=TXT;c.lineWidth=2;c.beginPath();c.moveTo(fx,fy);c.lineTo(fx,fy-70);c.stroke();
      c.fillStyle=f.got?"#555":GRN;c.beginPath();c.moveTo(fx,fy-70);c.lineTo(fx+30,fy-60);c.lineTo(fx,fy-50);c.fill();if(!f.got)label(c,"OFFER",fx+2,fy-80,10,GRN)});
    c.save();c.translate(CX,S.y);c.rotate(S.ang);
    c.fillStyle="#111";[-26,26].forEach(function(w){c.beginPath();c.arc(w,-10,11,0,7);c.fill();c.strokeStyle="#666";c.lineWidth=2;c.beginPath();c.arc(w,-10,5,0,7);c.stroke()});
    c.fillStyle="#f4f4f6";rr(c,-44,-34,88,20,6);c.fill();c.fillStyle=O;c.fillRect(-44,-24,88,6);
    c.strokeStyle="#ddd";c.lineWidth=3;c.beginPath();c.moveTo(-34,-34);c.lineTo(-30,-78);c.moveTo(30,-34);c.lineTo(26,-78);c.stroke();
    c.fillStyle=O;rr(c,-40,-86,74,10,4);c.fill();
    stick(c,-4,-34,0.62,{arm:"up",t:S.t});
    c.fillStyle="#bbb";c.fillRect(-46,-48,10,14);
    c.restore();
    stepParts(c,S.parts,1/60);S.pops.forEach(function(p){c.globalAlpha=Math.max(0,p.l);label(c,p.t,p.x,p.y,15,GRN);c.globalAlpha=1});
    label(c,"JOB FAIR →",W-80,30,14,O2);
  };
  S.over=function(){var s=S.score();return{title:"Cart flipped! 🛺",big:s+" m",text:"Land flat on your wheels: hold to lean back in the air.",score:s}};
  S.preview=livePreview(S,function(g){if(!g.air)g.on=true;else g.on=g.ang>0.05});
  return S;
}

/* ---------- GAME: Hire Flight ---------- */
function Flight(){
  var S={};S.title="Hire Flight";S.keys="Hold to climb, let go to dive · <kbd>Space</kbd> / <kbd>↑</kbd>";
  S.intro="Fly your career jet past REJECTION storms and LAYOFF towers. Grab offer stars on the way.";
  S.hold=true;var PX=180;
  S.reset=function(){S.y=230;S.vy=0;S.on=false;S.t=0;S.dist=0;S.sp=260;S.obs=[];S.stars=[];S.next=1.2;S.nextS=1.6;S.bonus=0;S.parts=[];S.pops=[];S.cl=[0,1,2,3,4,5].map(function(i){return{x:i*170,y:40+Math.random()*300,s:0.5+Math.random()}})};
  S.press=function(on){S.on=on;if(on)sfx("whoosh")};S.action=function(){};
  S.score=function(){return Math.floor(S.dist/300)+S.bonus};
  S.hud=function(){return["Flight <b>"+S.score()+" km</b>","Best <b>"+Math.max(getBest("flight"),S.score())+"</b>"]};
  S.update=function(dt){S.t+=dt;S.sp=Math.min(260+S.t*7,560);S.dist+=S.sp*dt;
    S.vy+=(S.on?-950:720)*dt;S.vy=Math.max(-330,Math.min(380,S.vy));S.y+=S.vy*dt;
    if(Math.random()<0.6)S.parts.push({x:PX-46,y:S.y+2,vx:-S.sp*0.6,vy:0,l:0.45,col:"rgba(255,255,255,.35)"});
    S.cl.forEach(function(k){k.x-=S.sp*0.25*k.s*dt;if(k.x<-160){k.x=W+80;k.y=30+Math.random()*320}});
    S.next-=dt;if(S.next<=0){var r=Math.random();
      if(r<0.55)S.obs.push({k:"storm",x:W+80,y:70+Math.random()*300,r:42+Math.random()*26});
      else S.obs.push({k:"tower",x:W+60,w:60,h:110+Math.random()*140});
      S.next=Math.max(0.55,1.25-S.t*0.012)+Math.random()*0.4}
    S.nextS-=dt;if(S.nextS<=0){S.stars.push({x:W+40,y:60+Math.random()*320});S.nextS=1.8+Math.random()*1.6}
    if(S.y<26||S.y>H-34){sfx("crash");buzz([70,40,110]);boom(PX,S.y,RED,16);particles(S.parts,PX,S.y,RED,28);return"over"}
    for(var i=S.obs.length-1;i>=0;i--){var o=S.obs[i];o.x-=S.sp*dt;if(o.x<-140){S.obs.splice(i,1);continue}
      var hitb=false;if(o.k==="storm"){var dx=o.x-PX,dy=o.y-S.y;hitb=dx*dx+dy*dy<(o.r+14)*(o.r+14)}
      else hitb=PX+40>o.x&&PX-40<o.x+o.w&&S.y+12>H-o.h;
      if(hitb){sfx("crash");buzz([70,40,110]);boom(PX,S.y,RED,16);particles(S.parts,PX,S.y,RED,28);return"over"}}
    for(i=S.stars.length-1;i>=0;i--){var s=S.stars[i];s.x-=S.sp*dt;if(s.x<-30){S.stars.splice(i,1);continue}
      if(Math.abs(s.x-PX)<38&&Math.abs(s.y-S.y)<34){S.bonus+=3;sfx("coin");buzz(15);ring(s.x,s.y,"#ffd23f");particles(S.parts,s.x,s.y,"#ffd23f",14);S.pops.push({x:s.x,y:s.y-24,t:"+3 OFFER",l:1});S.stars.splice(i,1)}}
    for(i=S.pops.length-1;i>=0;i--){S.pops[i].l-=dt;S.pops[i].y-=40*dt;if(S.pops[i].l<=0)S.pops.splice(i,1)}
  };
  function star(c,x,y,r){c.beginPath();for(var i=0;i<10;i++){var a=-Math.PI/2+i*Math.PI/5,rr2=i%2?r*0.45:r;c.lineTo(x+Math.cos(a)*rr2,y+Math.sin(a)*rr2)}c.closePath();c.fill()}
  S.draw=function(c){sky(c,"#0d0a14","#1a0f08");
    c.fillStyle="rgba(255,255,255,.05)";S.cl.forEach(function(k){c.beginPath();c.ellipse(k.x,k.y,70*k.s+30,22*k.s+10,0,0,7);c.fill()});
    c.fillStyle="#1a1a22";for(var i=0;i<10;i++){var bx=((i*110-S.dist*0.1)%(W+220)+W+220)%(W+220)-110;c.fillRect(bx,H-30-((i*37)%60),70,90)}
    c.fillStyle="#24161a";c.fillRect(0,H-30,W,30);c.fillStyle=O;c.fillRect(0,H-30,W,2);
    S.obs.forEach(function(o){if(o.k==="storm"){var gg=c.createRadialGradient(o.x,o.y,4,o.x,o.y,o.r);gg.addColorStop(0,"#5a2230");gg.addColorStop(1,"#2a1018");c.fillStyle=gg;
        c.beginPath();c.arc(o.x,o.y,o.r,0,7);c.arc(o.x-o.r*0.7,o.y+8,o.r*0.65,0,7);c.arc(o.x+o.r*0.7,o.y+6,o.r*0.7,0,7);c.fill();
        c.strokeStyle=RED;c.lineWidth=2;c.beginPath();c.moveTo(o.x-4,o.y+o.r*0.6);c.lineTo(o.x+6,o.y+o.r*0.95);c.lineTo(o.x-2,o.y+o.r*0.95);c.lineTo(o.x+8,o.y+o.r*1.3);c.stroke();
        label(c,"REJECTION",o.x,o.y,11,RED)}
      else{c.fillStyle="#2a1214";rr(c,o.x,H-o.h,o.w,o.h+10,6);c.fill();c.strokeStyle=RED;c.lineWidth=2;c.stroke();
        c.fillStyle="rgba(255,77,77,.25)";for(var y=H-o.h+14;y<H-20;y+=18){c.fillRect(o.x+10,y,12,8);c.fillRect(o.x+36,y,12,8)}
        c.save();c.translate(o.x+o.w/2,H-o.h/2);c.rotate(-Math.PI/2);label(c,"LAYOFF TOWER",0,0,11,RED);c.restore()}});
    c.fillStyle="#ffd23f";S.stars.forEach(function(s){var b=Math.sin(S.t*6+s.x*0.05)*3;star(c,s.x,s.y+b,15)});
    stepParts(c,S.parts,1/60);
    c.save();c.translate(PX,S.y);c.rotate(Math.max(-0.45,Math.min(0.5,S.vy/700)));
    c.fillStyle=O;rr(c,-44,-10,88,20,10);c.fill();c.fillStyle=O2;c.beginPath();c.moveTo(-10,0);c.lineTo(-24,30);c.lineTo(10,30);c.lineTo(14,0);c.fill();
    c.beginPath();c.moveTo(-40,-6);c.lineTo(-52,-26);c.lineTo(-30,-6);c.fill();
    c.fillStyle="#9fd3ff";rr(c,4,-18,22,12,6);c.fill();c.strokeStyle=TXT;c.lineWidth=2;c.beginPath();c.arc(14,-14,5,0,7);c.stroke();
    c.fillStyle="#ddd";c.fillRect(44,-3,4,6);c.strokeStyle="rgba(255,255,255,.7)";c.lineWidth=3;var pr=Math.sin(S.t*60)*14;c.beginPath();c.moveTo(48,-pr);c.lineTo(48,pr);c.stroke();
    c.restore();
    S.pops.forEach(function(p){c.globalAlpha=Math.max(0,p.l);label(c,p.t,p.x,p.y,15,"#ffd23f");c.globalAlpha=1});
  };
  S.over=function(){var s=S.score();return{title:"Crash landed! ✈️",big:s+" km",text:"Short taps keep you steady. Your dream job is still out there.",score:s}};
  S.preview=livePreview(S,function(g){var o=g.obs.filter(function(o){return o.x>PX-60&&o.x<PX+260})[0];var ty=230;
    if(o){if(o.k==="storm")ty=o.y>230?o.y-o.r-60:o.y+o.r+60;else ty=Math.min(ty,H-o.h-70)}ty=Math.max(70,Math.min(H-90,ty));g.on=g.y>ty+(g.vy>0?-20:20)});
  return S;
}

/* ---------- GAME: Hire Cricket ---------- */
function Cricket(){
  var S={};S.title="Hire Cricket";S.keys="Tap / <kbd>Space</kbd> to swing the bat. Time it as the ball reaches you";
  S.intro="The HR bowler is throwing tricky interview questions. Time your swing for FOURs and SIXes. 3 wickets and you're out.";
  var BX=620,GY=400,RX=210;
  S.reset=function(){S.runs=0;S.wk=0;S.balls=0;S.t=0;S.st="run";S.bt=0;S.u=0;S.T=1.0;S.swing=-1;S.ball=null;S.res=null;S.parts=[];S.pops=[];S.fly=null;S.wait=0.6;S.stumps=0};
  S.action=function(){if(S.swing<0){S.swing=0;sfx("swing");if(S.st==="ball"&&S.ball&&!S.res){S.judge()}}};
  S.judge=function(){var d=Math.abs(S.u-0.95);var r=d<0.045?6:d<0.09?4:d<0.16?(Math.random()<0.5?1:2):-1;
    if(r<0)return;S.res=r;S.runs+=r;var big=r>=4;sfx(big?"bat":"tap");buzz(big?[25,20,40]:12);boom(BX-20,330,big?GRN:O2,big?12:5);
    S.fly={x:BX-20,y:330,vx:r===6?-620:r===4?-700:-300,vy:r===6?-620:r===4?-180:-60};
    S.pops.push({x:BX-40,y:250,t:r===6?"SIX!":r===4?"FOUR!":r+" RUN"+(r>1?"S":""),l:1.3,big:big});
    if(r===6){confetti(S.parts,BX-20,300,40);var q=QUIET;setTimeout(function(){if(!q)sfx("win")},120)}};
  S.score=function(){return S.runs};
  S.hud=function(){return["Runs <b>"+S.runs+"</b> · Wkts <b>"+S.wk+"/3</b>","Best <b>"+Math.max(getBest("cricket"),S.runs)+"</b>"]};
  S.update=function(dt){S.t+=dt;if(S.swing>=0){S.swing+=dt;if(S.swing>0.28)S.swing=-1}
    if(S.st==="run"){S.wait-=dt;if(S.wait<=0){S.st="ball";S.u=0;S.res=null;S.ball={};S.T=Math.max(0.55,1.0-S.balls*0.02)*(0.9+Math.random()*0.2);S.bounce=0.6+Math.random()*0.12;sfx("whoosh")}}
    else if(S.st==="ball"){S.u+=dt/S.T;
      if(S.res===null&&S.u>1.08){S.balls++;var out=Math.random()<0.75;if(out){S.wk++;S.stumps=1;sfx("crash");buzz([60,40,90]);boom(BX+42,350,RED,12);particles(S.parts,BX+42,340,RED,20);S.pops.push({x:BX-40,y:250,t:"BOWLED!",l:1.3})}
        else{sfx("tap");S.pops.push({x:BX-40,y:250,t:"DOT BALL",l:1})}
        S.st="run";S.wait=1.1;if(S.wk>=3)return"over"}
      if(S.res!==null&&S.u>1.0){S.balls++;S.st="run";S.wait=1.2}}
    if(S.fly){S.fly.vy+=600*dt;S.fly.x+=S.fly.vx*dt;S.fly.y+=S.fly.vy*dt;if(S.fly.y>GY){S.fly.y=GY;S.fly.vy*=-0.4}if(S.fly.x<-40)S.fly=null}
    S.stumps=Math.max(0,S.stumps-dt*0.8);
    for(var i=S.pops.length-1;i>=0;i--){S.pops[i].l-=dt;S.pops[i].y-=30*dt;if(S.pops[i].l<=0)S.pops.splice(i,1)}
  };
  function ballPos(u,b){var x=RX+(BX-RX)*u,y;if(u<b)y=250+(GY-250)*(u/b);else y=GY-(GY-330)*Math.min(1,(u-b)/(1-b))*(1-0.3*Math.max(0,u-1));return[x,y]}
  S.draw=function(c){sky(c,"#0b1410","#0b0b10");
    c.fillStyle="rgba(255,154,60,.12)";c.beginPath();c.ellipse(W/2,40,420,90,0,0,7);c.fill();
    for(var i=0;i<4;i++){c.fillStyle="rgba(255,255,255,.08)";c.fillRect(60+i*200,30,6,110);c.fillStyle="rgba(255,230,180,.35)";c.fillRect(48+i*200,24,30,10)}
    c.fillStyle="#0f2a17";c.fillRect(0,GY-40,W,H);for(i=0;i<8;i++){c.fillStyle=i%2?"#11301a":"#0f2a17";c.fillRect(i*100,GY-40,100,H)}
    c.fillStyle="#3a3324";c.fillRect(RX-20,GY-6,BX-RX+80,16);
    label(c,"CROWD: HR TEAM",W/2,170,12,"rgba(255,255,255,.25)");
    // stumps
    c.save();c.translate(BX+42,GY);c.rotate(S.stumps*0.5);c.fillStyle="#e8d7b0";for(i=0;i<3;i++)c.fillRect(-8+i*7,-58,4,58);c.fillRect(-10,-62,24,4);c.restore();
    // bowler
    var bx=S.st==="run"?RX-60+Math.min(1,(1.1-S.wait)/1.1)*60:RX;stick(c,bx,GY,1,{run:S.st==="run",t:S.t,color:MUT,tie:false});label(c,"HR",bx,GY-90,12,MUT);
    // batsman
    var sw=S.swing>=0?S.swing/0.28:0;stick(c,BX,GY,1.1,{t:S.t});c.save();c.translate(BX-6,GY-54);c.rotate(-1.9+sw*2.6);c.fillStyle="#d9b77a";rr(c,-4,0,9,58,3);c.fill();c.fillStyle="#333";c.fillRect(-2,-12,5,14);c.restore();
    c.fillStyle=O;c.fillRect(BX-12,GY-30,24,6);label(c,"YOU",BX,GY-100,12,O2);
    if(S.st==="ball"&&S.res===null){var p=ballPos(S.u,S.bounce);c.fillStyle="#fff";c.beginPath();c.arc(p[0],p[1],8,0,7);c.fill();c.strokeStyle=RED;c.lineWidth=2;c.beginPath();c.arc(p[0],p[1],8,0.5,2.6);c.stroke()}
    if(S.fly){c.fillStyle="#fff";c.beginPath();c.arc(S.fly.x,S.fly.y,8,0,7);c.fill()}
    // timing meter
    var mx=W-210,my=H-26;c.fillStyle="rgba(255,255,255,.08)";rr(c,mx,my-8,180,16,8);c.fill();c.fillStyle="rgba(255,154,60,.35)";c.fillRect(mx+180*0.79,my-8,180*0.32,16);c.fillStyle="rgba(43,212,107,.6)";c.fillRect(mx+180*0.905,my-8,180*0.09,16);
    if(S.st==="ball"&&S.res===null){c.fillStyle=O;c.fillRect(mx+Math.min(1,S.u)*180-2,my-11,4,22)}label(c,"TIMING",mx-40,my,11,MUT);
    stepParts(c,S.parts,1/60);
    S.pops.forEach(function(p){c.globalAlpha=Math.min(1,Math.max(0,p.l));label(c,p.t,p.x,p.y,p.big?44:26,p.t==="BOWLED!"?RED:p.big?GRN:O2);c.globalAlpha=1});
  };
  S.over=function(){return{title:"All out! 🏏",big:S.runs+" runs",text:"Watch the timing bar: swing when the marker hits the green zone.",score:S.runs}};
  S.preview=livePreview(S,function(g){if(g.st==="ball"&&g.res===null&&g.u>0.93+((g.balls*37)%7)*0.006)g.action()});
  return S;
}

/* ---------- GAME: Hire Touchdown ---------- */
function Football(){
  var S={};S.title="Hire Touchdown";S.keys="Swipe up / down (or <kbd>↑</kbd> <kbd>↓</kbd>) to dodge · tap / <kbd>Space</kbd> = spin move";
  S.intro="Carry your resume to the end zone. Dodge HR tacklers, spin past them, and score a touchdown every 100 yards.";
  var TOP=170,BOT=470,LN=3,LH=(BOT-TOP)/LN,PX=170;function ly(i){return TOP+LH*(i+0.5)}
  var TK=["HR","BG CHECK","NOTICE","GAP YEAR","REFS"];
  S.reset=function(){S.lane=1;S.y=ly(1);S.t=0;S.yd=0;S.sp=300;S.tk=[];S.next=1.0;S.td=0;S.spin=0;S.cool=0;S.parts=[];S.pops=[];S.nextTD=100};
  S.move=function(d){var n=Math.max(0,Math.min(LN-1,S.lane+d));if(n!==S.lane){S.lane=n;sfx("lane");buzz(8);particles(S.parts,PX-10,S.y,"rgba(255,255,255,.5)",5)}};
  S.tap=function(){S.action()};
  S.action=function(){if(S.cool<=0){S.spin=0.5;S.cool=1.4;sfx("whoosh");ring(PX,S.y-30,O2);buzz(10)}};
  S.key=function(k){if(k==="ArrowUp"||k==="w"||k==="W"){S.move(-1);return true}if(k==="ArrowDown"||k==="s"||k==="S"){S.move(1);return true}if(k===" "){S.action();return true}return false};
  S.score=function(){return Math.floor(S.yd)+S.td*60};
  S.hud=function(){return["Yards <b>"+Math.floor(S.yd)+"</b> · TD <b>"+S.td+"</b>","Best <b>"+Math.max(getBest("football"),S.score())+"</b>"]};
  S.update=function(dt){S.t+=dt;S.sp=Math.min(300+S.t*8,640);S.yd+=S.sp*dt/40;S.spin=Math.max(0,S.spin-dt);S.cool=Math.max(0,S.cool-dt);
    S.y+=(ly(S.lane)-S.y)*Math.min(1,dt*14);
    if(S.yd>=S.nextTD){S.td++;S.nextTD+=100;sfx("win");buzz([30,30,30]);confetti(S.parts,PX+40,S.y-40,46);boom(PX,S.y-30,GRN,8);S.pops.push({x:W/2,y:200,t:"TOUCHDOWN!",l:1.6,big:true})}
    S.next-=dt;if(S.next<=0){var lanes=[0,1,2].sort(function(){return Math.random()-0.5});var two=S.t>7&&Math.random()<0.35;var pick=two?lanes.slice(0,2):lanes.slice(0,1);
      var recent={};S.tk.forEach(function(k){if(k.x>W-300)recent[k.lane]=1});
      pick.filter(function(l){var u=Object.assign({},recent);u[l]=1;var ok=Object.keys(u).length<3;if(ok)recent[l]=1;return ok}).forEach(function(l,i){S.tk.push({x:W+50+i*60,lane:l,y:ly(l),t:TK[(Math.random()*TK.length)|0],sp:1.15+Math.random()*0.2,hit:false})});
      S.next=Math.max(0.45,1.0-S.t*0.012)+Math.random()*0.35}
    for(var i=S.tk.length-1;i>=0;i--){var k=S.tk[i];k.x-=S.sp*k.sp*dt;if(k.x<-80){S.tk.splice(i,1);continue}
      if(!k.hit&&Math.abs(k.y-S.y)<LH*0.4&&Math.abs(k.x-PX)<34){
        if(S.spin>0){k.hit=true;k.spinOut=1;sfx("hit",500);boom(k.x,k.y-30,O2,6);S.pops.push({x:k.x,y:k.y-80,t:"JUKED!",l:0.9});S.yd+=5}
        else{sfx("crash");buzz([80,40,120]);boom(PX,S.y-30,RED,16);particles(S.parts,PX,S.y-30,RED,26);return"over"}}}
    for(i=S.pops.length-1;i>=0;i--){S.pops[i].l-=dt;S.pops[i].y-=30*dt;if(S.pops[i].l<=0)S.pops.splice(i,1)}
  };
  S.draw=function(c){sky(c,"#0b0f0b","#0b0b10");
    c.fillStyle="rgba(255,255,255,.05)";for(var i=0;i<30;i++){c.fillRect((i*53)%W,20+(i*29)%110,3,3)}
    label(c,"STADIUM OF OFFERS",W/2,60,14,"rgba(255,255,255,.22)");
    c.fillStyle="#0f3a1c";c.fillRect(0,TOP-20,W,H);var off=(S.yd*40)%80;
    for(var x=-off;x<W;x+=80){c.fillStyle=Math.floor((x+S.yd*40)/80)%2?"#0f3a1c":"#11421f";c.fillRect(x,TOP-20,80,H)}
    c.strokeStyle="rgba(255,255,255,.35)";c.lineWidth=2;for(x=-((S.yd*40)%160);x<W;x+=160){c.beginPath();c.moveTo(x,TOP-20);c.lineTo(x,H);c.stroke()}
    var toTD=S.nextTD-S.yd;label(c,Math.ceil(toTD)+" yds to TOUCHDOWN",W-120,TOP-36,13,O2);
    S.tk.forEach(function(k){c.save();c.translate(k.x,k.y);if(k.spinOut){c.rotate(k.x*0.05);c.globalAlpha=0.6}
      c.fillStyle="#3a3a48";c.beginPath();c.arc(0,-62,13,0,7);c.fill();stick(c,0,0,1,{run:true,t:S.t+k.x*0.01,color:"#c8c8d4",tie:false,flap:-0.5});
      c.restore();label(c,k.t,k.x,k.y-92,11,RED)});
    c.save();c.translate(PX,S.y);if(S.spin>0)c.rotate((0.5-S.spin)*4*Math.PI);
    c.fillStyle=O;c.beginPath();c.arc(0,-64,12,Math.PI,0);c.fill();stick(c,0,0,1.05,{run:true,t:S.t});
    c.fillStyle="#8b4a1c";c.beginPath();c.ellipse(12,-44,10,6,0.5,0,7);c.fill();c.strokeStyle="#fff";c.lineWidth=1;c.beginPath();c.moveTo(8,-46);c.lineTo(16,-42);c.stroke();
    c.restore();
    if(S.cool>0){c.strokeStyle="rgba(255,154,60,.6)";c.lineWidth=3;c.beginPath();c.arc(PX,S.y-100,9,-Math.PI/2,-Math.PI/2+Math.PI*2*(1-S.cool/1.4));c.stroke()}
    stepParts(c,S.parts,1/60);
    S.pops.forEach(function(p){c.globalAlpha=Math.min(1,Math.max(0,p.l));label(c,p.t,p.x,p.y,p.big?46:16,p.big?GRN:O2);c.globalAlpha=1});
  };
  S.over=function(){var s=S.score();return{title:"Tackled! 🏈",big:Math.floor(S.yd)+" yds",text:S.td+" touchdown"+(S.td===1?"":"s")+". Tap to spin past tacklers.",score:s}};
  S.preview=livePreview(S,function(g){var look=PX+g.sp*0.55;var danger=function(l){return g.tk.some(function(k){return!k.hit&&k.lane===l&&k.x>PX-20&&k.x<look})};
    if(danger(g.lane)){var o=[g.lane-1,g.lane+1].filter(function(l){return l>=0&&l<3&&!danger(l)});if(o.length)g.move(o[0]-g.lane);else g.action()}});
  return S;
}

/* ---------- GAME: Hire Surfers ---------- */
function Surfers(){
  var S={};S.title="Hire Surfers";S.keys="Swipe ← → to switch tracks, ↑ jump, ↓ roll · arrow keys work too";
  S.intro="Run the career tracks! Dodge the LAYOFF EXPRESS, jump DEADLINES, roll under the BOSS bar, grab skill coins.";
  var HZ=150,GB=470,VX=400;
  function proj(z){return 1/(1+z*0.11)}
  function lx(l,p){return VX+(l-1)*230*p}
  S.reset=function(){S.lane=1;S.x=lx(1,1);S.t=0;S.dist=0;S.sp=16;S.obj=[];S.next=1.2;S.jump=0;S.roll=0;S.coins=0;S.parts=[];S.pops=[]};
  S.swipe=function(d){if(d==="left")S.mv(-1);else if(d==="right")S.mv(1);else if(d==="up")S.jmp();else if(d==="down")S.rol()};
  S.mv=function(d){var n=Math.max(0,Math.min(2,S.lane+d));if(n!==S.lane){S.lane=n;sfx("lane");buzz(8)}};
  S.jmp=function(){if(S.jump<=0&&S.roll<=0){S.jump=0.62;sfx("jump");particles(S.parts,S.x,GB,"rgba(255,255,255,.5)",6)}};
  S.rol=function(){if(S.jump>0){S.jump=Math.min(S.jump,0.12)}S.roll=0.6;sfx("whoosh")};
  S.tapXY=function(x){if(x<W/3)S.mv(-1);else if(x>W*2/3)S.mv(1);else S.jmp()};
  S.action=function(){S.jmp()};
  S.key=function(k){if(k==="ArrowLeft"||k==="a"||k==="A"){S.mv(-1);return true}if(k==="ArrowRight"||k==="d"||k==="D"){S.mv(1);return true}
    if(k==="ArrowUp"||k==="w"||k==="W"||k===" "){S.jmp();return true}if(k==="ArrowDown"||k==="s"||k==="S"){S.rol();return true}return false};
  S.score=function(){return Math.floor(S.dist)+S.coins*5};
  S.hud=function(){return["Score <b>"+S.score()+"</b> · Coins <b>"+S.coins+"</b>","Best <b>"+Math.max(getBest("surfers"),S.score())+"</b>"]};
  S.update=function(dt){S.t+=dt;S.sp=Math.min(16+S.t*0.35,38);S.dist+=S.sp*dt;S.jump=Math.max(0,S.jump-dt);S.roll=Math.max(0,S.roll-dt);
    S.x+=(lx(S.lane,1)-S.x)*Math.min(1,dt*16);
    S.next-=dt;if(S.next<=0){var free=Math.max(0,Math.min(2,(S.free==null?1:S.free)+((Math.random()*3)|0)-1));S.free=free;
      for(var l=0;l<3;l++){if(l===free){if(Math.random()<0.7)for(var j=0;j<4;j++)S.obj.push({k:"coin",lane:l,z:60+j*3});continue}
        var r=Math.random();if(r<0.45)S.obj.push({k:"train",lane:l,z:60,len:14});else if(r<0.7)S.obj.push({k:"low",lane:l,z:60});else if(r<0.88)S.obj.push({k:"high",lane:l,z:60})}
      S.next=Math.max(0.75,1.5-S.t*0.012)+Math.random()*0.4}
    var air=S.jump>0?Math.sin((1-S.jump/0.62)*Math.PI):0;
    for(var i=S.obj.length-1;i>=0;i--){var o=S.obj[i];o.z-=S.sp*dt;var end=o.z+(o.len||0.6);if(end<-1){S.obj.splice(i,1);continue}
      if(o.lane!==S.lane||o.z>0.8||end<-0.2||o.done)continue;
      if(o.k==="coin"){o.done=1;S.coins++;sfx("coin");ring(S.x,GB-60,"#ffd23f");S.obj.splice(i,1);continue}
      var safe=(o.k==="low"&&air>0.35)||(o.k==="high"&&S.roll>0);
      if(!safe){sfx("crash");buzz([80,40,120]);boom(S.x,GB-50,RED,16);particles(S.parts,S.x,GB-50,RED,28);return"over"}
      o.done=1;S.pops.push({x:S.x,y:GB-150,t:o.k==="low"?"NICE JUMP":"SLIDE!",l:0.8});sfx("point")}
    for(i=S.pops.length-1;i>=0;i--){S.pops[i].l-=dt;S.pops[i].y-=40*dt;if(S.pops[i].l<=0)S.pops.splice(i,1)}
  };
  S.draw=function(c){sky(c,"#120c0a","#0b0b10");
    var g=c.createRadialGradient(VX,HZ,4,VX,HZ,260);g.addColorStop(0,"rgba(255,140,40,.5)");g.addColorStop(1,"rgba(255,106,0,0)");c.fillStyle=g;c.fillRect(0,0,W,H);
    for(var i=0;i<9;i++){var bh=40+((i*47)%80);c.fillStyle="#15151d";c.fillRect(i*95-20,HZ-bh,80,bh)}
    c.fillStyle="#141419";c.beginPath();c.moveTo(VX-30,HZ);c.lineTo(VX+30,HZ);c.lineTo(W+200,GB+40);c.lineTo(-200,GB+40);c.fill();
    var zo=(S.dist*1.0)%3;for(var z=60-zo;z>-1;z-=3){var p=proj(z),y=HZ+(GB-HZ)*p;c.strokeStyle="rgba(255,255,255,"+(0.05+0.12*p)+")";c.lineWidth=1+3*p;c.beginPath();c.moveTo(lx(-0.5,p),y);c.lineTo(lx(2.5,p),y);c.stroke()}
    c.strokeStyle="rgba(255,106,0,.55)";c.lineWidth=2;[-0.5,0.5,1.5,2.5].forEach(function(l){c.beginPath();c.moveTo(lx(l,proj(60)),HZ+(GB-HZ)*proj(60));c.lineTo(lx(l,1.25),HZ+(GB-HZ)*1.25);c.stroke()});
    var list=S.obj.slice().sort(function(a,b){return b.z-a.z});
    list.forEach(function(o){if(o.z>60)return;var zz=Math.max(o.z,-0.9),p=proj(zz),y=HZ+(GB-HZ)*p,x=lx(o.lane,p),w=180*p;
      if(o.k==="train"){var p2=proj(Math.max(o.z+o.len,-0.5)),y2=HZ+(GB-HZ)*p2,x2=lx(o.lane,p2),w2=180*p2;
        c.fillStyle="#3a1418";c.beginPath();c.moveTo(x-w/2,y);c.lineTo(x2-w2/2,y2-170*p2);c.lineTo(x2+w2/2,y2-170*p2);c.lineTo(x+w/2,y-170*p);c.closePath();c.fill();
        c.fillStyle="#5a1d22";rr(c,x-w/2,y-170*p,w,170*p,10*p);c.fill();c.strokeStyle=RED;c.lineWidth=2;c.stroke();
        c.fillStyle="rgba(255,230,180,.8)";c.fillRect(x-w*0.35,y-150*p,w*0.7,40*p);c.fillStyle="#ffd23f";c.beginPath();c.arc(x-w*0.3,y-25*p,8*p,0,7);c.arc(x+w*0.3,y-25*p,8*p,0,7);c.fill();
        if(p>0.18)label(c,"LAYOFF EXPRESS",x,y-90*p,Math.max(8,16*p),RED)}
      else if(o.k==="low"){c.fillStyle="#f4f4f6";c.fillRect(x-w/2,y-48*p,w,22*p);c.fillStyle=O;for(var s=0;s<4;s++)c.fillRect(x-w/2+s*w/4,y-48*p,w/8,22*p);
        c.fillStyle="#888";c.fillRect(x-w/2+4*p,y-26*p,6*p,26*p);c.fillRect(x+w/2-10*p,y-26*p,6*p,26*p);if(p>0.2)label(c,"DEADLINE",x,y-62*p,Math.max(8,14*p),O2)}
      else if(o.k==="high"){c.fillStyle="#888";c.fillRect(x-w/2,y-150*p,8*p,150*p);c.fillRect(x+w/2-8*p,y-150*p,8*p,150*p);c.fillStyle="#7a2a8a";c.fillRect(x-w/2,y-150*p,w,44*p);
        if(p>0.2)label(c,"BOSS BAR",x,y-128*p,Math.max(8,14*p),"#f0d0ff")}
      else{c.fillStyle="#ffd23f";c.beginPath();c.arc(x,y-40*p,13*p,0,7);c.fill();c.fillStyle="#b88a00";c.beginPath();c.arc(x,y-40*p,7*p,0,7);c.fill()}});
    var air=S.jump>0?Math.sin((1-S.jump/0.62)*Math.PI):0,py=GB-air*130;
    c.fillStyle="rgba(0,0,0,.35)";c.beginPath();c.ellipse(S.x,GB+4,30*(1-air*0.4),8,0,0,7);c.fill();
    if(S.roll>0){c.save();c.translate(S.x,py-22);c.rotate(S.t*14);c.strokeStyle=TXT;c.lineWidth=3.5;c.beginPath();c.arc(0,0,20,0,7);c.stroke();c.fillStyle=O;c.fillRect(-3,-12,6,12);c.restore()}
    else stick(c,S.x,py,1.5,{run:S.jump<=0,t:S.t,flap:S.jump>0?-1.2:null});
    stepParts(c,S.parts,1/60);
    S.pops.forEach(function(p){c.globalAlpha=Math.max(0,p.l);label(c,p.t,p.x,p.y,18,GRN);c.globalAlpha=1});
  };
  S.over=function(){var s=S.score();return{title:"Caught by the Layoff Express! 🚆",big:s,text:S.coins+" skill coins grabbed. Swipe early, the trains get faster.",score:s}};
  S.preview=livePreview(S,function(g){var ahead=g.obj.filter(function(o){return o.k!=="coin"&&!o.done&&o.lane===g.lane&&o.z>0&&o.z<7}).sort(function(a,b){return a.z-b.z})[0];
    if(!ahead)return;if(ahead.k==="low"){if(ahead.z<2.2)g.jmp()}else if(ahead.k==="high"){if(ahead.z<2)g.rol()}
    else{var free=[0,1,2].filter(function(l){return!g.obj.some(function(o){return o.k!=="coin"&&o.lane===l&&o.z<9&&o.z+(o.len||0.6)>-0.5})});
      if(free.length){var best=free.sort(function(a,b){return Math.abs(a-g.lane)-Math.abs(b-g.lane)})[0];if(best!==g.lane)g.mv(best>g.lane?1:-1)}}});
  return S;
}

var GAMES={flappy:Flappy,pong:Pong,rush:Rush,racer:Racer,cart:Cart,flight:Flight,cricket:Cricket,football:Football,surfers:Surfers};
function flash(){if(HG.onFlash)HG.onFlash()}
var HG=window.HireGames={GAMES:GAMES,W:W,H:H,getBest:getBest,setBest:setBest,paintBest:paintBest,sfx:sfx,buzz:buzz,FX:FX,boom:boom,ring:ring,stepFX:stepFX,shakeOffset:shakeOffset,
  unlock:function(){ac()},isMuted:function(){return muted},setMuted:function(m){muted=!!m;try{localStorage.setItem("vhb_mute",m?"1":"0")}catch(e){}}};
})();
