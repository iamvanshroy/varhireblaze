/* VarHireBlaze — Hire Games core (shared by games.html and the homepage live demo) */
(function(){
"use strict";
var O="#ff6a00",O2="#ff9a3c",TXT="#f4f4f6",MUT="#9a9aa8",LINE="#23232e",RED="#ff4d4d",GRN="#2bd46b";

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
  S.action=function(){if(!S.dead){S.vy=-420}};
  S.hud=function(){return["Interviews <b>"+S.score+"</b>","Best <b>"+Math.max(getBest("flappy"),S.score)+"</b>"]};
  var WORDS=["REJECTED","GHOSTED","NO REPLY","ON HOLD","OVERQUALIFIED"];
  S.update=function(dt){
    S.t+=dt;S.scroll+=180*dt;var sp=200+Math.min(S.score*4,120);
    S.vy+=1350*dt;S.y+=S.vy*dt;
    S.next-=dt;if(S.next<=0){S.next=1.35-Math.min(S.score*0.01,0.3);var gap=Math.max(165,215-S.score*2);var top=70+Math.random()*(H-140-gap);
      S.pipes.push({x:W+40,top:top,gap:gap,w:74,passed:false,word:WORDS[(Math.random()*WORDS.length)|0]})}
    for(var i=S.pipes.length-1;i>=0;i--){var p=S.pipes[i];p.x-=sp*dt;if(p.x<-120)S.pipes.splice(i,1);
      if(!p.passed&&p.x+p.w<170){p.passed=true;S.score++;particles(S.parts,170,S.y-30,O2,10)}
      var px=170,top=S.y-50,bot=S.y-4; // figure box (forgiving)
      if(px+12>p.x&&px-12<p.x+p.w&&(top<p.top||bot>p.top+p.gap))return "over"}
    if(S.y>H-20||S.y<40)return "over";
  };
  S.draw=function(c){glowBg(c);bgGrid(c,S.scroll*0.5);
    S.pipes.forEach(function(p){
      [[0,p.top],[p.top+p.gap,H-p.top-p.gap]].forEach(function(seg,i){var y=seg[0],h=seg[1];
        var g=c.createLinearGradient(p.x,0,p.x+p.w,0);g.addColorStop(0,"#1b1b24");g.addColorStop(1,"#14141b");c.fillStyle=g;rr(c,p.x,y-(i?0:10),p.w,h+10,10);c.fill();
        c.strokeStyle="rgba(255,77,77,.65)";c.lineWidth=2;c.stroke();
        c.save();c.translate(p.x+p.w/2,i?y+h/2:y/2);c.rotate(-Math.PI/2);label(c,p.word,0,0,15,RED);c.restore()})});
    var tilt=Math.max(-0.5,Math.min(0.9,S.vy/700));
    c.save();c.translate(170,S.y-29);c.rotate(tilt);stick(c,0,29,0.8,{flap:S.vy<0?-1.2+Math.sin(S.t*30)*0.6:0.6,t:S.t});
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
    if(S.by<20){S.by=20;S.vy=Math.abs(S.vy)}if(S.by>H-20){S.by=H-20;S.vy=-Math.abs(S.vy)}
    function hit(px,py,dir){var off=(S.by-py)/(PH/2);off=Math.max(-1,Math.min(1,off));S.sp=Math.min(S.sp*1.06,820);var a=off*1.0+(Math.random()-0.5)*0.3;if(dir>0)S.err=(Math.random()*2-1)*(78-S.ps*3);else S.err=0;
      S.vx=Math.cos(a)*S.sp*dir;S.vy=Math.sin(a)*S.sp;particles(S.parts,px,S.by,O2,12);flash(0.25)}
    if(S.vx<0&&S.bx-12<60+PW&&S.bx>40&&Math.abs(S.by-S.py)<PH/2+12){S.bx=60+PW+12;hit(60+PW,S.py,1)}
    if(S.vx>0&&S.bx+12>W-60-PW&&S.bx<W-40&&Math.abs(S.by-S.ay)<PH/2+12){S.bx=W-60-PW-12;hit(W-60-PW,S.ay,-1)}
    if(S.bx<-20){S.as++;particles(S.parts,10,S.by,RED,20);if(S.as>=7)return"over";S.serve(1)}
    if(S.bx>W+20){S.ps++;particles(S.parts,W-10,S.by,GRN,24);if(S.ps>=7)return"over";S.serve(-1)}
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
  S.action=function(){if(S.jumps<2){S.vy=S.jumps?-560:-640;S.jumps++;particles(S.parts,140,S.y,MUT,6)}};
  S.score=function(){return Math.floor(S.dist/250)+S.bonus};
  S.hud=function(){return["Package <b>"+S.score()+" LPA</b>","Best <b>"+Math.max(getBest("rush"),S.score())+"</b>"]};
  S.update=function(dt){S.t+=dt;S.sp=Math.min(330+S.t*9,720);S.dist+=S.sp*dt;
    S.vy+=1900*dt;S.y+=S.vy*dt;if(S.y>=GY){S.y=GY;S.vy=0;S.jumps=0}
    S.next-=dt;if(S.next<=0){var o=OBS[(Math.random()*OBS.length)|0];S.obs.push({x:W+30,w:o.w,h:o.h,t:o.t});S.next=0.9+Math.random()*0.9-Math.min(S.t*0.006,0.4)}
    S.nextC-=dt;if(S.nextC<=0){S.coins.push({x:W+30,y:GY-90-Math.random()*130,t:SK[(Math.random()*SK.length)|0]});S.nextC=1.2+Math.random()*1.4}
    var fx=140;
    for(var i=S.obs.length-1;i>=0;i--){var o=S.obs[i];o.x-=S.sp*dt;if(o.x<-120){S.obs.splice(i,1);continue}
      if(fx+9>o.x+4&&fx-9<o.x+o.w-4&&S.y>GY-o.h+6)return"over"}
    for(i=S.coins.length-1;i>=0;i--){var k=S.coins[i];k.x-=S.sp*dt;if(k.x<-60){S.coins.splice(i,1);continue}
      if(Math.abs(k.x-fx)<34&&Math.abs(k.y-(S.y-36))<44){S.bonus+=2;particles(S.parts,k.x,k.y,GRN,14);S.pops.push({x:k.x,y:k.y,t:"+"+k.t,l:0.9});S.coins.splice(i,1)}}
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
    stick(c,140,S.y,1.05,{run:S.y>=GY,t:S.t,flap:S.y<GY?-1:null});
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
  var S={};S.title="Hire Racer";S.keys="Tap above / below your car, or <kbd>↑</kbd> <kbd>↓</kbd> to switch lanes";
  S.intro="Race to your dream job. Switch lanes to dodge rejection traffic and grab offer letters for a boost.";
  var TOP=150,BOT=480,LN=3,LH=(BOT-TOP)/LN,PX=150;function ly(i){return TOP+LH*(i+0.5)}
  var CARS=[["REJECTED","#ff4d4d"],["GHOSTED","#8a8aa0"],["LOW PAY","#d4a72c"],["SPAM","#b05cff"],["NO REPLY","#4d8dff"]];
  S.reset=function(){S.lane=1;S.y=ly(1);S.t=0;S.dist=0;S.sp=420;S.cars=[];S.offers=[];S.next=1.0;S.nextO=2.2;S.bonus=0;S.parts=[];S.pops=[];S.boost=0;S.road=0};
  S.move=function(d){var n=Math.max(0,Math.min(LN-1,S.lane+d));if(n!==S.lane){S.lane=n;particles(S.parts,PX-50,S.y,MUT,5)}};
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
      if(Math.abs(c.y-S.y)<LH*0.42&&c.x<PX+46&&c.x+96>PX-46){particles(S.parts,PX+40,S.y,RED,30);return"over"}}
    for(i=S.offers.length-1;i>=0;i--){var o=S.offers[i];o.x-=rel*dt;if(o.x<-40){S.offers.splice(i,1);continue}
      if(Math.abs(o.y-S.y)<LH*0.45&&Math.abs(o.x-PX)<56){S.bonus+=3;S.boost=1.2;particles(S.parts,o.x,o.y,GRN,16);S.pops.push({x:o.x,y:o.y-30,t:"+3 km OFFER!",l:1});S.offers.splice(i,1)}}
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
    car(c,PX,S.y,O,"",true);
    stepParts(c,S.parts,1/60);
    S.pops.forEach(function(p){c.globalAlpha=Math.max(0,p.l);label(c,p.t,p.x,p.y,15,GRN);c.globalAlpha=1});
  };
  S.over=function(){var s=S.score();return{title:"Crashed into rejection! 💥",big:s+" km",text:"Every crash is practice. Your dream job is still down that road.",score:s}};
  S.preview=function(c,t){S.reset();S.t=t;S.road=t*500;S.lane=Math.round(1+Math.sin(t*1.3));S.y=ly(1)+Math.sin(t*1.3)*LH*0.9;
    S.cars=[0,1,2].map(function(i){var x=((W+300)-((t*260+i*330)%(W+300)))-80;var c=CARS[i];return{x:x,y:ly((i*2+1)%3),t:c[0],col:c[1]}});
    S.offers=[{x:((W+300)-((t*260+170)%(W+300)))-40,y:ly(1)}];S.draw(c)};
  return S;
}

var GAMES={flappy:Flappy,pong:Pong,rush:Rush,racer:Racer};
function flash(){if(HG.onFlash)HG.onFlash()}
var HG=window.HireGames={GAMES:GAMES,W:W,H:H,getBest:getBest,setBest:setBest,paintBest:paintBest};
})();
