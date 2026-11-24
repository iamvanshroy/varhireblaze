/* VarHireBlaze — Neon Series: 8 original arcade games.
   Every character, background and sound here is drawn or synthesised in code. No sprites, no samples. */
(function(){
"use strict";
var HG=window.HireGames;if(!HG)return;
var W=HG.W,H=HG.H,T=HG.tools,tone=T.tone,noise=T.noise,rr=T.rr,label=T.label,stick=T.stick;
var O="#ff6a00",O2="#ff9a3c",TXT="#f4f4f6",MUT="#9a9aa8",RED="#ff4d5e",GRN="#2bd46b",CY="#3de8ff",VI="#a66bff",GOLD="#ffd23f";
function rand(a,b){return a+Math.random()*(b-a)}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function lerp(a,b,k){return a+(b-a)*k}

/* ---------- skins (shared by all Neon games; bought with coins in the games hub) ---------- */
var SKINS=[
  {id:"blaze",name:"Blaze",price:0,a:"#ff6a00",b:"#ffc38a"},
  {id:"frost",name:"Frost",price:120,a:"#3de8ff",b:"#d4fbff"},
  {id:"toxic",name:"Toxic",price:180,a:"#9dff3d",b:"#e6ffc4"},
  {id:"ultra",name:"Ultraviolet",price:250,a:"#a66bff",b:"#e2d2ff"},
  {id:"crimson",name:"Crimson",price:350,a:"#ff3d5e",b:"#ffc0cb"},
  {id:"ghost",name:"Ghost",price:500,a:"#eef0f6",b:"#8d93a8"},
  {id:"gold",name:"Gold Rush",price:800,a:"#ffd23f",b:"#fff3c2"},
  {id:"aurora",name:"Aurora",price:1200,a:"aurora",b:"aurora"}
];
function skinId(){try{return localStorage.getItem("vhb_skin")||"blaze"}catch(e){return "blaze"}}
function skin(){var id=skinId(),s=SKINS[0];for(var i=0;i<SKINS.length;i++)if(SKINS[i].id===id)s=SKINS[i];
  if(s.a==="aurora"){var h=(performance.now()/1000*70)%360;return{a:"hsl("+h.toFixed(0)+",100%,62%)",b:"hsl("+((h+70)%360).toFixed(0)+",100%,82%)"}}return s}

/* ---------- Neon sound set: synthesised, tuned differently from the classic set ---------- */
var NS={
  coin:function(){tone(1245,0,0.05,"sine",0.08);tone(1865,0,0.1,"sine",0.06,0.045)},
  zap:function(){tone(1600,220,0.08,"sawtooth",0.03)},
  boom:function(){noise(0.35,0.45,900);tone(120,38,0.35,"triangle",0.14)},
  hit:function(){tone(180,70,0.18,"sawtooth",0.09);noise(0.12,0.25,1600)},
  grab:function(){tone(220,520,0.07,"triangle",0.08)},
  release:function(){tone(520,980,0.09,"sine",0.05)},
  flip:function(up){tone(up?340:680,up?720:300,0.08,"square",0.045)},
  jump:function(){tone(360,820,0.1,"triangle",0.07)},
  near:function(){tone(1700,1200,0.05,"sine",0.04)},
  gate:function(){[660,990,1320].forEach(function(f,i){tone(f,0,0.08,"triangle",0.06,i*0.05)})},
  level:function(){[392,523,659,784,1046].forEach(function(f,i){tone(f,0,0.09,"square",0.05,i*0.06)})},
  hurt:function(){tone(300,90,0.25,"square",0.08)},
  skid:function(){noise(0.06,0.06,5200)},
  power:function(){tone(300,1400,0.3,"sine",0.06)}
};
function snd(n,a){if(HG.isQuiet&&HG.isQuiet())return;try{NS[n]&&NS[n](a)}catch(e){}}
function buzz(ms){HG.buzz(ms)}
function best(k,s){return Math.max(HG.getBest(k),s|0)}
function hud2(k,score,coins,unit){return["<b>"+(score|0)+"</b> "+unit+" · 🪙 <b>"+coins+"</b>","Best <b>"+best(k,score)+"</b>"]}
function sparks(list,x,y,col,n,sp){for(var i=0;i<n;i++){var a=Math.random()*Math.PI*2,v=(sp||200)*(0.3+Math.random());list.push({x:x,y:y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,l:0.5+Math.random()*0.5,col:col,g:0})}}
function stepSparks(c,list,dt,grav){c.save();c.globalCompositeOperation="lighter";for(var i=list.length-1;i>=0;i--){var p=list[i];p.l-=dt*1.6;if(p.l<=0){list.splice(i,1);continue}
  p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=(grav||0)*dt;p.vx*=0.98;p.vy*=0.98;c.globalAlpha=p.l;c.fillStyle=p.col;c.fillRect(p.x-1.5,p.y-1.5,3,3)}c.restore()}
function glow(c,col,b){c.shadowColor=col;c.shadowBlur=b}
function noGlow(c){c.shadowBlur=0}
function coinIcon(c,x,y,r,t){var sx=Math.abs(Math.cos(t*4));c.save();c.translate(x,y);c.scale(Math.max(0.2,sx),1);glow(c,GOLD,10);c.fillStyle=GOLD;c.beginPath();c.arc(0,0,r,0,Math.PI*2);c.fill();
  noGlow(c);c.fillStyle="#b8860b";c.font="700 "+(r*1.2|0)+"px 'Space Grotesk',sans-serif";c.textAlign="center";c.textBaseline="middle";c.fillText("V",0,1);c.restore()}
function floatText(list,x,y,txt,col){list.push({x:x,y:y,t:txt,col:col||GOLD,l:1})}
function stepText(c,list,dt){for(var i=list.length-1;i>=0;i--){var f=list[i];f.l-=dt*1.2;f.y-=40*dt;if(f.l<=0){list.splice(i,1);continue}c.globalAlpha=Math.max(0,f.l);label(c,f.t,f.x,f.y,16,f.col);c.globalAlpha=1}}
function vignette(c,a){var g=c.createRadialGradient(W/2,H/2,H*0.35,W/2,H/2,H*0.95);g.addColorStop(0,"rgba(0,0,0,0)");g.addColorStop(1,"rgba(0,0,0,"+(a||0.6)+")");c.fillStyle=g;c.fillRect(0,0,W,H)}
function overObj(title,big,text,score,coins){return{title:title,big:big,text:text,score:score|0,coins:coins|0}}
var NEW={};

/* ---------- 1. PHOTON DASH — endless speed through a neon void ---------- */
NEW.photon=function(){
  var S={},HZ=150,GH=(H-HZ)*0.92,LANES=[-1,-0.5,0,0.5,1];
  S.title="Photon Dash";S.keys="Steer: <kbd>←</kbd> <kbd>→</kbd> / <kbd>A</kbd> <kbd>D</kbd> · Touch: hold left or right side";
  S.intro="Pilot the light-ship through the void. Thread the gaps, grab coins, and don't touch the prisms. It only gets faster.";
  function proj(x,z){var k=1/z;return{x:W/2+x*W*0.42*k,y:HZ+GH*k,k:k}}
  S.reset=function(){S.x=0;S.vx=0;S.dir=0;S.touch=null;S.z=0;S.v=13;S.rows=[];S.next=10;S.t=0;S.score=0;S.coins=0;S.parts=[];S.txt=[];S.tilt=0;S.lvl=1;S.dead=false};
  S.key=function(k){if(k==="ArrowLeft"||k==="a"||k==="A"){S.dir=-1;return true}if(k==="ArrowRight"||k==="d"||k==="D"){S.dir=1;return true}return false};
  S.keyUp=function(k){if(/^(ArrowLeft|ArrowRight|a|A|d|D)$/.test(k))S.dir=0};
  S.press=function(on,x){S.touch=on?(x==null?S.touch:x):null};
  S.pointerXY=function(x){if(S.touch!==null||x!=null)S.touch=x};
  S.action=function(){};
  S.hud=function(){return hud2("photon",S.score,S.coins,"m")};
  function spawn(){var n=LANES.length,open=(Math.random()*n)|0,open2=Math.random()<Math.max(0.15,0.6-S.t*0.01)?((open+(Math.random()<0.5?1:-1)+n)%n):open;
    var blocks=[];for(var i=0;i<n;i++)if(i!==open&&i!==open2&&Math.random()<0.55+Math.min(0.4,S.t*0.006))blocks.push(LANES[i]);
    if(!blocks.length)blocks.push(LANES[(open+2)%n]);
    S.rows.push({z:34,b:blocks,coin:Math.random()<0.6?LANES[open]:null,got:false,near:false,h:rand(0.7,1.3)})}
  S.update=function(dt){
    S.t+=dt;S.v=Math.min(42,13+S.t*0.42);var lv=1+((S.t/15)|0);if(lv>S.lvl){S.lvl=lv;snd("level");floatText(S.txt,W/2,HZ+40,"SPEED "+lv,CY)}
    var want=S.dir;if(S.touch!==null)want=S.touch<W/2?-1:1;
    S.vx=lerp(S.vx,want*3.2,Math.min(1,dt*9));S.x=clamp(S.x+S.vx*dt,-1.05,1.05);S.tilt=lerp(S.tilt,S.vx*0.12,dt*10);
    var dz=S.v*dt;S.z+=dz;S.score=S.z*1.6;S.next-=dz;if(S.next<=0){spawn();S.next=Math.max(5.2,9-S.t*0.05)}
    for(var i=S.rows.length-1;i>=0;i--){var r=S.rows[i];r.z-=dz;
      if(r.z<1.15&&r.z>0.85){for(var j=0;j<r.b.length;j++){var d=Math.abs(S.x-r.b[j]);
          if(d<0.36){snd("boom");buzz([40,30,80]);HG.boom(proj(S.x,1).x,H-60,RED,16);sparks(S.parts,proj(S.x,1).x,H-60,RED,40,320);return "over"}
          if(d<0.55&&!r.near){r.near=true;S.score+=0;S.z+=3;floatText(S.txt,proj(S.x,1).x,H-110,"CLOSE! +5",CY);snd("near")}}
        if(r.coin!==null&&!r.got&&Math.abs(S.x-r.coin)<0.3){r.got=true;S.coins++;snd("coin");sparks(S.parts,proj(r.coin,1).x,H-70,GOLD,12,180);floatText(S.txt,proj(r.coin,1).x,H-100,"+1",GOLD)}}
      if(r.z<0.3)S.rows.splice(i,1)}
    if(Math.random()<0.7){var p=proj(S.x,1);var sk=skin();S.parts.push({x:p.x+rand(-6,6),y:H-44,vx:rand(-20,20),vy:rand(60,140),l:0.5,col:sk.a})}
  };
  S.draw=function(c){var sk=skin(),t=S.t;
    var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,"#05040c");g.addColorStop(0.3,"#0c0820");g.addColorStop(1,"#050409");c.fillStyle=g;c.fillRect(0,0,W,H);
    // distant pulsar
    var pg=c.createRadialGradient(W/2,HZ-10,4,W/2,HZ-10,220);pg.addColorStop(0,"rgba(255,255,255,.9)");pg.addColorStop(0.08,sk.a);pg.addColorStop(1,"rgba(0,0,0,0)");
    c.globalAlpha=0.55;c.fillStyle=pg;c.fillRect(0,0,W,HZ+120);c.globalAlpha=1;
    // stars streaking
    c.fillStyle="rgba(255,255,255,.5)";for(var s=0;s<40;s++){var sx=(s*97.3)%W,sy=(s*53.1)%HZ,ln=2+S.v*0.15;c.fillRect(sx+(sx-W/2)*((t*0.6+s*0.07)%1)*0.4,sy,1.5,1)}
    // floor grid
    c.strokeStyle="rgba(166,107,255,.35)";c.lineWidth=1;
    for(var zl=1;zl<34;zl+=2){var zz=zl-(S.z%2);if(zz<0.6)continue;var a=proj(-3,zz),b=proj(3,zz);c.globalAlpha=Math.min(1,2/zz);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke()}
    c.globalAlpha=1;for(var xl=-3;xl<=3;xl+=0.5){var n1=proj(xl,0.7),f1=proj(xl,34);c.beginPath();c.moveTo(n1.x,n1.y);c.lineTo(f1.x,f1.y);c.stroke()}
    // lane rails
    [-1.3,1.3].forEach(function(xr){var a=proj(xr,0.75),b=proj(xr,34);c.strokeStyle=sk.a;c.lineWidth=2;glow(c,sk.a,12);c.beginPath();c.moveTo(a.x,a.y);c.lineTo(b.x,b.y);c.stroke();noGlow(c)});
    // rows back to front
    var rows=S.rows.slice().sort(function(a,b){return b.z-a.z});
    rows.forEach(function(r){var al=Math.min(1,(34-r.z)/6);c.globalAlpha=al;
      r.b.forEach(function(x){var p=proj(x,r.z),w=W*0.42*0.4*p.k,h=110*p.k*r.h,cx=p.x,cy=p.y;
        var hue=(x*60+200+t*20)%360;c.fillStyle="hsla("+hue+",90%,55%,.18)";c.strokeStyle="hsl("+hue+",95%,65%)";c.lineWidth=Math.max(1,2*p.k);glow(c,c.strokeStyle,14*p.k+4);
        c.beginPath();c.moveTo(cx-w,cy);c.lineTo(cx,cy-h);c.lineTo(cx+w,cy);c.closePath();c.fill();c.stroke();
        c.beginPath();c.moveTo(cx-w*0.5,cy-h*0.5);c.lineTo(cx+w*0.5,cy-h*0.5);c.stroke();noGlow(c)});
      if(r.coin!==null&&!r.got){var q=proj(r.coin,r.z);coinIcon(c,q.x,q.y-40*q.k,Math.max(3,14*q.k),t)}
      c.globalAlpha=1});
    stepSparks(c,S.parts,1/60,0);
    // ship
    var sp=proj(S.x,1),x=sp.x,y=H-48;c.save();c.translate(x,y);c.rotate(S.tilt);glow(c,sk.a,22);
    c.fillStyle=sk.a;c.beginPath();c.moveTo(0,-30);c.lineTo(34,10);c.lineTo(12,4);c.lineTo(0,14);c.lineTo(-12,4);c.lineTo(-34,10);c.closePath();c.fill();
    noGlow(c);c.fillStyle=sk.b;c.beginPath();c.moveTo(0,-20);c.lineTo(8,0);c.lineTo(-8,0);c.closePath();c.fill();
    c.fillStyle="#fff";c.globalAlpha=0.6+Math.random()*0.4;c.fillRect(-10,10,6,6+Math.random()*8);c.fillRect(4,10,6,6+Math.random()*8);c.globalAlpha=1;c.restore();
    stepText(c,S.txt,1/60);
    if(S.v>28){c.strokeStyle="rgba(255,255,255,.12)";for(var i=0;i<10;i++){var a2=rand(0,Math.PI*2),r1=rand(200,260);c.beginPath();c.moveTo(W/2+Math.cos(a2)*r1,H/2+Math.sin(a2)*r1*0.6);c.lineTo(W/2+Math.cos(a2)*(r1+60),H/2+Math.sin(a2)*(r1+60)*0.6);c.stroke()}}
    vignette(c,0.55)};
  S.over=function(){return overObj("Prism hit!",(S.score|0)+" m","You reached speed "+S.lvl+" and grabbed "+S.coins+" coins.",S.score,S.coins)};
  S.preview=HG.livePreview(S,function(s){var r=null;for(var i=0;i<s.rows.length;i++)if(s.rows[i].z>1&&(!r||s.rows[i].z<r.z))r=s.rows[i];
    if(!r){s.dir=0;return}var bestX=0,bd=9;LANES.forEach(function(l){if(r.b.indexOf(l)<0){var d=Math.abs(l-s.x);if(d<bd){bd=d;bestX=l}}});s.dir=Math.abs(bestX-s.x)<0.08?0:(bestX<s.x?-1:1)});
  return S;
};

/* ---------- 2. APEX HIGHWAY — sunset highway racing (pseudo-3D road) ---------- */
NEW.apex=function(){
  var S={},SEG=200,ROADW=2000,CAMH=1000,DEPTH=0.84,DRAW=150,N=1400,LEN=N*SEG;
  S.title="Apex Highway";S.keys="Steer: <kbd>←</kbd> <kbd>→</kbd> · Touch: hold left or right side · 3 shields";
  S.intro="Night falls on the coast road. Weave through traffic, take the corners flat out, and collect coins. Every overtake counts.";
  function ease(a,b,p){return a+(b-a)*((-Math.cos(p*Math.PI)/2)+0.5)}
  function build(){var segs=[],y=0;function add(n,curve,dy){var y0=y;for(var i=0;i<n;i++){var yy=ease(y0,y0+dy,(i+1)/n);segs.push({i:segs.length,curve:curve,y1:y,y2:yy,cars:[],coin:null});y=yy}}
    add(60,0,0);while(segs.length<N-80){var len=20+((Math.random()*50)|0),cv=Math.random()<0.35?0:rand(-5,5),dy=Math.random()<0.5?0:rand(-1600,1600);add(len,0,0);add(len,cv,dy);add(len/2|0,cv*0.5,-dy*0.5)}
    add(N-segs.length,0,-y);segs.forEach(function(s,i){s.i=i;if(i>80&&i%9===0&&Math.random()<0.5)s.coin={x:rand(-0.7,0.7),got:false}});return segs}
  function seg(z){return S.segs[(Math.floor(z/SEG)%N+N)%N]}
  var CARCOLS=["#3de8ff","#ffd23f","#a66bff","#ff3d5e","#9dff3d","#f4f4f6"];
  S.reset=function(){S.segs=build();S.pos=0;S.x=0;S.speed=0;S.max=SEG*55;S.dir=0;S.touch=null;S.t=0;S.dist=0;S.coins=0;S.shield=3;S.inv=0;S.over_=0;S.passed=0;S.parts=[];S.txt=[];
    S.cars=[];for(var i=0;i<26;i++){var z=SEG*(120+i*45+rand(0,30)),c={z:z,x:[-0.6,0,0.6][(Math.random()*3)|0],sp:rand(0.25,0.55),col:CARCOLS[i%CARCOLS.length],passed:false};S.cars.push(c)}};
  S.key=function(k){if(k==="ArrowLeft"||k==="a"||k==="A"){S.dir=-1;return true}if(k==="ArrowRight"||k==="d"||k==="D"){S.dir=1;return true}return false};
  S.keyUp=function(k){if(/^(ArrowLeft|ArrowRight|a|A|d|D)$/.test(k))S.dir=0};
  S.press=function(on,x){S.touch=on?(x==null?S.touch:x):null};S.pointerXY=function(x){if(S.touch!==null)S.touch=x};S.action=function(){};
  S.hud=function(){return["<b>"+(S.dist|0)+"</b> m · "+"🛡".repeat(Math.max(0,S.shield))+" · 🪙 <b>"+S.coins+"</b>","Best <b>"+best("apex",S.dist)+"</b>"]};
  S.update=function(dt){S.t+=dt;S.max=SEG*(55+Math.min(40,S.t*0.55));var sp=S.speed/S.max;S.inv=Math.max(0,S.inv-dt);
    var st=S.dir;if(S.touch!==null)st=S.touch<W/2?-1:1;
    S.x+=st*dt*2.2*Math.max(0.35,sp);var sg=seg(S.pos+CAMH*0+SEG*3);S.x-=dt*2*sp*sp*sg.curve*0.32;
    var off=Math.abs(S.x)>1;S.speed+=(off?-S.max*0.9:S.max*0.35)*dt;if(off&&S.speed>S.max*0.4&&Math.random()<0.4)snd("skid");
    S.speed=clamp(S.speed,0,S.max);S.x=clamp(S.x,-1.6,1.6);
    S.pos=(S.pos+S.speed*dt)%LEN;S.dist+=S.speed*dt/40;
    var pz=S.pos+SEG*4.5;
    S.cars.forEach(function(c){c.z=(c.z+S.max*c.sp*dt)%LEN;var d=((c.z-pz)%LEN+LEN)%LEN;
      if(d>LEN-SEG*1.2)d-=LEN;
      if(Math.abs(d)<SEG*0.6&&Math.abs(c.x-S.x)<0.42&&S.inv<=0){S.shield--;S.inv=1.6;S.speed*=0.35;snd("hit");buzz([50,40,70]);HG.boom(W/2,H-70,RED,14);sparks(S.parts,W/2,H-80,RED,30,260);
        floatText(S.txt,W/2,H-140,S.shield>0?"SHIELD -1":"",RED);c.z=(c.z+SEG*8)%LEN}
      if(d<-SEG&&d>-SEG*3&&!c.passed){c.passed=true;S.passed++;S.dist+=10;floatText(S.txt,W/2,H-150,"OVERTAKE +10",CY);snd("near")}
      if(d>SEG*20)c.passed=false});
    var cs=seg(pz);if(cs.coin&&!cs.coin.got&&Math.abs(cs.coin.x-S.x)<0.3){cs.coin.got=true;S.coins++;snd("coin");sparks(S.parts,W/2+(cs.coin.x-S.x)*120,H-110,GOLD,12,160)}
    if(S.shield<=0){snd("boom");return "over"}};
  function project(wx,wy,wz,camx,camy,camz){var cx=wx-camx,cy=wy-camy,cz=wz-camz,sc=DEPTH/cz;return{x:W/2+sc*cx*W/2,y:H/2-sc*cy*H/2,w:sc*ROADW*W/2,s:sc,z:cz}}
  S.draw=function(c){var sk=skin();
    var g=c.createLinearGradient(0,0,0,H/2+40);g.addColorStop(0,"#120625");g.addColorStop(0.55,"#4a0f3e");g.addColorStop(1,"#ff6a3d");c.fillStyle=g;c.fillRect(0,0,W,H);
    var base=seg(S.pos),bp=(S.pos%SEG)/SEG,curveShift=base.curve*bp;
    // moon + hills (parallax with curve)
    var par=(S.pos/LEN)*900;c.fillStyle="rgba(255,236,210,.9)";c.beginPath();c.arc(620-par%200*0.1,90,26,0,Math.PI*2);c.fill();
    [[0.15,"#2a0b33",140,40],[0.3,"#1a0722",170,30]].forEach(function(L){c.fillStyle=L[1];c.beginPath();c.moveTo(0,H);for(var x=0;x<=W;x+=20){var xx=x+par*L[0]*10;c.lineTo(x,H/2+30-L[3]-Math.abs(Math.sin(xx*0.006)*L[2]*0.5+Math.sin(xx*0.017)*L[2]*0.25))}c.lineTo(W,H);c.fill()});
    var playerY=lerp(seg(S.pos+SEG*4.5).y1,seg(S.pos+SEG*4.5).y2,bp),camy=playerY+CAMH,camx=S.x*ROADW;
    var x=0,dx=-curveShift,maxy=H,drawn=[];
    for(var n=0;n<DRAW;n++){var s=S.segs[(base.i+n)%N],loop=s.i<base.i?LEN:0,z1=s.i*SEG+loop,z2=z1+SEG;
      var p1=project(x,s.y1,z1,camx,camy,S.pos-0),p2=project(x+dx,s.y2,z2,camx,camy,S.pos);x+=dx;dx+=s.curve;
      s._p1=p1;s._p2=p2;s._clip=maxy;s._loop=loop;
      if(p1.z<=DEPTH||p2.y>=p1.y||p2.y>=maxy)continue;
      var alt=((s.i/3)|0)%2,fog=Math.min(1,n/DRAW*1.3);
      c.fillStyle=alt?"#0d0a18":"#100c1d";c.fillRect(0,p2.y,W,p1.y-p2.y+1);
      function quad(xa,ya,wa,xb,yb,wb,col){c.fillStyle=col;c.beginPath();c.moveTo(xa-wa,ya);c.lineTo(xa+wa,ya);c.lineTo(xb+wb,yb);c.lineTo(xb-wb,yb);c.closePath();c.fill()}
      quad(p1.x,p1.y,p1.w*1.18,p2.x,p2.y,p2.w*1.18,alt?sk.a:"#f4f4f6");
      quad(p1.x,p1.y,p1.w,p2.x,p2.y,p2.w,alt?"#1d1a28":"#211e2e");
      if(alt){quad(p1.x,p1.y,p1.w*0.02,p2.x,p2.y,p2.w*0.02,"rgba(255,255,255,.75)");[-0.5,0.5].forEach(function(k){quad(p1.x+p1.w*k,p1.y,p1.w*0.015,p2.x+p2.w*k,p2.y,p2.w*0.015,"rgba(255,255,255,.5)")})}
      if(fog>0.4){c.fillStyle="rgba(74,15,62,"+((fog-0.4)*0.9)+")";c.fillRect(0,p2.y,W,p1.y-p2.y+1)}
      maxy=p1.y<maxy?p2.y:maxy;maxy=p2.y;drawn.push(s)}
    // sprites back to front: neon posts, coins, cars
    for(var k=drawn.length-1;k>=0;k--){var s2=drawn[k],p=s2._p1;if(p.s<=0)continue;
      if(s2.i%8===0){[-1.35,1.35].forEach(function(side){var px=p.x+p.w*side,h=p.s*1800*H/2/ROADW*1.3,ww=Math.max(1,p.s*60*W/2/ROADW*3);c.fillStyle="#2a2338";c.fillRect(px-ww/2,p.y-h,ww,h);c.fillStyle=sk.a;glow(c,sk.a,10);c.fillRect(px-ww*1.5,p.y-h,ww*3,Math.max(2,ww*0.8));noGlow(c)})}
      if(s2.coin&&!s2.coin.got){coinIcon(c,p.x+p.w*s2.coin.x,p.y-p.w*0.12,Math.max(2,p.w*0.06),S.t)}}
    S.cars.forEach(function(car){var s3=seg(car.z);if(!s3._p1||drawn.indexOf(s3)<0)return;var pp=s3._p1,frac=(car.z%SEG)/SEG,p2=s3._p2,
      cx=lerp(pp.x,p2.x,frac)+lerp(pp.w,p2.w,frac)*car.x,cy=lerp(pp.y,p2.y,frac),cw=lerp(pp.w,p2.w,frac)*0.32,ch=cw*0.55;if(cw<1)return;
      c.fillStyle="#08070c";rr(c,cx-cw/2,cy-ch,cw,ch,cw*0.12);c.fill();c.fillStyle=car.col;rr(c,cx-cw/2,cy-ch*0.95,cw,ch*0.6,cw*0.1);c.fill();
      c.fillStyle="rgba(10,10,20,.8)";rr(c,cx-cw*0.32,cy-ch*0.98,cw*0.64,ch*0.28,cw*0.06);c.fill();
      c.fillStyle="#ff2d3d";glow(c,"#ff2d3d",8);c.fillRect(cx-cw*0.46,cy-ch*0.55,cw*0.16,ch*0.12);c.fillRect(cx+cw*0.3,cy-ch*0.55,cw*0.16,ch*0.12);noGlow(c)});
    // player car (rear view, original wedge design)
    var bob=Math.sin(S.t*30)*(S.speed/S.max)*1.5,px=W/2,py=H-26+bob,st=(S.touch!==null?(S.touch<W/2?-1:1):S.dir);
    if(S.inv>0&&((S.t*12)|0)%2)c.globalAlpha=0.4;
    c.save();c.translate(px,py);c.rotate(st*0.04);
    c.fillStyle="rgba(0,0,0,.5)";c.beginPath();c.ellipse(0,4,92,12,0,0,Math.PI*2);c.fill();
    c.fillStyle="#111";rr(c,-86,-24,26,30,6);c.fill();rr(c,60,-24,26,30,6);c.fill();
    var bg=c.createLinearGradient(0,-70,0,0);bg.addColorStop(0,sk.b);bg.addColorStop(1,sk.a);c.fillStyle=bg;
    c.beginPath();c.moveTo(-80,-6);c.lineTo(-70,-44);c.lineTo(-40,-66);c.lineTo(40,-66);c.lineTo(70,-44);c.lineTo(80,-6);c.closePath();c.fill();
    c.fillStyle="rgba(8,8,18,.85)";c.beginPath();c.moveTo(-44,-46);c.lineTo(-30,-62);c.lineTo(30,-62);c.lineTo(44,-46);c.closePath();c.fill();
    c.fillStyle="#ff2d3d";glow(c,"#ff2d3d",14);rr(c,-72,-30,40,8,3);c.fill();rr(c,32,-30,40,8,3);c.fill();noGlow(c);
    c.fillStyle="#0c0c12";rr(c,-24,-22,48,12,3);c.fill();label(c,"VHB",0,-16,9,sk.a);c.restore();c.globalAlpha=1;
    if(Math.abs(S.x)>1&&S.speed>S.max*0.3){for(var q=0;q<2;q++)S.parts.push({x:px+rand(-70,70),y:H-20,vx:rand(-40,40),vy:rand(-60,-20),l:0.5,col:"rgba(200,190,220,.6)"})}
    stepSparks(c,S.parts,1/60,0);stepText(c,S.txt,1/60);
    var spd=(S.speed/SEG*3.6*1.2)|0;label(c,spd+" km/h",W-70,H-24,16,TXT)};
  S.over=function(){return overObj("Shields down!",(S.dist|0)+" m",S.passed+" overtakes · "+S.coins+" coins.",S.dist,S.coins)};
  S.preview=HG.livePreview(S,function(s){var pz=s.pos+SEG*4.5,threat=null;s.cars.forEach(function(c){var d=((c.z-pz)%LEN+LEN)%LEN;if(d<SEG*10&&Math.abs(c.x-s.x)<0.5)threat=c});
    var target=threat?(threat.x>0?-0.6:0.6):0;s.dir=Math.abs(target-s.x)<0.1?0:(target<s.x?-1:1)});
  return S;
};

/* ---------- 3. PULSE DEFENDER — arena shooter, protect the core ---------- */
NEW.pulse=function(){
  var S={},CX=W/2,CY=H/2+10;
  S.title="Pulse Defender";S.keys="Aim: move / drag pointer · <kbd>←</kbd> <kbd>→</kbd> rotate · Auto-fire";
  S.intro="Geometric drones are swarming the core. Aim the pulse cannon, it fires by itself. Gold drones drop power-ups.";
  S.reset=function(){S.ang=-Math.PI/2;S.rot=0;S.aimX=null;S.shots=[];S.foes=[];S.drops=[];S.parts=[];S.txt=[];S.t=0;S.fire=0;S.spawn=1;S.hp=3;S.kills=0;S.score=0;S.coins=0;S.tri=0;S.wave=1;S.inv=0};
  S.key=function(k){if(k==="ArrowLeft"||k==="a"||k==="A"){S.rot=-1;S.aimX=null;return true}if(k==="ArrowRight"||k==="d"||k==="D"){S.rot=1;S.aimX=null;return true}return false};
  S.keyUp=function(k){if(/^(ArrowLeft|ArrowRight|a|A|d|D)$/.test(k))S.rot=0};
  S.pointerXY=function(x,y){S.aimX=x;S.aimY=y};S.action=function(){};
  S.hud=function(){return["<b>"+S.score+"</b> pts · "+"♥".repeat(Math.max(0,S.hp))+" · 🪙 <b>"+S.coins+"</b>","Best <b>"+best("pulse",S.score)+"</b>"]};
  var TYPES=[{n:"dart",hp:1,sp:95,r:12,pts:10,col:CY},{n:"block",hp:3,sp:55,r:17,pts:30,col:VI},{n:"hex",hp:2,sp:70,r:15,pts:20,col:"#ff3d5e"},{n:"gold",hp:2,sp:80,r:13,pts:50,col:GOLD}];
  function spawn(){var a=rand(0,Math.PI*2),d=Math.hypot(W,H)/2+30,r=Math.random(),tp=r<0.06?TYPES[3]:r<0.25+Math.min(0.2,S.t*0.004)?TYPES[1]:r<0.5?TYPES[2]:TYPES[0];
    var k=1+Math.min(1.3,S.t*0.012);S.foes.push({x:CX+Math.cos(a)*d,y:CY+Math.sin(a)*d*0.75,hp:tp.hp,tp:tp,sp:tp.sp*k*rand(0.85,1.15),rot:rand(0,6),wob:rand(0,6)})}
  S.update=function(dt){S.t+=dt;S.inv=Math.max(0,S.inv-dt);S.tri=Math.max(0,S.tri-dt);var wv=1+((S.t/20)|0);if(wv>S.wave){S.wave=wv;snd("level");floatText(S.txt,CX,80,"WAVE "+wv,CY)}
    if(S.aimX!=null){var ta=Math.atan2(S.aimY-CY,S.aimX-CX),d=Math.atan2(Math.sin(ta-S.ang),Math.cos(ta-S.ang));S.ang+=clamp(d,-dt*9,dt*9)}else S.ang+=S.rot*dt*4;
    S.fire-=dt;if(S.fire<=0){S.fire=Math.max(0.09,0.2-S.t*0.0008);var spread=S.tri>0?[-0.18,0,0.18]:[0];spread.forEach(function(o){var a=S.ang+o;S.shots.push({x:CX+Math.cos(a)*30,y:CY+Math.sin(a)*30,vx:Math.cos(a)*620,vy:Math.sin(a)*620,l:1.2})});snd("zap")}
    S.spawn-=dt;if(S.spawn<=0){spawn();S.spawn=Math.max(0.28,1.15-S.t*0.012)}
    for(var i=S.shots.length-1;i>=0;i--){var s=S.shots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.l-=dt;if(s.l<=0||s.x<-20||s.x>W+20||s.y<-20||s.y>H+20){S.shots.splice(i,1);continue}
      for(var j=S.foes.length-1;j>=0;j--){var f=S.foes[j];if(Math.hypot(f.x-s.x,f.y-s.y)<f.tp.r+4){S.shots.splice(i,1);f.hp--;sparks(S.parts,s.x,s.y,f.tp.col,5,140);
        if(f.hp<=0){S.foes.splice(j,1);S.kills++;S.score+=f.tp.pts;snd("boom");HG.ring(f.x,f.y,f.tp.col);sparks(S.parts,f.x,f.y,f.tp.col,22,260);
          if(f.tp.n==="gold")S.drops.push({x:f.x,y:f.y,k:"tri",l:8});
          if(f.tp.n==="hex"){for(var h=0;h<2;h++)S.foes.push({x:f.x+rand(-10,10),y:f.y+rand(-10,10),hp:1,tp:TYPES[0],sp:TYPES[0].sp*1.2,rot:0,wob:rand(0,6)})}
          if(Math.random()<0.35)S.drops.push({x:f.x,y:f.y,k:"coin",l:8})}break}}}
    for(var q=S.foes.length-1;q>=0;q--){var e=S.foes[q],a2=Math.atan2(CY-e.y,CX-e.x);e.wob+=dt*3;e.rot+=dt*2;var wobble=e.tp.n==="dart"?Math.sin(e.wob)*0.6:0;
      e.x+=Math.cos(a2+wobble)*e.sp*dt;e.y+=Math.sin(a2+wobble)*e.sp*dt;
      if(Math.hypot(e.x-CX,e.y-CY)<34){S.foes.splice(q,1);if(S.inv<=0){S.hp--;S.inv=1;snd("hurt");buzz([60,40,60]);HG.boom(CX,CY,RED,14)}sparks(S.parts,e.x,e.y,RED,20,220);if(S.hp<=0){snd("boom");return "over"}}}
    for(var m=S.drops.length-1;m>=0;m--){var dr=S.drops[m],da=Math.atan2(CY-dr.y,CX-dr.x);dr.l-=dt;dr.x+=Math.cos(da)*160*dt;dr.y+=Math.sin(da)*160*dt;
      if(Math.hypot(dr.x-CX,dr.y-CY)<28){S.drops.splice(m,1);if(dr.k==="coin"){S.coins++;snd("coin")}else{S.tri=7;snd("power");floatText(S.txt,CX,CY-60,"TRIPLE PULSE",GOLD)}}}};
  S.draw=function(c){var sk=skin(),t=S.t;c.fillStyle="#06060d";c.fillRect(0,0,W,H);
    c.strokeStyle="rgba(255,255,255,.04)";c.lineWidth=1;for(var r=60;r<500;r+=60){c.beginPath();c.arc(CX,CY,r+(t*20)%60,0,Math.PI*2);c.stroke()}
    for(var a=0;a<12;a++){c.beginPath();c.moveTo(CX,CY);c.lineTo(CX+Math.cos(a/12*Math.PI*2+t*0.05)*600,CY+Math.sin(a/12*Math.PI*2+t*0.05)*600);c.stroke()}
    S.drops.forEach(function(d){if(d.k==="coin")coinIcon(c,d.x,d.y,8,t);else{glow(c,GOLD,14);c.strokeStyle=GOLD;c.lineWidth=2;c.beginPath();c.arc(d.x,d.y,10,0,Math.PI*2);c.stroke();noGlow(c);label(c,"3",d.x,d.y+1,12,GOLD)}});
    S.foes.forEach(function(f){c.save();c.translate(f.x,f.y);c.rotate(f.rot);glow(c,f.tp.col,12);c.strokeStyle=f.tp.col;c.lineWidth=2.5;c.fillStyle="rgba(0,0,0,.6)";var R=f.tp.r;c.beginPath();
      if(f.tp.n==="dart"){c.moveTo(R,0);c.lineTo(-R*0.7,R*0.7);c.lineTo(-R*0.3,0);c.lineTo(-R*0.7,-R*0.7);c.closePath()}
      else if(f.tp.n==="block"){c.rect(-R*0.8,-R*0.8,R*1.6,R*1.6)}
      else{for(var k=0;k<6;k++){var aa=k/6*Math.PI*2;k?c.lineTo(Math.cos(aa)*R,Math.sin(aa)*R):c.moveTo(R,0)}c.closePath()}
      c.fill();c.stroke();noGlow(c);if(f.tp.hp>1){c.fillStyle=f.tp.col;for(var hh=0;hh<f.hp;hh++)c.fillRect(-6+hh*5,-2,3,4)}c.restore()});
    c.save();c.globalCompositeOperation="lighter";S.shots.forEach(function(s){c.strokeStyle=sk.a;c.lineWidth=3;c.beginPath();c.moveTo(s.x,s.y);c.lineTo(s.x-s.vx*0.025,s.y-s.vy*0.025);c.stroke()});c.restore();
    stepSparks(c,S.parts,1/60,0);
    // core
    var pulse=1+Math.sin(t*6)*0.06;if(S.inv>0&&((t*14)|0)%2)c.globalAlpha=0.5;
    glow(c,sk.a,30);c.fillStyle=sk.a;c.beginPath();c.arc(CX,CY,22*pulse,0,Math.PI*2);c.fill();noGlow(c);
    c.fillStyle=sk.b;c.beginPath();c.arc(CX,CY,10,0,Math.PI*2);c.fill();
    c.strokeStyle=sk.a;c.lineWidth=2;for(var hp=0;hp<3;hp++){c.globalAlpha=hp<S.hp?0.8:0.12;c.beginPath();c.arc(CX,CY,30+hp*6,0,Math.PI*2);c.stroke()}c.globalAlpha=1;
    c.save();c.translate(CX,CY);c.rotate(S.ang);c.fillStyle=TXT;rr(c,14,-5,26,10,4);c.fill();c.restore();
    stepText(c,S.txt,1/60);vignette(c,0.5)};
  S.over=function(){return overObj("Core breached!",S.score+"",S.kills+" drones destroyed · wave "+S.wave+" · "+S.coins+" coins.",S.score,S.coins)};
  S.preview=HG.livePreview(S,function(s){var n=null,bd=1e9;s.foes.forEach(function(f){var d=Math.hypot(f.x-CX,f.y-CY);if(d<bd){bd=d;n=f}});if(n){s.aimX=n.x;s.aimY=n.y}});
  return S;
};

/* ---------- 4. ROPE RALLY — swing physics with Vee, the VarHireBlaze runner ---------- */
NEW.rope=function(){
  var S={},G=1300;
  S.title="Rope Rally";S.keys="Hold <kbd>Space</kbd> / hold the screen to grab the nearest ring · release to fly";
  S.intro="Vee needs to cross the city without touching the neon floor. Hold to throw a rope, release at the right moment to launch.";
  function addRing(){var last=S.rings[S.rings.length-1],gap=rand(170,240)+Math.min(120,S.camX*0.012);S.rings.push({x:last.x+gap,y:rand(70,190)});
    if(Math.random()<0.7)S.coinsL.push({x:last.x+gap*0.5,y:rand(180,300),got:false})}
  S.reset=function(){S.px=120;S.py=230;S.vx=260;S.vy=-120;S.hold=false;S.rope=null;S.camX=0;S.t=0;S.coins=0;S.dist=0;S.parts=[];S.txt=[];S.coinsL=[];S.rings=[{x:200,y:110}];for(var i=0;i<6;i++)addRing();S.spin=0;S.lvl=1;S.rope={r:S.rings[0],len:150,auto:2.5};S.px=200-120;S.py=200;S.vx=300;S.vy=0};
  function nearest(){var b=null,bd=1e9;S.rings.forEach(function(r){if(r.x<S.px-40)return;var d=Math.hypot(r.x-S.px,r.y-S.py);if(d<bd&&d<420){bd=d;b=r}});return b}
  S.press=function(on){if(S.rope&&S.rope.auto){if(on){S.rope.auto=0;S.hold=true;return}}if(on&&!S.hold){var r=nearest();if(r){S.rope={r:r,len:Math.max(60,Math.hypot(r.x-S.px,r.y-S.py))};snd("grab")}}if(!on&&S.rope){S.rope=null;snd("release");S.vx*=1.06;S.vy-=40}S.hold=on};
  S.action=function(){};
  S.hud=function(){return hud2("rope",S.dist,S.coins,"m")};
  S.update=function(dt){S.t+=dt;var sub=3,h=dt/sub;if(S.rope&&S.rope.auto){S.rope.auto-=dt;if(S.rope.auto<=0){S.rope=null;snd("release")}}
    for(var k=0;k<sub;k++){S.vy+=G*h;if(S.rope){var r=S.rope.r,dx=S.px-r.x,dy=S.py-r.y,d=Math.hypot(dx,dy),nx=dx/d,ny=dy/d;
        var tx=-ny,ty=nx,tv=S.vx*tx+S.vy*ty;S.vx+=tx*Math.sign(tv)*120*h;S.vy+=ty*Math.sign(tv)*120*h; // pump
        S.px+=S.vx*h;S.py+=S.vy*h;dx=S.px-r.x;dy=S.py-r.y;d=Math.hypot(dx,dy);nx=dx/d;ny=dy/d;
        if(d>S.rope.len){S.px=r.x+nx*S.rope.len;S.py=r.y+ny*S.rope.len;var rv=S.vx*nx+S.vy*ny;if(rv>0){S.vx-=rv*nx;S.vy-=rv*ny}}
        if(S.rope.len>70)S.rope.len-=40*h}
      else{S.px+=S.vx*h;S.py+=S.vy*h;S.vx*=0.9995}}
    S.spin+=dt*(S.rope?0:S.vx*0.02);
    if(S.py<20){S.py=20;S.vy=Math.abs(S.vy)*0.3}
    S.camX=lerp(S.camX,S.px-240,Math.min(1,dt*5));S.dist=Math.max(S.dist,(S.px-120)/20);
    var lv=1+((S.dist/150)|0);if(lv>S.lvl){S.lvl=lv;snd("level");floatText(S.txt,S.px-S.camX,S.py-80,"LEVEL "+lv,CY)}
    while(S.rings[S.rings.length-1].x<S.camX+W+300)addRing();
    S.rings=S.rings.filter(function(r){return r.x>S.camX-200||(S.rope&&S.rope.r===r)});S.coinsL=S.coinsL.filter(function(c){return c.x>S.camX-100});
    S.coinsL.forEach(function(c){if(!c.got&&Math.hypot(c.x-S.px,c.y-(S.py-30))<30){c.got=true;S.coins++;snd("coin");sparks(S.parts,c.x-S.camX,c.y,GOLD,12,160)}});
    if(S.py>H-30){snd("boom");buzz([60,40,90]);HG.boom(S.px-S.camX,H-30,RED,14);sparks(S.parts,S.px-S.camX,H-30,RED,30,260);return "over"}};
  S.draw=function(c){var sk=skin(),cx=S.camX,t=S.t;
    var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,"#071026");g.addColorStop(1,"#1a0b2e");c.fillStyle=g;c.fillRect(0,0,W,H);
    // skyline layers (generated, original)
    [[0.2,"#0f1533",120,46],[0.45,"#141a3d",80,34]].forEach(function(L){c.fillStyle=L[1];var off=cx*L[0];for(var i=-1;i<W/L[3]+2;i++){var bi=Math.floor(off/L[3])+i,hgt=L[2]+((bi*7919)%97);var x=i*L[3]-off%L[3];c.fillRect(x,H-40-hgt,L[3]-4,hgt);
      c.fillStyle="rgba(255,210,63,.25)";for(var w=0;w<4;w++)if((bi*31+w*17)%5===0)c.fillRect(x+6+(w%2)*14,H-30-hgt+12+((w/2)|0)*18,6,8);c.fillStyle=L[1]}});
    // lava floor
    var lg=c.createLinearGradient(0,H-40,0,H);lg.addColorStop(0,sk.a);lg.addColorStop(1,"#2a0610");c.fillStyle=lg;c.globalAlpha=0.85;c.fillRect(0,H-34,W,34);c.globalAlpha=1;
    c.strokeStyle=sk.b;c.lineWidth=2;glow(c,sk.a,16);c.beginPath();for(var x=0;x<=W;x+=10)c.lineTo(x,H-34+Math.sin((x+cx)*0.04+t*4)*3);c.stroke();noGlow(c);
    var nr=S.rope?null:nearest();
    S.rings.forEach(function(r){var x=r.x-cx;c.strokeStyle=r===nr?sk.a:"rgba(255,255,255,.55)";c.lineWidth=3;if(r===nr)glow(c,sk.a,16);c.beginPath();c.arc(x,r.y,11,0,Math.PI*2);c.stroke();noGlow(c);
      c.strokeStyle="rgba(255,255,255,.15)";c.beginPath();c.moveTo(x,0);c.lineTo(x,r.y-11);c.stroke()});
    S.coinsL.forEach(function(k){if(!k.got)coinIcon(c,k.x-cx,k.y,9,t)});
    if(S.rope){c.strokeStyle=sk.b;c.lineWidth=2;c.beginPath();c.moveTo(S.rope.r.x-cx,S.rope.r.y);c.lineTo(S.px-cx,S.py-50);c.stroke()}
    else if(nr){c.setLineDash([4,6]);c.strokeStyle="rgba(255,255,255,.18)";c.beginPath();c.moveTo(nr.x-cx,nr.y);c.lineTo(S.px-cx,S.py-50);c.stroke();c.setLineDash([])}
    // Vee
    var vx=S.px-cx;c.save();c.translate(vx,S.py-30);c.rotate(S.rope?Math.atan2(S.rope.r.x-S.px,S.py-S.rope.r.y)*0.6:Math.sin(S.spin)*0.4);
    stick(c,0,30,0.85,{t:t,run:!S.rope,arm:S.rope?"up":null,color:TXT,tie:false});
    c.fillStyle=sk.a;c.beginPath();c.moveTo(-6,-22);c.lineTo(6,-22);c.lineTo(-22-Math.sin(t*20)*4,-16);c.closePath();c.fill();
    c.fillStyle=sk.a;c.fillRect(-9,-31,18,4);c.restore();
    stepSparks(c,S.parts,1/60,300);stepText(c,S.txt,1/60);vignette(c,0.45)};
  S.over=function(){return overObj("Into the neon!",(S.dist|0)+" m","Level "+S.lvl+" · "+S.coins+" coins collected.",S.dist,S.coins)};
  S.preview=HG.livePreview(S,function(s){if(s.rope){if(s.rope.auto){s.press(true);return}var r=s.rope.r;if(Math.atan2(s.px-r.x,s.py-r.y)>0.3&&s.vy<0)s.press(false)}else{var n=nearest();if(n&&n.x-s.px>-20&&n.x-s.px<120)s.press(true)}});
  return S;
};

/* ---------- 5. GRADIENT DROP — downhill reflex run with Kubo the cube ---------- */
NEW.gradient=function(){
  var S={},ANG=0.28,PX=230,GY=300; // slope-frame ground line
  S.title="Gradient Drop";S.keys="Tap / <kbd>Space</kbd> to jump · tap again in the air for a second jump";
  S.intro="Kubo is sliding down an endless neon slope. Jump the gaps, clear the spikes, and hit the boost pads. The slope gets steeper.";
  function addObs(){var x=S.nextX,r=Math.random(),lv=Math.min(1,S.t/60);
    if(r<0.3)S.obs.push({k:"gap",x:x,w:rand(70,110)+lv*60});
    else if(r<0.6)S.obs.push({k:"spike",x:x,w:30*(1+((Math.random()*(1+lv*2))|0))});
    else if(r<0.8)S.obs.push({k:"wall",x:x,w:26,h:rand(40,64)});
    else S.obs.push({k:"pad",x:x,w:60});
    if(Math.random()<0.7)for(var i=0;i<3;i++)S.coinsL.push({x:x-90+i*40,y:-70-Math.sin(i/2*Math.PI)*30,got:false});
    S.nextX=x+(o0w(S)+S.v*0.72+rand(110,200))}
  function o0w(S){var o=S.obs[S.obs.length-1];return o?o.w:0}
  S.reset=function(){S.dist=0;S.v=320;S.y=0;S.vy=0;S.jumps=0;S.rot=0;S.t=0;S.obs=[];S.coinsL=[];S.nextX=1150;S.coins=0;S.parts=[];S.txt=[];S.ang=ANG;S.lvl=1;S.boost=0;for(var i=0;i<4;i++)addObs()};
  function groundAt(x){for(var i=0;i<S.obs.length;i++){var o=S.obs[i];if(o.k==="gap"&&x>o.x&&x<o.x+o.w)return false}return true}
  S.action=function(){if(S.jumps<2){S.vy=S.jumps?-560:-640;S.jumps++;snd("jump");sparks(S.parts,PX,GY,skin().a,8,120)}};
  S.hud=function(){return hud2("gradient",S.dist,S.coins,"m")};
  S.update=function(dt){S.t+=dt;S.boost=Math.max(0,S.boost-dt);S.v=Math.min(820,320+S.t*7)+(S.boost>0?260:0);S.ang=lerp(S.ang,ANG+Math.min(0.18,S.t*0.003),dt);
    var lv=1+((S.t/15)|0);if(lv>S.lvl){S.lvl=lv;snd("level");floatText(S.txt,PX+60,GY-120,"STEEPER!",CY)}
    S.dist+=S.v*dt/30;var wx=S.dist*30;
    S.vy+=1900*dt;S.y+=S.vy*dt;var onG=groundAt(wx+PX);
    if(S.y>=0&&onG&&S.y<30){S.y=0;S.vy=0;if(S.jumps)S.rot=Math.round(S.rot/(Math.PI/2))*(Math.PI/2);S.jumps=0}else{S.rot+=dt*9}
    if(S.y>160){snd("boom");buzz([60,40,90]);return "over"}
    while(S.nextX<wx+W+200)addObs();
    S.obs=S.obs.filter(function(o){return o.x+o.w>wx-200});S.coinsL=S.coinsL.filter(function(k){return k.x>wx-100});
    for(var i=0;i<S.obs.length;i++){var o=S.obs[i],ox=o.x-wx;if(PX+14>ox&&PX-14<ox+o.w){
        if(o.k==="spike"&&S.y>-22){HG.boom(PX,GY-14,RED,14);sparks(S.parts,PX,GY-14,RED,30,260);snd("boom");buzz([60,40,90]);return "over"}
        if(o.k==="wall"&&S.y>-o.h){HG.boom(PX,GY-14,RED,14);sparks(S.parts,PX,GY-14,RED,30,260);snd("boom");buzz([60,40,90]);return "over"}
        if(o.k==="pad"&&S.y>-4&&!o.used){o.used=true;S.boost=1.4;S.vy=-520;S.jumps=1;snd("power");floatText(S.txt,PX,GY-80,"BOOST",GOLD)}}}
    S.coinsL.forEach(function(k){if(!k.got&&Math.abs(k.x-wx-PX)<22&&Math.abs(k.y-(S.y-14))<26){k.got=true;S.coins++;snd("coin");sparks(S.parts,PX,GY+k.y,GOLD,10,140)}})};
  S.draw=function(c){var sk=skin(),t=S.t,wx=S.dist*30;
    var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,"#0a1422");g.addColorStop(1,"#061a16");c.fillStyle=g;c.fillRect(0,0,W,H);
    // speed stripes
    c.strokeStyle="rgba(61,232,255,.08)";for(var i=0;i<14;i++){var y=(i*41+wx*0.3)%H;c.beginPath();c.moveTo(0,y);c.lineTo(W,y-W*Math.tan(S.ang));c.stroke()}
    c.save();c.translate(W/2,H/2);c.rotate(S.ang);c.translate(-W/2,-H/2+40);
    // slope with gaps
    var segStart=-400;var gaps=S.obs.filter(function(o){return o.k==="gap"}).map(function(o){return[o.x-wx,o.x-wx+o.w]});
    var pieces=[[segStart,W+500]];gaps.forEach(function(gp){var nx=[];pieces.forEach(function(p){if(gp[1]<=p[0]||gp[0]>=p[1]){nx.push(p);return}if(gp[0]>p[0])nx.push([p[0],gp[0]]);if(gp[1]<p[1])nx.push([gp[1],p[1]])});pieces=nx});
    pieces.forEach(function(p){var gr=c.createLinearGradient(0,GY,0,GY+200);gr.addColorStop(0,"rgba(157,255,61,.16)");gr.addColorStop(1,"rgba(0,0,0,0)");c.fillStyle=gr;c.fillRect(p[0],GY,p[1]-p[0],220);
      c.strokeStyle=sk.a;glow(c,sk.a,14);c.lineWidth=3;c.beginPath();c.moveTo(p[0],GY);c.lineTo(p[1],GY);c.stroke();noGlow(c);
      c.strokeStyle="rgba(255,255,255,.07)";c.lineWidth=1;for(var x=Math.ceil((p[0]+wx)/40)*40-wx;x<p[1];x+=40){c.beginPath();c.moveTo(x,GY);c.lineTo(x-30,GY+200);c.stroke()}});
    S.obs.forEach(function(o){var x=o.x-wx;if(o.k==="spike"){c.fillStyle=RED;glow(c,RED,10);for(var s=0;s<o.w;s+=30){c.beginPath();c.moveTo(x+s,GY);c.lineTo(x+s+15,GY-26);c.lineTo(x+s+30,GY);c.closePath();c.fill()}noGlow(c)}
      else if(o.k==="wall"){c.fillStyle="#1a2433";c.strokeStyle=VI;c.lineWidth=2;glow(c,VI,12);c.fillRect(x,GY-o.h,o.w,o.h);c.strokeRect(x,GY-o.h,o.w,o.h);noGlow(c)}
      else if(o.k==="pad"){c.fillStyle=o.used?"rgba(255,210,63,.3)":GOLD;glow(c,GOLD,14);c.fillRect(x,GY-5,o.w,5);noGlow(c);for(var a=0;a<3;a++){c.fillStyle="rgba(255,210,63,"+(0.5-a*0.15)+")";c.beginPath();c.moveTo(x+10+a*16,GY-10);c.lineTo(x+18+a*16,GY-18);c.lineTo(x+10+a*16,GY-26);c.lineTo(x+14+a*16,GY-18);c.fill()}}});
    S.coinsL.forEach(function(k){if(!k.got)coinIcon(c,k.x-wx,GY+k.y,9,t)});
    // Kubo
    c.save();c.translate(PX,GY+S.y-14);c.rotate(S.rot);glow(c,sk.a,20);c.fillStyle=sk.a;rr(c,-14,-14,28,28,6);c.fill();noGlow(c);
    c.fillStyle="#0b0b10";c.fillRect(-7,-5,4,7);c.fillRect(3,-5,4,7);c.fillStyle=sk.b;c.fillRect(-6,4,12,3);c.restore();
    if(S.boost>0)for(var b=0;b<3;b++)S.parts.push({x:PX-16,y:GY+S.y-14+rand(-8,8),vx:rand(-260,-140),vy:rand(-20,20),l:0.4,col:GOLD});
    stepSparks(c,S.parts,1/60,0);c.restore();stepText(c,S.txt,1/60);vignette(c,0.45)};
  S.over=function(){return overObj("Wiped out!",(S.dist|0)+" m","Steepness level "+S.lvl+" · "+S.coins+" coins.",S.dist,S.coins)};
  S.preview=HG.livePreview(S,function(s){var wx=s.dist*30;for(var i=0;i<s.obs.length;i++){var o=s.obs[i],d=o.x-wx-PX;var lead=o.k==="gap"?s.v*0.06:o.k==="wall"?s.v*0.16:s.v*0.1;if(o.k!=="pad"&&d>0&&d<lead+14&&s.jumps===0){s.action();break}}});
  return S;
};

/* ---------- 6. GLITCH HORDE — top-down survival against corrupted bots ---------- */
NEW.horde=function(){
  var S={};
  S.title="Glitch Horde";S.keys="Move: <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> / arrows · Touch: hold and drag where to go · Auto-fire";
  S.intro="The office servers glitched and the bots woke up. Survive the night shift: keep moving, your blaster aims itself. Upgrades every 12 kills.";
  var UPG=["Faster fire","Twin shot","Swift boots","Piercing rounds","Bigger magnet","Triple shot"];
  S.reset=function(){S.x=W/2;S.y=H/2;S.k={};S.tgt=null;S.foes=[];S.shots=[];S.drops=[];S.parts=[];S.txt=[];S.t=0;S.hp=3;S.inv=0;S.fire=0;S.spawn=1.2;S.kills=0;S.coins=0;S.score=0;S.rate=0.42;S.multi=1;S.spd=190;S.pierce=0;S.mag=60;S.up=0;S.face=0};
  var MAP={ArrowUp:"u",w:"u",W:"u",ArrowDown:"d",s:"d",S:"d",ArrowLeft:"l",a:"l",A:"l",ArrowRight:"r",d:"r",D:"r"};
  S.key=function(k){if(MAP[k]){S.k[MAP[k]]=1;S.tgt=null;return true}return false};S.keyUp=function(k){if(MAP[k])S.k[MAP[k]]=0};
  S.press=function(on,x,y){if(!on)S.tgt=null;else if(x!=null)S.tgt={x:x,y:y}};S.pointerXY=function(x,y){if(S.tgt)S.tgt={x:x,y:y}};S.action=function(){};
  S.hud=function(){return["<b>"+S.score+"</b> pts · "+"♥".repeat(Math.max(0,S.hp))+" · 🪙 <b>"+S.coins+"</b>","Best <b>"+best("horde",S.score)+"</b>"]};
  function spawn(){var side=(Math.random()*4)|0,x=side<2?rand(0,W):(side===2?-20:W+20),y=side>=2?rand(0,H):(side===0?-20:H+20),r=Math.random(),lv=S.t/60;
    var tp=r<0.12+lv*0.1?{n:"brute",hp:4,sp:45,r:17,col:VI}:r<0.4?{n:"sprinter",hp:1,sp:120,r:11,col:"#ff3d5e"}:{n:"walker",hp:2,sp:68,r:13,col:"#9dff3d"};
    S.foes.push({x:x,y:y,hp:tp.hp+((lv*1.2)|0)*(tp.n==="brute"?1:0),tp:tp,sp:tp.sp*(1+Math.min(0.8,S.t*0.006)),g:rand(0,9)})}
  S.update=function(dt){S.t+=dt;S.inv=Math.max(0,S.inv-dt);S.score=((S.t*10)|0)+S.kills*5;
    var mx=(S.k.r||0)-(S.k.l||0),my=(S.k.d||0)-(S.k.u||0);if(S.tgt){var dx=S.tgt.x-S.x,dy=S.tgt.y-S.y,d=Math.hypot(dx,dy);if(d>8){mx=dx/d;my=dy/d}}
    var m=Math.hypot(mx,my);if(m>0){mx/=m;my/=m;S.face+=dt*14}S.x=clamp(S.x+mx*S.spd*dt,16,W-16);S.y=clamp(S.y+my*S.spd*dt,16,H-16);
    S.spawn-=dt;if(S.spawn<=0){spawn();if(S.t>25&&Math.random()<0.45)spawn();if(S.t>60&&Math.random()<0.5)spawn();S.spawn=Math.max(0.16,0.95-S.t*0.016)}
    S.fire-=dt;if(S.fire<=0&&S.foes.length){var n=null,bd=1e9;S.foes.forEach(function(f){var d2=Math.hypot(f.x-S.x,f.y-S.y);if(d2<bd){bd=d2;n=f}});
      if(n&&bd<420){S.fire=S.rate;var a=Math.atan2(n.y-S.y,n.x-S.x),sp=S.multi===1?[0]:S.multi===2?[-0.12,0.12]:[-0.2,0,0.2];
        sp.forEach(function(o){S.shots.push({x:S.x,y:S.y,vx:Math.cos(a+o)*560,vy:Math.sin(a+o)*560,l:0.9,p:S.pierce})});snd("zap")}}
    for(var i=S.shots.length-1;i>=0;i--){var s=S.shots[i];s.x+=s.vx*dt;s.y+=s.vy*dt;s.l-=dt;if(s.l<=0){S.shots.splice(i,1);continue}
      for(var j=S.foes.length-1;j>=0;j--){var f=S.foes[j];if(f.hitBy===s)continue;if(Math.hypot(f.x-s.x,f.y-s.y)<f.tp.r+3){f.hp--;f.hitBy=s;f.x+=s.vx*0.02;f.y+=s.vy*0.02;sparks(S.parts,s.x,s.y,f.tp.col,5,120);
        if(f.hp<=0){S.foes.splice(j,1);S.kills++;snd("boom");sparks(S.parts,f.x,f.y,f.tp.col,18,220);if(Math.random()<0.45)S.drops.push({x:f.x,y:f.y});
          if(S.kills%12===0){var u=UPG[S.up%UPG.length];S.up++;if(u==="Faster fire")S.rate=Math.max(0.14,S.rate*0.78);if(u==="Twin shot")S.multi=Math.max(S.multi,2);if(u==="Triple shot")S.multi=3;
            if(u==="Swift boots")S.spd+=30;if(u==="Piercing rounds")S.pierce+=1;if(u==="Bigger magnet")S.mag+=50;snd("level");floatText(S.txt,S.x,S.y-40,"UPGRADE: "+u.toUpperCase(),CY)}}
        if(s.p>0){s.p--}else{S.shots.splice(i,1)}break}}}
    for(var q=0;q<S.foes.length;q++){var e=S.foes[q],a2=Math.atan2(S.y-e.y,S.x-e.x);e.g+=dt*8;e.x+=Math.cos(a2)*e.sp*dt+Math.sin(e.g)*0.3;e.y+=Math.sin(a2)*e.sp*dt;
      if(Math.hypot(e.x-S.x,e.y-S.y)<e.tp.r+12&&S.inv<=0){S.hp--;S.inv=1.4;snd("hurt");buzz([60,40,60]);HG.boom(S.x,S.y,RED,12);e.x-=Math.cos(a2)*60;e.y-=Math.sin(a2)*60;if(S.hp<=0){snd("boom");return "over"}}}
    for(var m2=S.drops.length-1;m2>=0;m2--){var dr=S.drops[m2],dd=Math.hypot(dr.x-S.x,dr.y-S.y);if(dd<S.mag){dr.x+=(S.x-dr.x)*dt*8;dr.y+=(S.y-dr.y)*dt*8}if(dd<16){S.drops.splice(m2,1);S.coins++;snd("coin")}}};
  S.draw=function(c){var sk=skin(),t=S.t;c.fillStyle="#0a0b10";c.fillRect(0,0,W,H);
    c.strokeStyle="rgba(255,255,255,.035)";c.lineWidth=1;for(var x=0;x<W;x+=50){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}for(var y=0;y<H;y+=50){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
    // desks (static office layout)
    c.fillStyle="#1a1d29";[[90,90],[600,80],[110,370],[620,360],[360,60],[360,410]].forEach(function(d){rr(c,d[0],d[1],90,40,6);c.fill();c.fillStyle="rgba(61,232,255,.15)";c.fillRect(d[0]+30,d[1]+6,30,14);c.fillStyle="#1a1d29"});
    S.drops.forEach(function(d){coinIcon(c,d.x,d.y,7,t)});
    S.foes.forEach(function(f){var R=f.tp.r,jit=((t*20+f.g)|0)%7===0?rand(-3,3):0;c.save();c.translate(f.x+jit,f.y);glow(c,f.tp.col,12);c.fillStyle="#15161f";c.strokeStyle=f.tp.col;c.lineWidth=2;
      rr(c,-R,-R,R*2,R*2,R*0.35);c.fill();c.stroke();noGlow(c);c.fillStyle=f.tp.col;c.fillRect(-R*0.55,-R*0.25,R*0.35,R*0.3);c.fillRect(R*0.2,-R*0.25,R*0.35,R*0.3);
      c.globalAlpha=0.35;c.fillRect(-R,((t*40+f.g*10)%(R*2))-R,R*2,2);c.globalAlpha=1;c.restore()});
    c.save();c.globalCompositeOperation="lighter";S.shots.forEach(function(s){c.fillStyle=sk.b;c.beginPath();c.arc(s.x,s.y,3.5,0,Math.PI*2);c.fill()});c.restore();
    stepSparks(c,S.parts,1/60,0);
    // flashlight
    var lg=c.createRadialGradient(S.x,S.y,90,S.x,S.y,420);lg.addColorStop(0,"rgba(0,0,0,0)");lg.addColorStop(1,"rgba(0,0,0,.5)");c.fillStyle=lg;c.fillRect(0,0,W,H);
    if(S.inv>0&&((t*14)|0)%2)c.globalAlpha=0.4;
    c.save();c.translate(S.x,S.y);glow(c,sk.a,18);c.fillStyle=sk.a;c.beginPath();c.arc(0,0,12,0,Math.PI*2);c.fill();noGlow(c);c.fillStyle=sk.b;c.beginPath();c.arc(0,-2,5,0,Math.PI*2);c.fill();
    c.strokeStyle=sk.b;c.lineWidth=2;c.beginPath();c.arc(0,0,16,S.face,S.face+1.2);c.stroke();c.restore();c.globalAlpha=1;
    if(S.tgt){c.strokeStyle="rgba(255,255,255,.25)";c.beginPath();c.arc(S.tgt.x,S.tgt.y,10,0,Math.PI*2);c.stroke()}
    stepText(c,S.txt,1/60);label(c,((S.t|0)/60|0)+":"+("0"+((S.t|0)%60)).slice(-2),W/2,22,16,MUT)};
  S.over=function(){return overObj("Overrun!",S.score+"","Survived "+(S.t|0)+"s · "+S.kills+" bots down · "+S.coins+" coins.",S.score,S.coins)};
  S.preview=HG.livePreview(S,function(s){var vx=0,vy=0;s.foes.forEach(function(f){var d=Math.hypot(f.x-s.x,f.y-s.y)+1;vx+=(s.x-f.x)/d/d*4000;vy+=(s.y-f.y)/d/d*4000});vx+=(W/2-s.x)*0.02;vy+=(H/2-s.y)*0.02;s.tgt={x:s.x+vx,y:s.y+vy}});
  return S;
};

/* ---------- 7. DRIFT CIRCUIT — top-down drifting through checkpoint gates ---------- */
NEW.drift=function(){
  var S={};
  S.title="Drift Circuit";S.keys="Steer: <kbd>←</kbd> <kbd>→</kbd> · Touch: hold left or right side · the car never stops";
  S.intro="Slide through every gate before the clock hits zero. Longer drifts build a bigger combo. Cones break your combo.";
  function newGate(){var a=S.h+rand(-1.4,1.4),d=rand(320,460)+Math.min(260,S.gates*8);S.gate={x:S.x+Math.cos(a)*d,y:S.y+Math.sin(a)*d,a:a+Math.PI/2+rand(-0.5,0.5),w:Math.max(90,150-S.gates*2)};
    S.cones=S.cones.filter(function(c){return Math.hypot(c.x-S.x,c.y-S.y)<900});for(var i=0;i<4;i++){var ca=rand(0,6.28),cd=rand(140,420);S.cones.push({x:S.gate.x+Math.cos(ca)*cd*0.5+rand(-60,60),y:S.gate.y+Math.sin(ca)*cd*0.5+rand(-60,60),hit:false})}}
  S.reset=function(){S.x=0;S.y=0;S.h=-Math.PI/2;S.vx=0;S.vy=0;S.dir=0;S.touch=null;S.t=0;S.time=12;S.gates=0;S.score=0;S.combo=0;S.mult=1;S.coins=0;S.marks=[];S.parts=[];S.txt=[];S.cones=[];S.coinsL=[];S.drifting=false;newGate();
    for(var i=0;i<8;i++)S.coinsL.push({x:rand(-500,500),y:rand(-700,100),got:false})};
  S.key=function(k){if(k==="ArrowLeft"||k==="a"||k==="A"){S.dir=-1;return true}if(k==="ArrowRight"||k==="d"||k==="D"){S.dir=1;return true}return false};
  S.keyUp=function(k){if(/^(ArrowLeft|ArrowRight|a|A|d|D)$/.test(k))S.dir=0};
  S.press=function(on,x){S.touch=on?(x==null?S.touch:x):null};S.pointerXY=function(x){if(S.touch!==null)S.touch=x};S.action=function(){};
  S.hud=function(){return["<b>"+S.score+"</b> pts · ⏱ <b>"+S.time.toFixed(1)+"</b> · 🪙 <b>"+S.coins+"</b>","Best <b>"+best("drift",S.score)+"</b>"]};
  S.update=function(dt){S.t+=dt;S.time-=dt;var st=S.dir;if(S.touch!==null)st=S.touch<W/2?-1:1;
    var sp=Math.hypot(S.vx,S.vy),top=330+Math.min(160,S.gates*6);S.h+=st*dt*3.1*Math.min(1,sp/160);
    var fx=Math.cos(S.h),fy=Math.sin(S.h);S.vx+=fx*520*dt;S.vy+=fy*520*dt;
    var fwd=S.vx*fx+S.vy*fy,lat=-S.vx*fy+S.vy*fx,grip=st?1.6:5.5;lat*=Math.max(0,1-grip*dt);fwd=Math.min(fwd,top);
    S.vx=fx*fwd-fy*lat;S.vy=fy*fwd+fx*lat;S.x+=S.vx*dt;S.y+=S.vy*dt;
    var slip=Math.abs(lat)/(Math.abs(fwd)+1);S.drifting=slip>0.22&&sp>150;
    if(S.drifting){S.combo+=dt*sp*0.1*S.mult;S.mult=Math.min(8,1+S.combo/120|0);if(Math.random()<0.5)snd("skid");
      [[-12,-8],[-12,8]].forEach(function(o){S.marks.push({x:S.x+fx*o[0]-fy*o[1],y:S.y+fy*o[0]+fx*o[1],l:3})});S.parts.push({x:S.x-fx*14,y:S.y-fy*14,vx:rand(-30,30),vy:rand(-30,30),l:0.6,col:"rgba(220,220,235,.35)"})}
    else if(S.combo>0){S.score+=S.combo|0;if(S.combo>40)floatText(S.txt,W/2,H/2-60,"+"+(S.combo|0)+" DRIFT",S.mult>3?GOLD:CY);S.combo=0;S.mult=1}
    for(var i=S.marks.length-1;i>=0;i--){S.marks[i].l-=dt;if(S.marks[i].l<=0)S.marks.splice(i,1)}if(S.marks.length>600)S.marks.splice(0,S.marks.length-600);
    var g=S.gate,gx=S.x-g.x,gy=S.y-g.y,ax=Math.cos(g.a),ay=Math.sin(g.a),along=gx*ax+gy*ay,across=-gx*ay+gy*ax;
    if(Math.abs(along)<g.w/2&&Math.abs(across)<18){S.gates++;S.score+=100+(S.combo|0);S.time=Math.min(20,S.time+Math.max(3.2,6.5-S.gates*0.12));snd("gate");HG.ring(W/2,H/2,GOLD);floatText(S.txt,W/2,H/2-90,"GATE +100",GOLD);newGate()}
    S.cones.forEach(function(c){if(!c.hit&&Math.hypot(c.x-S.x,c.y-S.y)<20){c.hit=true;c.vx=S.vx*0.8;c.vy=S.vy*0.8;S.combo=0;S.mult=1;S.vx*=0.6;S.vy*=0.6;snd("hit");floatText(S.txt,W/2,H/2-60,"COMBO LOST",RED)}
      if(c.hit){c.x+=(c.vx||0)*dt;c.y+=(c.vy||0)*dt;c.vx*=0.95;c.vy*=0.95}});
    S.coinsL.forEach(function(k){if(!k.got&&Math.hypot(k.x-S.x,k.y-S.y)<24){k.got=true;S.coins++;snd("coin");sparks(S.parts,k.x,k.y,GOLD,10,140)}});
    if(Math.random()<dt*0.8)S.coinsL.push({x:S.x+rand(-500,500),y:S.y+rand(-400,400),got:false});S.coinsL=S.coinsL.filter(function(k){return!k.got&&Math.hypot(k.x-S.x,k.y-S.y)<900});
    if(S.time<=0){S.score+=S.combo|0;snd("lose");return "over"}};
  S.draw=function(c){var sk=skin(),t=S.t,cx=S.x-W/2,cy=S.y-H/2;c.fillStyle="#0c0d12";c.fillRect(0,0,W,H);
    c.save();c.translate(-cx,-cy);
    c.strokeStyle="rgba(255,255,255,.05)";c.lineWidth=1;var g0=80,sx=Math.floor(cx/g0)*g0,sy=Math.floor(cy/g0)*g0;for(var x=sx;x<cx+W+g0;x+=g0){c.beginPath();c.moveTo(x,cy);c.lineTo(x,cy+H);c.stroke()}for(var y=sy;y<cy+H+g0;y+=g0){c.beginPath();c.moveTo(cx,y);c.lineTo(cx+W,y);c.stroke()}
    S.marks.forEach(function(m){c.fillStyle="rgba(0,0,0,"+(0.5*m.l/3)+")";c.fillRect(m.x-2,m.y-2,4,4)});
    var g=S.gate,ax=Math.cos(g.a),ay=Math.sin(g.a),pul=1+Math.sin(t*6)*0.1;glow(c,GOLD,16);c.strokeStyle=GOLD;c.lineWidth=4;c.beginPath();c.moveTo(g.x-ax*g.w/2,g.y-ay*g.w/2);c.lineTo(g.x+ax*g.w/2,g.y+ay*g.w/2);c.stroke();
    [-1,1].forEach(function(s){c.fillStyle=GOLD;c.beginPath();c.arc(g.x+ax*g.w/2*s,g.y+ay*g.w/2*s,8*pul,0,Math.PI*2);c.fill()});noGlow(c);
    S.cones.forEach(function(cn){c.fillStyle=cn.hit?"rgba(255,106,0,.35)":O;c.beginPath();c.moveTo(cn.x,cn.y-10);c.lineTo(cn.x+8,cn.y+7);c.lineTo(cn.x-8,cn.y+7);c.closePath();c.fill();c.fillStyle="#fff";c.fillRect(cn.x-4,cn.y-1,8,2)});
    S.coinsL.forEach(function(k){coinIcon(c,k.x,k.y,8,t)});
    stepSparks(c,S.parts,1/60,0);
    c.save();c.translate(S.x,S.y);c.rotate(S.h);if(S.drifting){glow(c,sk.a,20)}c.fillStyle=sk.a;rr(c,-20,-11,40,22,7);c.fill();noGlow(c);
    c.fillStyle="rgba(8,8,18,.85)";rr(c,-2,-8,12,16,3);c.fill();c.fillStyle=sk.b;c.fillRect(-18,-3,10,6);c.fillStyle="#fff";c.fillRect(17,-9,3,5);c.fillRect(17,4,3,5);
    c.fillStyle="#ff2d3d";c.fillRect(-21,-9,3,5);c.fillRect(-21,4,3,5);c.restore();c.restore();
    // arrow to gate
    var ga=Math.atan2(g.y-S.y,g.x-S.x),gd=Math.hypot(g.y-S.y,g.x-S.x);if(gd>200){var ex=W/2+Math.cos(ga)*Math.min(gd,180),ey=H/2+Math.sin(ga)*Math.min(gd,180)*0.8;c.save();c.translate(ex,ey);c.rotate(ga);c.fillStyle=GOLD;c.globalAlpha=0.8;c.beginPath();c.moveTo(14,0);c.lineTo(-6,-9);c.lineTo(-6,9);c.closePath();c.fill();c.restore();c.globalAlpha=1}
    if(S.combo>5){label(c,"DRIFT "+(S.combo|0)+"  ×"+S.mult,W/2,H-40,22,S.mult>3?GOLD:CY)}
    if(S.time<4){c.fillStyle="rgba(255,61,94,"+(0.15+Math.sin(t*12)*0.1)+")";c.fillRect(0,0,W,H)}
    stepText(c,S.txt,1/60);vignette(c,0.5)};
  S.over=function(){return overObj("Time's up!",S.score+"",S.gates+" gates · "+S.coins+" coins.",S.score,S.coins)};
  S.preview=HG.livePreview(S,function(s){var a=Math.atan2(s.gate.y-s.y,s.gate.x-s.x),d=Math.atan2(Math.sin(a-s.h),Math.cos(a-s.h));s.dir=Math.abs(d)<0.15?0:(d<0?-1:1);s.time=Math.max(s.time,5)});
  return S;
};

/* ---------- 8. FLIPSIDE — gravity-flipping runner ---------- */
NEW.flip=function(){
  var S={},TOP=70,BOT=430,PX=190;
  S.title="Flipside";S.keys="Tap / <kbd>Space</kbd> to flip gravity (only when Vee touches a surface)";
  S.intro="Floor or ceiling, Vee runs on both. Flip gravity to dodge spikes and fill the gaps. The corridor speeds up every 12 seconds.";
  function add(){var x=S.nextX,r=Math.random(),lv=Math.min(1,S.t/70),side=Math.random()<0.5?"b":"t";
    if(r<0.35)S.obs.push({k:"spike",x:x,w:40*(1+((Math.random()*(2+lv*2))|0)),s:side});
    else if(r<0.6)S.obs.push({k:"gap",x:x,w:rand(100,150)+lv*80,s:side});
    else if(r<0.82)S.obs.push({k:"pillar",x:x,w:34,h:rand(110,190),s:side});
    else S.obs.push({k:"zap",x:x,w:16,y0:rand(150,350),amp:rand(60,110),ph:rand(0,6)});
    if(Math.random()<0.65){var cy=Math.random()<0.5?BOT-40:TOP+40;for(var i=0;i<4;i++)S.coinsL.push({x:x+160+i*34,y:cy,got:false})}
    var lw=S.obs[S.obs.length-1];S.nextX=x+(lw?lw.w:0)+S.v*0.55+rand(140,240)}
  S.reset=function(){S.g=1;S.y=BOT;S.vy=0;S.on=true;S.dist=0;S.v=330;S.t=0;S.obs=[];S.coinsL=[];S.nextX=1150;S.coins=0;S.parts=[];S.txt=[];S.lvl=1;S.flipT=0;for(var i=0;i<4;i++)add()};
  function floorAt(x,side){for(var i=0;i<S.obs.length;i++){var o=S.obs[i];if(o.k==="gap"&&o.s===side&&x>o.x+6&&x<o.x+o.w-6)return false}return true}
  S.action=function(){if(S.on){S.g*=-1;S.on=false;S.vy=S.g*120;S.flipT=0.25;snd("flip",S.g<0);sparks(S.parts,PX,S.y,skin().a,10,160)}};
  S.hud=function(){return hud2("flip",S.dist,S.coins,"m")};
  S.update=function(dt){S.t+=dt;S.v=Math.min(720,330+S.t*5.5);var lv=1+((S.t/12)|0);if(lv>S.lvl){S.lvl=lv;snd("level");floatText(S.txt,W/2,H/2,"FASTER",CY)}
    S.dist+=S.v*dt/30;var wx=S.dist*30;S.flipT=Math.max(0,S.flipT-dt);
    S.vy+=S.g*2200*dt;S.y+=S.vy*dt;var side=S.g>0?"b":"t";
    if(S.g>0&&S.y>=BOT&&floorAt(wx+PX,"b")&&S.y<BOT+24){S.y=BOT;S.vy=0;S.on=true}
    else if(S.g<0&&S.y<=TOP&&floorAt(wx+PX,"t")&&S.y>TOP-24){S.y=TOP;S.vy=0;S.on=true}
    else if((S.g>0&&S.y<BOT)||(S.g<0&&S.y>TOP))S.on=false;
    if(S.y>H+40||S.y<-40){snd("boom");buzz([60,40,90]);return "over"}
    while(S.nextX<wx+W+200)add();S.obs=S.obs.filter(function(o){return o.x+o.w>wx-200});S.coinsL=S.coinsL.filter(function(k){return k.x>wx-100});
    var top=S.g>0?S.y-52:S.y,bot=S.g>0?S.y:S.y+52;
    for(var i=0;i<S.obs.length;i++){var o=S.obs[i],ox=o.x-wx;if(PX+10<ox||PX-10>ox+o.w)continue;
      var hit=false;if(o.k==="spike")hit=o.s==="b"?bot>BOT-24:top<TOP+24;
      else if(o.k==="pillar")hit=o.s==="b"?bot>BOT-o.h:top<TOP+o.h;
      else if(o.k==="zap"){var zy=o.y0+Math.sin(S.t*3+o.ph)*o.amp;hit=bot>zy-40&&top<zy+40}
      if(hit){HG.boom(PX,(top+bot)/2,RED,14);sparks(S.parts,PX,(top+bot)/2,RED,30,260);snd("boom");buzz([60,40,90]);return "over"}}
    S.coinsL.forEach(function(k){if(!k.got&&Math.abs(k.x-wx-PX)<20&&k.y>top-10&&k.y<bot+10){k.got=true;S.coins++;snd("coin");sparks(S.parts,PX,k.y,GOLD,10,140)}})};
  S.draw=function(c){var sk=skin(),t=S.t,wx=S.dist*30;var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,"#120a1e");g.addColorStop(0.5,"#07070d");g.addColorStop(1,"#120a1e");c.fillStyle=g;c.fillRect(0,0,W,H);
    c.strokeStyle="rgba(166,107,255,.08)";for(var x=-(wx*0.4)%60;x<W;x+=60){c.beginPath();c.moveTo(x,TOP);c.lineTo(x+40,BOT);c.stroke()}
    ["t","b"].forEach(function(side){var y=side==="t"?TOP:BOT,dir=side==="t"?-1:1;var gaps=S.obs.filter(function(o){return o.k==="gap"&&o.s===side}).map(function(o){return[o.x-wx,o.x-wx+o.w]});
      var p=[[-50,W+50]];gaps.forEach(function(gp){var nx=[];p.forEach(function(q){if(gp[1]<=q[0]||gp[0]>=q[1]){nx.push(q);return}if(gp[0]>q[0])nx.push([q[0],gp[0]]);if(gp[1]<q[1])nx.push([gp[1],q[1]])});p=nx});
      p.forEach(function(q){c.fillStyle="#17112a";c.fillRect(q[0],side==="t"?0:y,q[1]-q[0],side==="t"?y:H-y);c.strokeStyle=sk.a;c.lineWidth=3;glow(c,sk.a,14);c.beginPath();c.moveTo(q[0],y);c.lineTo(q[1],y);c.stroke();noGlow(c)})});
    S.obs.forEach(function(o){var x=o.x-wx;
      if(o.k==="spike"){c.fillStyle=RED;glow(c,RED,10);for(var s=0;s<o.w;s+=40){c.beginPath();if(o.s==="b"){c.moveTo(x+s,BOT);c.lineTo(x+s+20,BOT-26);c.lineTo(x+s+40,BOT)}else{c.moveTo(x+s,TOP);c.lineTo(x+s+20,TOP+26);c.lineTo(x+s+40,TOP)}c.closePath();c.fill()}noGlow(c)}
      else if(o.k==="pillar"){c.fillStyle="#1d1533";c.strokeStyle=VI;c.lineWidth=2;glow(c,VI,10);var py=o.s==="b"?BOT-o.h:TOP;c.fillRect(x,py,o.w,o.h);c.strokeRect(x,py,o.w,o.h);noGlow(c)}
      else if(o.k==="zap"){var zy=o.y0+Math.sin(S.t*3+o.ph)*o.amp;c.strokeStyle=CY;c.lineWidth=3;glow(c,CY,16);c.beginPath();for(var k=0;k<=8;k++)c.lineTo(x+(k%2?-6:6)+8,zy-40+k*10);c.stroke();noGlow(c);
        c.fillStyle=CY;c.beginPath();c.arc(x+8,zy-44,5,0,Math.PI*2);c.arc(x+8,zy+44,5,0,Math.PI*2);c.fill()}});
    S.coinsL.forEach(function(k){if(!k.got)coinIcon(c,k.x-wx,k.y,9,t)});
    c.save();c.translate(PX,S.y);if(S.g<0)c.scale(1,-1);var sq=S.flipT>0?1+S.flipT:1;c.scale(1/sq,sq);
    stick(c,0,0,0.8,{t:t,run:S.on,color:TXT,tie:false,arm:S.on?null:"up"});c.fillStyle=sk.a;c.fillRect(-8,-55,16,4);
    c.beginPath();c.moveTo(-5,-44);c.lineTo(5,-44);c.lineTo(-20-Math.sin(t*22)*4,-38);c.closePath();c.fill();c.restore();
    if(S.on&&Math.random()<0.5)S.parts.push({x:PX-6,y:S.y,vx:rand(-120,-60),vy:S.g*-rand(10,40),l:0.3,col:sk.a});
    stepSparks(c,S.parts,1/60,0);stepText(c,S.txt,1/60);vignette(c,0.45)};
  S.over=function(){return overObj("Flipped out!",(S.dist|0)+" m","Speed level "+S.lvl+" · "+S.coins+" coins.",S.dist,S.coins)};
  S.preview=HG.livePreview(S,function(s){if(!s.on)return;var wx=s.dist*30,side=s.g>0?"b":"t";for(var i=0;i<s.obs.length;i++){var o=s.obs[i],d=o.x-wx-PX;var lead=o.k==="pillar"?s.v*0.48:o.k==="gap"?s.v*0.2:s.v*0.3;if(d>-10&&d<lead){
    if((o.k==="spike"||o.k==="gap"||o.k==="pillar")&&o.s===side){s.action();break}if(o.k==="zap"){var zy=o.y0+Math.sin(s.t*3+o.ph)*o.amp;if((side==="b"&&zy>H/2)||(side==="t"&&zy<H/2)){s.action();break}}}}});
  return S;
};

/* ---------- Vansh: the VarHireBlaze character (cartoon, drawn in code) ----------
   Swept-back black hair, black sunglasses, light stubble, grey knit sweater, chain. */
var SKIN="#f3dcc4",SKIN2="#e2bfa0",HAIR="#5b3a24",SWEAT="#5f5a57",SWEAT2="#4a4643";
function varHead(c,x,y,r,mood,t){ // centre of head
  c.save();c.translate(x,y);
  c.fillStyle=SKIN2;c.beginPath();c.ellipse(-r*0.98,r*0.08,r*0.16,r*0.24,0,0,7);c.fill();c.beginPath();c.ellipse(r*0.98,r*0.08,r*0.16,r*0.24,0,0,7);c.fill();
  c.fillStyle=SKIN;c.beginPath();c.moveTo(-r*0.92,-r*0.2);c.quadraticCurveTo(-r*0.95,r*0.75,0,r*1.05);c.quadraticCurveTo(r*0.95,r*0.75,r*0.92,-r*0.2);c.quadraticCurveTo(0,-r*1.05,-r*0.92,-r*0.2);c.fill();
  // stubble
  c.fillStyle="rgba(91,58,36,.22)";c.beginPath();c.moveTo(-r*0.7,r*0.35);c.quadraticCurveTo(0,r*1.25,r*0.7,r*0.35);c.quadraticCurveTo(0,r*0.8,-r*0.7,r*0.35);c.fill();
  // hair: swept back with volume
  c.fillStyle=HAIR;c.beginPath();c.moveTo(-r*0.98,-r*0.05);c.quadraticCurveTo(-r*1.15,-r*1.05,-r*0.35,-r*1.38);c.quadraticCurveTo(r*0.6,-r*1.62,r*1.12,-r*0.9);c.quadraticCurveTo(r*1.15,-r*0.35,r*0.95,-r*0.05);
  c.quadraticCurveTo(r*0.75,-r*0.55,r*0.15,-r*0.62);c.quadraticCurveTo(-r*0.55,-r*0.6,-r*0.98,-r*0.05);c.fill();
  c.strokeStyle="rgba(255,255,255,.12)";c.lineWidth=Math.max(1,r*0.05);c.beginPath();c.moveTo(-r*0.5,-r*0.95);c.quadraticCurveTo(r*0.2,-r*1.2,r*0.8,-r*0.85);c.stroke();
  // sunglasses
  c.fillStyle="#0b0b0e";var gy=-r*0.12;
  c.beginPath();c.moveTo(-r*0.9,gy-r*0.18);c.lineTo(-r*0.08,gy-r*0.2);c.lineTo(-r*0.12,gy+r*0.22);c.quadraticCurveTo(-r*0.5,gy+r*0.32,-r*0.82,gy+r*0.18);c.closePath();c.fill();
  c.beginPath();c.moveTo(r*0.9,gy-r*0.18);c.lineTo(r*0.08,gy-r*0.2);c.lineTo(r*0.12,gy+r*0.22);c.quadraticCurveTo(r*0.5,gy+r*0.32,r*0.82,gy+r*0.18);c.closePath();c.fill();
  c.fillRect(-r*0.1,gy-r*0.16,r*0.2,r*0.07);
  c.fillStyle="rgba(255,255,255,.22)";c.fillRect(-r*0.72,gy-r*0.1,r*0.22,r*0.05);c.fillRect(r*0.28,gy-r*0.1,r*0.22,r*0.05);
  // mouth
  c.strokeStyle="#a0523e";c.lineWidth=Math.max(1.2,r*0.07);c.lineCap="round";c.beginPath();
  if(mood==="happy"){c.arc(0,r*0.5,r*0.25,0.2,Math.PI-0.2)}else if(mood==="angry"){c.moveTo(-r*0.25,r*0.65);c.quadraticCurveTo(0,r*0.45,r*0.25,r*0.65)}else if(mood==="o"){c.arc(0,r*0.6,r*0.12,0,7)}else{c.moveTo(-r*0.2,r*0.58);c.quadraticCurveTo(0,r*0.64,r*0.22,r*0.55)}c.stroke();
  if(mood==="angry"){c.fillStyle="rgba(255,60,60,.28)";c.beginPath();c.ellipse(-r*0.55,r*0.32,r*0.22,r*0.12,0,0,7);c.fill();c.beginPath();c.ellipse(r*0.55,r*0.32,r*0.22,r*0.12,0,0,7);c.fill();c.strokeStyle=HAIR;c.lineWidth=r*0.1;c.beginPath();c.moveTo(-r*0.75,-r*0.42);c.lineTo(-r*0.15,-r*0.3);c.moveTo(r*0.75,-r*0.42);c.lineTo(r*0.15,-r*0.3);c.stroke()}
  c.restore()}
function varBody(c,x,y,s,pose,t,mood){ // x,y = feet centre (or seat for sit); s = scale (1 ≈ 130px tall standing)
  c.save();c.translate(x,y);c.scale(s,s);c.lineCap="round";c.lineJoin="round";
  if(pose==="sit"){ // seated, front view, from waist up visible behind desk
    c.fillStyle=SWEAT;c.beginPath();c.moveTo(-34,0);c.quadraticCurveTo(-38,-58,-20,-66);c.lineTo(20,-66);c.quadraticCurveTo(38,-58,34,0);c.closePath();c.fill();
    c.strokeStyle=SWEAT2;c.lineWidth=2;for(var k=-24;k<=24;k+=8){c.beginPath();c.moveTo(k,-60);c.lineTo(k*1.1,-4);c.stroke()}
    c.strokeStyle="#d8c9a0";c.lineWidth=1.6;c.beginPath();c.moveTo(-9,-66);c.quadraticCurveTo(0,-48,9,-66);c.stroke();
    c.strokeStyle="#e9e9ee";c.lineWidth=1.4;c.beginPath();c.moveTo(-5,-64);c.bezierCurveTo(-12,-40,-14,-20,-20,0);c.stroke(); // earphone wire
    c.fillStyle=SKIN;c.fillRect(-7,-74,14,10);
    varHead(c,0,-96,24,mood,t)}
  else if(pose==="wave"){var wv=Math.sin(t*9)*0.45;
    c.strokeStyle="#2a2a34";c.lineWidth=9;c.beginPath();c.moveTo(0,-44);c.lineTo(-9,0);c.moveTo(0,-44);c.lineTo(9,0);c.stroke();
    c.fillStyle="#f4f4f6";c.fillRect(-17,-6,16,7);c.fillRect(4,-6,16,7);
    c.fillStyle=SWEAT;c.beginPath();c.moveTo(-15,-42);c.quadraticCurveTo(-18,-88,-6,-92);c.lineTo(8,-92);c.quadraticCurveTo(19,-86,15,-42);c.closePath();c.fill();
    c.strokeStyle=SWEAT;c.lineWidth=8;c.beginPath();c.moveTo(-8,-84);c.lineTo(-16,-62);c.lineTo(-12,-46);c.stroke();
    c.beginPath();c.moveTo(8,-84);c.lineTo(26,-96);c.lineTo(28+Math.sin(wv)*14,-118-Math.cos(wv)*4);c.stroke();
    c.fillStyle=SKIN;c.beginPath();c.arc(28+Math.sin(wv)*16,-122-Math.cos(wv)*4,6,0,7);c.fill();
    c.strokeStyle="#d8c9a0";c.lineWidth=1.6;c.beginPath();c.moveTo(-6,-92);c.quadraticCurveTo(1,-80,8,-92);c.stroke();
    c.fillStyle=SKIN;c.fillRect(-5,-100,10,10);varHead(c,1,-116,18,mood||"happy",t)}
  else{ // standing / running side-ish
    var run=pose==="run",ph=t*14,leg=run?Math.sin(ph)*0.7:0,arm=run?Math.sin(ph)*0.8:0;
    c.strokeStyle="#2a2a34";c.lineWidth=9;
    c.beginPath();c.moveTo(0,-44);c.lineTo(Math.sin(leg)*26,-44+Math.cos(leg)*24);c.lineTo(Math.sin(leg)*26+(run?Math.max(0,-Math.sin(ph))*-10:0),0);c.stroke();
    c.beginPath();c.moveTo(0,-44);c.lineTo(-Math.sin(leg)*26,-44+Math.cos(leg)*24);c.lineTo(-Math.sin(leg)*26+(run?Math.max(0,Math.sin(ph))*-10:0),0);c.stroke();
    c.fillStyle="#f4f4f6";c.fillRect(Math.sin(leg)*26-6,-6,16,7);c.fillRect(-Math.sin(leg)*26-6,-6,16,7);
    c.fillStyle=SWEAT;c.beginPath();c.moveTo(-15,-42);c.quadraticCurveTo(-18,-88,-6,-92);c.lineTo(8,-92);c.quadraticCurveTo(19,-86,15,-42);c.closePath();c.fill();
    c.strokeStyle=SWEAT;c.lineWidth=8;c.beginPath();c.moveTo(0,-84);c.lineTo(Math.sin(-arm)*22,-84+Math.cos(arm)*20);c.lineTo(Math.sin(-arm)*22+12,-66+Math.cos(arm)*6);c.stroke();
    c.strokeStyle=SKIN;c.lineWidth=7;c.beginPath();c.moveTo(Math.sin(-arm)*22+12,-66+Math.cos(arm)*6);c.lineTo(Math.sin(-arm)*22+16,-64+Math.cos(arm)*6);c.stroke();
    c.fillStyle=SKIN;c.fillRect(-5,-100,10,10);varHead(c,2,-116,18,mood||"",t)}
  c.restore()}

/* ================= OFFICE LIFE SERIES ================= */
function officeWall(c,col1,col2){var g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,col1);g.addColorStop(1,col2);c.fillStyle=g;c.fillRect(0,0,W,H)}

/* ---------- 9. BOSS ALERT — slack off, but switch to work before the boss looks ---------- */
NEW.boss=function(){
  var S={};
  S.title="Boss Alert";S.keys="Hold <kbd>Space</kbd> / hold the screen to chill on your phone · let go to look busy";
  S.intro="Vansh wants a break. Hold to scroll memes and earn chill points. Watch the glass door: when a shadow shows up, let go and look busy before the boss peeks in. 3 strikes and you're in a meeting.";
  S.reset=function(){S.t=0;S.slack=false;S.score=0;S.coins=0;S.strikes=0;S.combo=0;S.ev=null;S.next=2.5;S.parts=[];S.txt=[];S.lvl=1;S.anim=0;S.caught=0};
  S.press=function(on){S.slack=on};S.action=function(){};
  S.hud=function(){return["<b>"+(S.score|0)+"</b> chill · "+"❌".repeat(S.strikes)+"⬜".repeat(Math.max(0,3-S.strikes))+" · 🪙 <b>"+S.coins+"</b>","Best <b>"+best("boss",S.score)+"</b>"]};
  function newEvent(){var lv=Math.min(1,S.t/90),r=Math.random(),kind=r<0.6?"boss":r<0.8?"coworker":"cleaner";
    S.ev={k:kind,warn:kind==="boss"?Math.max(0.42,1.25-lv*0.8)*rand(0.85,1.15):rand(0.8,1.3),look:rand(1.2,2.2),t:0,phase:"warn"};S.next=rand(1.6,3.6)-lv*0.9}
  S.update=function(dt){S.t+=dt;S.anim+=dt;S.caught=Math.max(0,S.caught-dt);var lv=1+((S.t/25)|0);if(lv>S.lvl){S.lvl=lv;snd("level");floatText(S.txt,W/2,90,"BOSS IS ON TO YOU",RED)}
    if(S.slack){S.combo+=dt;S.score+=dt*(10+Math.min(40,S.combo*6));if(Math.random()<dt*0.5){S.coins++;snd("coin");floatText(S.txt,330,250,"+1",GOLD)}}else S.combo=0;
    if(!S.ev){S.next-=dt;if(S.next<=0)newEvent()}else{var e=S.ev;e.t+=dt;
      if(e.phase==="warn"&&e.t>=e.warn){e.phase="look";e.t=0;if(e.k==="boss")snd("hurt")}
      else if(e.phase==="look"){if(e.k==="boss"&&S.slack&&!e.got){e.got=true;S.strikes++;S.caught=1.2;S.combo=0;buzz([80,60,80]);snd("boom");HG.boom(W/2,260,RED,16);floatText(S.txt,W/2,160,"CAUGHT!",RED);if(S.strikes>=3)return "over"}
        if(e.k==="boss"&&!S.slack&&!e.ok&&e.t>0.3){e.ok=true;S.score+=25;floatText(S.txt,W/2,160,"Nice save +25",GRN);snd("gate")}
        if(e.t>=e.look){S.ev=null}}}};
  S.draw=function(c){var sk=skin(),t=S.anim;officeWall(c,"#1b1e2a","#0f1118");
    // window with city
    c.fillStyle="#0b1430";rr(c,60,50,300,190,10);c.fill();for(var i=0;i<9;i++){var bh=40+((i*37)%90);c.fillStyle="#141c3a";c.fillRect(70+i*32,240-bh,26,bh);c.fillStyle="rgba(255,210,63,.4)";for(var w=0;w<3;w++)if((i+w)%2)c.fillRect(76+i*32,250-bh+w*16,6,6)}
    c.strokeStyle="#2c3142";c.lineWidth=6;rr(c,60,50,300,190,10);c.stroke();c.beginPath();c.moveTo(210,50);c.lineTo(210,240);c.stroke();
    // glass door on the right
    var dx=560,dy=40;c.fillStyle="#2a3044";c.fillRect(dx-12,dy-10,224,330);c.fillStyle="rgba(140,190,255,.12)";c.fillRect(dx,dy,200,310);
    c.strokeStyle="rgba(255,255,255,.12)";c.lineWidth=2;c.beginPath();c.moveTo(dx+30,dy+20);c.lineTo(dx+70,dy+120);c.stroke();
    var e=S.ev;if(e){var k=e.phase==="warn"?e.t/e.warn:1,a=e.phase==="warn"?0.25+0.5*k:1;c.save();c.beginPath();c.rect(dx,dy,200,310);c.clip();
      var px=dx+(e.phase==="warn"?(e.k==="boss"?-40+k*140:-40+k*240):100);
      c.globalAlpha=e.phase==="warn"?a*0.7:1;
      if(e.k==="boss"){c.fillStyle=e.phase==="look"?"#151821":"#0a0b10";rr(c,px-34,dy+90,68,230,20);c.fill();c.beginPath();c.arc(px,dy+70,28,0,7);c.fill();
        if(e.phase==="look"){c.fillStyle="#d9a77f";c.beginPath();c.arc(px,dy+72,24,0,7);c.fill();c.fillStyle="#cfd2da";c.fillRect(px-26,dy+44,52,12);c.fillStyle="#111";c.fillRect(px-14,dy+68,8,4);c.fillRect(px+6,dy+68,8,4);c.fillStyle="#7a1f1f";c.fillRect(px-4,dy+110,8,60);
          c.fillStyle="#2a2d3a";rr(c,px-34,dy+100,68,220,18);c.fill();c.fillStyle="#b31f2e";c.beginPath();c.moveTo(px,dy+104);c.lineTo(px+7,dy+150);c.lineTo(px,dy+160);c.lineTo(px-7,dy+150);c.fill()}}
      else{c.fillStyle=e.k==="cleaner"?"rgba(40,120,90,.8)":"rgba(70,70,110,.8)";rr(c,px-26,dy+120,52,200,18);c.fill();c.beginPath();c.arc(px,dy+100,22,0,7);c.fill();if(e.k==="cleaner"){c.strokeStyle="#c8a24a";c.lineWidth=5;c.beginPath();c.moveTo(px+30,dy+130);c.lineTo(px+50,dy+300);c.stroke()}}
      c.restore();if(e.phase==="warn"&&e.k==="boss"){c.fillStyle="rgba(255,77,94,"+(0.4+0.4*Math.sin(t*30))+")";label(c,"!",dx+100,dy-18,30,RED)}}
    c.strokeStyle="#3a4058";c.lineWidth=8;c.strokeRect(dx,dy,200,310);c.fillStyle="#c9a24a";c.fillRect(dx+16,dy+150,8,40);
    label(c,"BOSS",dx+100,dy+20,12,"rgba(255,255,255,.35)");
    // Var at desk
    var slack=S.slack;c.save();if(slack){c.translate(300,0);c.rotate(-0.06);c.translate(-300,0)}varBody(c,300,392,1.35,"sit",t,S.caught>0?"angry":slack?"happy":"");c.restore();
    // phone or laptop
    if(slack){c.save();c.translate(330,330);c.rotate(-0.25);c.fillStyle="#111";rr(c,-22,-38,44,76,8);c.fill();c.fillStyle=sk.a;rr(c,-18,-32,36,64,5);c.fill();
      c.fillStyle="#fff";label(c,"😂",0,-6,18,"#fff");c.restore()}
    // desk
    c.fillStyle="#3b2a20";c.fillRect(0,390,W,110);c.fillStyle="#4c3628";c.fillRect(0,380,W,16);
    // laptop (lid back) — open when working
    c.save();c.translate(270,380);var open=slack?0.25:1;c.fillStyle="#2b2b31";rr(c,-90,-110*open,180,110*open,8);c.fill();c.fillStyle=sk.a;label(c,"VB",0,-55*open,Math.max(6,22*open),sk.a);c.restore();
    if(!slack){c.fillStyle="#d9d9e0";c.fillRect(190,382,160,8)}
    // coffee + plant
    c.fillStyle="#f4f4f6";rr(c,430,342,34,40,6);c.fill();c.strokeStyle="#f4f4f6";c.lineWidth=5;c.beginPath();c.arc(468,360,9,-1.2,1.2);c.stroke();c.fillStyle="#6b3e1f";c.fillRect(434,346,26,6);
    c.fillStyle="#2bd46b";for(var l=0;l<5;l++){c.beginPath();c.ellipse(120+l*8-16,350-l*6,8,18,-0.6+l*0.3,0,7);c.fill()}c.fillStyle="#c25b2a";rr(c,98,354,44,30,6);c.fill();
    // chill meter
    c.fillStyle="rgba(0,0,0,.45)";rr(c,20,450,260,26,13);c.fill();c.fillStyle=slack?GRN:"#555a6a";rr(c,22,452,Math.min(256,20+S.combo*40),22,11);c.fill();label(c,slack?"CHILLING x"+(1+Math.min(4,(S.combo*0.6)|0)):"LOOKING BUSY",150,464,12,"#fff");
    if(S.caught>0){c.fillStyle="rgba(255,61,94,"+(S.caught*0.3)+")";c.fillRect(0,0,W,H)}
    stepText(c,S.txt,1/60)};
  S.over=function(){return overObj("Called into a meeting!",(S.score|0)+"","You chilled for "+(S.t|0)+"s before the boss caught you 3 times.",S.score,S.coins)};
  S.preview=HG.livePreview(S,function(s){var e=s.ev;s.slack=!(e&&e.k==="boss"&&(e.phase==="look"||e.t>e.warn*0.4))});
  return S;
};

/* ---------- 10. JAM SESSION — beat the morning traffic jam ---------- */
NEW.jam=function(){
  var S={},LN=4,LW=120,X0=(W-LN*LW)/2,PY=380,CL=70;
  S.title="Jam Session";S.keys="Change lane: <kbd>←</kbd> <kbd>→</kbd> · Touch: tap left or right side";
  S.intro="Morning rush, every lane stops and starts. Hop into whichever lane is moving, but only where there's a gap. If Vansh's frustration meter fills up, the day's over.";
  function flow(l){var b=S.base,ph=S.ph[l];var v=b*(0.55+0.45*Math.sin(S.t*S.fq[l]+ph));if(Math.sin(S.t*S.fq[l]*0.37+ph*2)>0.72)v*=0.08;return Math.max(0,v)}
  S.reset=function(){S.t=0;S.base=150;S.lane=1;S.px=X0+LW*1.5;S.dist=0;S.fr=0;S.coins=0;S.parts=[];S.txt=[];S.honk=0;S.ph=[];S.fq=[];S.cars=[];S.pos=0;S.coinsL=[];
    for(var l=0;l<LN;l++){S.ph.push(rand(0,6));S.fq.push(rand(0.25,0.6));S.cars.push([]);for(var k=0;k<14;k++)S.cars[l].push({y:k*rand(95,150)-600,col:["#3de8ff","#a66bff","#f4f4f6","#2bd46b","#ffd23f","#ff3d5e","#8a8f9c"][(Math.random()*7)|0]})}
    S.cars[1]=S.cars[1].filter(function(cr){return Math.abs(cr.y-0)>130})};
  function blocked(l){for(var i=0;i<S.cars[l].length;i++){var y=S.cars[l][i].y-S.pos;if(Math.abs(y)<CL+6)return true}return false}
  function move(d){var nl=S.lane+d;if(nl<0||nl>=LN)return;if(blocked(nl)){S.fr=Math.min(100,S.fr+8);snd("hit");floatText(S.txt,S.px,PY-60,"NO GAP!",RED);buzz(30);return}S.lane=nl;snd("near")}
  S.key=function(k){if(k==="ArrowLeft"||k==="a"||k==="A"){move(-1);return true}if(k==="ArrowRight"||k==="d"||k==="D"){move(1);return true}return false};
  S.tapXY=function(x){move(x<W/2?-1:1)};S.action=function(){S.honk=0.3;snd("zap")};
  S.hud=function(){return["<b>"+(S.dist|0)+"</b> m · 😤 <b>"+(S.fr|0)+"%</b> · 🪙 <b>"+S.coins+"</b>","Best <b>"+best("jam",S.dist)+"</b>"]};
  S.update=function(dt){S.t+=dt;S.base=Math.min(330,150+S.t*2.2);S.honk=Math.max(0,S.honk-dt);
    var lf=[];for(var l=0;l<LN;l++)lf.push(flow(l));
    // each lane's queue moves at its own flow; player moves with own lane, limited by the car ahead
    for(l=0;l<LN;l++)S.cars[l].forEach(function(cr){cr.y-=lf[l]*dt});
    var my=lf[S.lane],ahead=null;S.cars[S.lane].forEach(function(cr){var y=cr.y-S.pos;if(y<0&&(ahead===null||y>ahead))ahead=y});
    var gap=ahead===null?999:-ahead-CL-14;var v=gap<0?0:my;
    S.pos-=v*dt;S.dist+=v*dt/10;S.v=v;
    // recycle cars
    for(l=0;l<LN;l++)S.cars[l].forEach(function(cr){var y=cr.y-S.pos;if(y>H+200){var top=Math.min.apply(null,S.cars[l].map(function(o){return o.y}));cr.y=top-rand(100,180)}});
    var slow=v<S.base*0.25;S.fr=clamp(S.fr+(slow?dt*(9+S.t*0.06):-dt*12),0,100);
    if(Math.random()<dt*0.9){var cl=(Math.random()*LN)|0;S.coinsL.push({l:cl,y:S.pos-rand(500,800),got:false})}
    S.coinsL.forEach(function(k){if(!k.got&&k.l===S.lane&&Math.abs(k.y-S.pos)<40){k.got=true;S.coins++;snd("coin");floatText(S.txt,S.px,PY-50,"+1",GOLD)}});S.coinsL=S.coinsL.filter(function(k){return!k.got&&k.y-S.pos<H})
    S.px=lerp(S.px,X0+LW*(S.lane+0.5),Math.min(1,dt*12));
    if(S.fr>=100){snd("lose");return "over"}};
  function car(c,x,y,col,brake,me){c.save();c.translate(x,y);c.fillStyle="rgba(0,0,0,.35)";rr(c,-30,-34,64,76,12);c.fill();c.fillStyle=col;rr(c,-32,-38,64,76,14);c.fill();
    c.fillStyle="rgba(10,12,20,.85)";rr(c,-24,-26,48,18,6);c.fill();rr(c,-24,14,48,14,5);c.fill();c.fillStyle="rgba(255,255,255,.18)";rr(c,-20,-6,40,18,6);c.fill();
    c.fillStyle=brake?"#ff2d3d":"#5a1a20";if(brake){c.shadowColor="#ff2d3d";c.shadowBlur=14}c.fillRect(-28,34,14,5);c.fillRect(14,34,14,5);c.shadowBlur=0;c.fillStyle="#fff7d0";c.fillRect(-26,-40,12,4);c.fillRect(14,-40,12,4);
    if(me){c.fillStyle=HAIR;c.beginPath();c.arc(0,4,11,0,7);c.fill();c.fillStyle="#0b0b0e";c.fillRect(-9,-4,18,4)}c.restore()}
  S.draw=function(c){var sk=skin(),t=S.t;c.fillStyle="#1d2a1a";c.fillRect(0,0,W,H);c.fillStyle="#2a2b31";c.fillRect(X0-20,0,LN*LW+40,H);
    // buildings sidewalk
    c.fillStyle="#3a3b44";c.fillRect(X0-40,0,20,H);c.fillRect(X0+LN*LW+20,0,20,H);
    for(var i=-1;i<8;i++){var yy=((i*90-S.pos)%90+90)%90+i*0;}
    c.strokeStyle="rgba(255,255,255,.5)";c.lineWidth=4;c.setLineDash([30,30]);c.lineDashOffset=S.pos%60;for(var l=1;l<LN;l++){c.beginPath();c.moveTo(X0+l*LW,0);c.lineTo(X0+l*LW,H);c.stroke()}c.setLineDash([]);
    c.fillStyle="#f4f4f6";c.fillRect(X0-20,0,4,H);c.fillRect(X0+LN*LW+16,0,4,H);
    var lf=[];for(l=0;l<LN;l++)lf.push(flow(l));
    S.coinsL.forEach(function(k){var y=PY+(k.y-S.pos);if(y>-20&&y<H+20)coinIcon(c,X0+LW*(k.l+0.5),y,10,t)});
    for(l=0;l<LN;l++)S.cars[l].forEach(function(cr){var y=PY+(cr.y-S.pos);if(y>-60&&y<H+60)car(c,X0+LW*(l+0.5),y,cr.col,lf[l]<S.base*0.3,false)});
    car(c,S.px,PY,sk.a,S.v<S.base*0.3,true);
    if(S.honk>0){c.strokeStyle="rgba(255,255,255,.6)";c.lineWidth=3;for(var h=0;h<3;h++){c.beginPath();c.arc(S.px,PY-50,10+h*10+S.honk*40,Math.PI*1.2,Math.PI*1.8);c.stroke()}}
    // lane speed arrows
    for(l=0;l<LN;l++){var sp=lf[l]/S.base;label(c,sp<0.15?"■":sp>0.7?"▲▲":"▲",X0+LW*(l+0.5),H-14,14,sp<0.15?RED:sp>0.7?GRN:GOLD)}
    // frustration meter with Var's face
    c.fillStyle="rgba(0,0,0,.55)";rr(c,14,14,170,72,14);c.fill();varHead(c,52,52,24,S.fr>70?"angry":S.fr>35?"":"happy",t);
    c.fillStyle="#333";rr(c,86,44,86,14,7);c.fill();c.fillStyle=S.fr>70?RED:S.fr>35?GOLD:GRN;rr(c,86,44,86*S.fr/100,14,7);c.fill();label(c,"FRUSTRATION",129,30,10,MUT);
    var clock=8*60+20+(S.dist/40|0),hh=(clock/60|0)%24,mm=clock%60;label(c,(hh>12?hh-12:hh)+":"+("0"+mm).slice(-2)+" AM",W-80,30,18,TXT);
    stepText(c,S.txt,1/60)};
  S.over=function(){return overObj("Road rage!",(S.dist|0)+" m","Vansh gave up on the jam. "+S.coins+" coins collected.",S.dist,S.coins)};
  S.preview=HG.livePreview(S,function(s){if(Math.random()<0.04){var lf=[];for(var l=0;l<4;l++)lf.push(flow(l));var bestL=s.lane;for(l=Math.max(0,s.lane-1);l<=Math.min(3,s.lane+1);l++)if(lf[l]>lf[bestL]*1.3&&!blocked(l))bestL=l;if(bestL!==s.lane)move(bestL>s.lane?1:-1)}s.fr=Math.min(s.fr,60)});
  return S;
};

/* ---------- 11. HOME OFFICE HUSTLE — keep everything going while working from home ---------- */
NEW.wfh=function(){
  var S={};
  S.title="Home Office Hustle";S.keys="Tap a thing when its bar runs low · Keys <kbd>1</kbd>–<kbd>5</kbd>";
  S.intro="Working from home is five jobs at once. Keep the meeting alive, the coffee topped up, the plant watered, the cat off the keyboard and the delivery collected. Let one hit zero and it's a strike.";
  var ST=[{k:"call",n:"Meeting",x:480,y:225,w:150,h:110,rate:7,ic:"💻"},{k:"coffee",n:"Coffee",x:625,y:330,w:80,h:80,rate:9,ic:"☕"},{k:"plant",n:"Plant",x:85,y:220,w:80,h:110,rate:5,ic:"🪴"},{k:"cat",n:"Cat",x:250,y:340,w:110,h:70,rate:11,ic:"🐈"},{k:"door",n:"Delivery",x:700,y:140,w:90,h:240,rate:6,ic:"📦"}];
  S.reset=function(){S.t=0;S.score=0;S.coins=0;S.strikes=0;S.m=ST.map(function(){return 100});S.cd=ST.map(function(){return 0});S.parts=[];S.txt=[];S.flash=ST.map(function(){return 0});S.lvl=1};
  function hit(i){if(i<0||i>=ST.length)return;if(S.m[i]>92){S.score=Math.max(0,S.score-5);floatText(S.txt,ST[i].x,ST[i].y-40,"Already fine",MUT);return}
    var gain=100-S.m[i];S.m[i]=100;S.flash[i]=0.4;S.score+=Math.round(5+gain*0.3);snd(ST[i].k==="coffee"?"coin":ST[i].k==="door"?"gate":"grab");sparks(S.parts,ST[i].x,ST[i].y,GOLD,10,140);
    if(gain>75){S.coins++;floatText(S.txt,ST[i].x,ST[i].y-50,"CLUTCH! +1🪙",GOLD)}}
  S.tapXY=function(x,y){var bi=-1,bd=1e9;ST.forEach(function(s,i){var d=Math.hypot(x-s.x,y-s.y);if(d<bd&&d<130){bd=d;bi=i}});hit(bi)};S.action=function(){};
  S.key=function(k){var n=parseInt(k,10);if(n>=1&&n<=5){hit(n-1);return true}return false};
  S.hud=function(){return["<b>"+(S.score|0)+"</b> pts · "+"❌".repeat(S.strikes)+"⬜".repeat(Math.max(0,3-S.strikes))+" · 🪙 <b>"+S.coins+"</b>","Best <b>"+best("wfh",S.score)+"</b>"]};
  S.update=function(dt){S.t+=dt;var k=1+S.t*0.022;var lv=1+((S.t/20)|0);if(lv>S.lvl){S.lvl=lv;snd("level");floatText(S.txt,W/2,60,"BUSIER DAY",CY)}
    for(var i=0;i<ST.length;i++){S.flash[i]=Math.max(0,S.flash[i]-dt);S.m[i]-=ST[i].rate*k*dt*(0.7+0.6*Math.abs(Math.sin(S.t*0.3+i)));
      if(S.m[i]<=0){S.strikes++;S.m[i]=70;snd("hurt");buzz([60,40,60]);HG.boom(ST[i].x,ST[i].y,RED,12);floatText(S.txt,ST[i].x,ST[i].y-50,ST[i].n.toUpperCase()+" FAILED",RED);if(S.strikes>=3)return "over"}}
    S.score+=dt*2};
  S.draw=function(c){var sk=skin(),t=S.t;officeWall(c,"#2a2233","#17131d");
    c.fillStyle="#3b3046";c.fillRect(0,390,W,110);
    // window
    c.fillStyle="#8fd0ff";rr(c,180,40,200,110,8);c.fill();c.fillStyle="#ffd9a0";c.beginPath();c.arc(330,70,18,0,7);c.fill();c.strokeStyle="#4a3d58";c.lineWidth=6;rr(c,180,40,200,110,8);c.stroke();
    // desk
    c.fillStyle="#6b4a34";c.fillRect(150,300,420,16);c.fillStyle="#523726";c.fillRect(170,316,14,90);c.fillRect(536,316,14,90);
    varBody(c,330,302,1.15,"sit",t,S.strikes>=2?"angry":"");
    ST.forEach(function(s,i){var m=S.m[i],low=m<30,pulse=low?0.5+0.5*Math.sin(t*14):0;
      c.save();if(low){c.shadowColor=RED;c.shadowBlur=20*pulse}
      if(s.k==="call"){c.fillStyle="#26262e";rr(c,s.x-75,s.y-55,150,100,8);c.fill();c.fillStyle=m>30?"#14324a":"#2a0f14";rr(c,s.x-68,s.y-48,136,86,5);c.fill();
        for(var g=0;g<4;g++){c.fillStyle=["#3de8ff","#a66bff","#2bd46b",sk.a][g];c.globalAlpha=m>15?0.8:0.25;rr(c,s.x-62+(g%2)*66,s.y-42+((g/2)|0)*40,60,36,4);c.fill()}c.globalAlpha=1;
        c.fillStyle="#bbb";c.fillRect(s.x-10,s.y+45,20,12);label(c,m<30?"You're on mute!":"Weekly sync",s.x,s.y+72,11,m<30?RED:MUT)}
      else if(s.k==="coffee"){c.fillStyle="#f4f4f6";rr(c,s.x-22,s.y-24,44,50,8);c.fill();c.strokeStyle="#f4f4f6";c.lineWidth=6;c.beginPath();c.arc(s.x+26,s.y,10,-1.2,1.2);c.stroke();c.fillStyle="#6b3e1f";c.fillRect(s.x-18,s.y-20+40*(1-m/100),36,Math.max(0,40*m/100));
        if(m>50){c.strokeStyle="rgba(255,255,255,.4)";c.lineWidth=2;for(var st=0;st<2;st++){c.beginPath();c.moveTo(s.x-6+st*12,s.y-30);c.quadraticCurveTo(s.x+4+st*12,s.y-42,s.x-6+st*12,s.y-56);c.stroke()}}}
      else if(s.k==="plant"){c.fillStyle="#c25b2a";rr(c,s.x-26,s.y+10,52,44,8);c.fill();var droop=1-m/100;c.fillStyle=m>30?"#2bd46b":"#8a8a3a";for(var lf=0;lf<6;lf++){c.save();c.translate(s.x,s.y+12);c.rotate(-1+lf*0.4+droop*(lf<3?-0.6:0.6));c.beginPath();c.ellipse(0,-30,9,28,0,0,7);c.fill();c.restore()}}
      else if(s.k==="cat"){var onKb=m<50;c.fillStyle="#d0d0d6";c.fillRect(s.x-55,s.y+20,110,10);c.fillStyle="#2f2f36";var cx2=onKb?s.x:s.x+70;c.beginPath();c.ellipse(cx2,s.y+8,36,20,0,0,7);c.fill();c.beginPath();c.arc(cx2+30,s.y-6,14,0,7);c.fill();
        c.beginPath();c.moveTo(cx2+20,s.y-16);c.lineTo(cx2+24,s.y-30);c.lineTo(cx2+30,s.y-18);c.moveTo(cx2+32,s.y-18);c.lineTo(cx2+40,s.y-30);c.lineTo(cx2+42,s.y-14);c.fill();
        c.strokeStyle="#2f2f36";c.lineWidth=6;c.beginPath();c.moveTo(cx2-34,s.y+6);c.quadraticCurveTo(cx2-60,s.y-20+Math.sin(t*4)*8,cx2-48,s.y-30);c.stroke();c.fillStyle=GOLD;c.fillRect(cx2+24,s.y-8,4,3);c.fillRect(cx2+34,s.y-8,4,3);if(onKb)label(c,"asdfghjkl",s.x,s.y+45,11,RED)}
      else if(s.k==="door"){c.fillStyle="#5a4434";c.fillRect(s.x-45,s.y-120,90,240);c.fillStyle="#c9a24a";c.beginPath();c.arc(s.x-30,s.y,6,0,7);c.fill();if(m<60){c.fillStyle="#b98a4a";rr(c,s.x-25,s.y+70,50,40,4);c.fill();c.fillStyle="#8a6430";c.fillRect(s.x-25,s.y+86,50,6);label(c,"DING!",s.x,s.y-130,14,m<30?RED:GOLD)}}
      c.restore();
      // meter
      var bx=s.x-40,by=s.y+(s.k==="door"?128:s.k==="call"?82:62);if(s.k==="call")by=s.y-72;c.fillStyle="rgba(0,0,0,.5)";rr(c,bx,by,80,10,5);c.fill();c.fillStyle=m>50?GRN:m>25?GOLD:RED;rr(c,bx,by,80*Math.max(0,m)/100,10,5);c.fill();
      label(c,(i+1)+" "+s.n,s.x,by-8,11,"rgba(255,255,255,.7)");if(S.flash[i]>0){c.strokeStyle="rgba(255,255,255,"+S.flash[i]*2+")";c.lineWidth=3;c.beginPath();c.arc(s.x,s.y,60+(0.4-S.flash[i])*80,0,7);c.stroke()}});
    stepSparks(c,S.parts,1/60,200);stepText(c,S.txt,1/60)};
  S.over=function(){return overObj("Logged off early!",(S.score|0)+"","You kept the home office running for "+(S.t|0)+" seconds.",S.score,S.coins)};
  S.preview=HG.livePreview(S,function(s){var lo=-1,lm=40;s.m.forEach(function(m,i){if(m<lm){lm=m;lo=i}});if(lo>=0&&Math.random()<0.2)hit(lo)});
  return S;
};

/* ---------- 12. RISE & GRIND — morning treadmill run, powered by coffee ---------- */
NEW.grind=function(){
  var S={},BX0=180,BX1=620,BY=380;
  S.title="Rise & Grind";S.keys="Tap / <kbd>Space</kbd> fast to run · grab ☕ by tapping <kbd>↑</kbd> or the top of the screen when it floats by";
  S.intro="6 AM. The treadmill keeps speeding up. Keep tapping to stay on the belt, and grab the coffee when it drifts past for a boost. Fall off the back and it's back to bed.";
  S.reset=function(){S.t=0;S.x=450;S.v=0;S.belt=70;S.dist=0;S.coins=0;S.parts=[];S.txt=[];S.boost=0;S.cup=null;S.nextCup=4;S.steps=0;S.lvl=1;S.fall=0;S.run=0};
  function step(){S.v+=S.boost>0?62:44;S.steps++;S.run+=0.25;if(S.steps%2)snd("jump");}
  S.action=function(){step()};
  S.tapXY=function(x,y){if(y<200&&S.cup)drink();else step()};
  S.key=function(k){if(k==="ArrowUp"||k==="w"||k==="W"){if(S.cup)drink();return true}return false};
  function drink(){if(!S.cup)return;var d=Math.abs(S.cup.x-S.x);if(d<140){S.boost=4;S.coins++;snd("power");floatText(S.txt,S.x,180,"ESPRESSO BOOST",GOLD);S.cup=null}else{floatText(S.txt,S.cup.x,150,"too far",MUT);}}
  S.hud=function(){return["<b>"+(S.dist|0)+"</b> m · ⚡ <b>"+(S.belt/10|0)+"</b> km/h · 🪙 <b>"+S.coins+"</b>","Best <b>"+best("grind",S.dist)+"</b>"]};
  S.update=function(dt){if(S.fall>0){S.fall+=dt;if(S.fall>0.9)return "over";S.x-=420*dt;return}
    S.t+=dt;S.belt=Math.min(420,70+S.t*4.6);S.boost=Math.max(0,S.boost-dt);var lv=1+((S.t/15)|0);if(lv>S.lvl){S.lvl=lv;snd("level");floatText(S.txt,W/2,90,"SPEED UP",CY)}
    S.v*=Math.pow(0.08,dt);S.x+=(S.v*3.2-S.belt*0.9)*dt*1.4;S.x=Math.min(S.x,BX1-40);S.dist+=S.belt*dt/36;S.run+=dt*S.belt/80;
    S.nextCup-=dt;if(S.nextCup<=0&&!S.cup){S.cup={x:W+40,y:rand(120,170)};S.nextCup=rand(6,10)}
    if(S.cup){S.cup.x-=140*dt;if(S.cup.x<-40)S.cup=null}
    if(Math.random()<dt*0.6&&S.boost>0)S.coins+=0;
    if(S.x<BX0+10){S.fall=0.01;snd("boom");buzz([80,40,80]);floatText(S.txt,BX0,250,"WHOOPS!",RED)}};
  S.draw=function(c){var sk=skin(),t=S.t;officeWall(c,"#262b3b","#12141b");
    // gym: mirror wall + dumbbells + window
    c.fillStyle="#323a52";c.fillRect(40,40,720,230);c.fillStyle="rgba(255,154,60,.12)";c.fillRect(40,40,720,230);c.fillStyle="rgba(255,255,255,.04)";for(var i=0;i<6;i++)c.fillRect(70+i*120,50,6,210);
    c.fillStyle="#ff9a3c";c.globalAlpha=0.08;c.beginPath();c.arc(640,90,60,0,7);c.fill();c.globalAlpha=1;
    for(var d=0;d<4;d++){c.fillStyle="#2c2f3a";c.fillRect(60+d*30,300,8,70);c.fillStyle="#555b6e";c.fillRect(50+d*30,300,28,10);c.fillRect(50+d*30,360,28,10)}
    label(c,"RISE & GRIND",400,30,14,"rgba(255,255,255,.25)");
    // treadmill
    c.fillStyle="#22242c";c.beginPath();c.moveTo(BX0,BY);c.lineTo(BX1,BY);c.lineTo(BX1+20,BY+30);c.lineTo(BX0-20,BY+30);c.closePath();c.fill();
    c.fillStyle="#111";c.fillRect(BX0,BY,BX1-BX0,12);c.strokeStyle="rgba(255,255,255,.18)";c.lineWidth=2;for(var x=BX0+((-S.dist*30)%40+40)%40;x<BX1;x+=40){c.beginPath();c.moveTo(x,BY+2);c.lineTo(x+10,BY+2);c.stroke()}
    c.strokeStyle="#3a3e4c";c.lineWidth=10;c.beginPath();c.moveTo(BX1-20,BY);c.lineTo(BX1+20,BY-150);c.stroke();c.fillStyle="#2a2e3a";rr(c,BX1-10,BY-190,110,60,10);c.fill();
    c.fillStyle=S.belt>330?RED:sk.a;label(c,(S.belt/10).toFixed(1)+" km/h",BX1+45,BY-160,16,S.belt>330?RED:sk.a);
    c.strokeStyle="#3a3e4c";c.lineWidth=6;c.beginPath();c.moveTo(BX1-30,BY-110);c.lineTo(BX1-120,BY-110);c.stroke();
    // coffee
    if(S.cup){var cu=S.cup;c.save();c.translate(cu.x,cu.y+Math.sin(t*4)*6);glow(c,GOLD,16);c.fillStyle="#f4f4f6";rr(c,-16,-18,32,36,6);c.fill();noGlow(c);c.fillStyle="#6b3e1f";c.fillRect(-12,-14,24,6);c.strokeStyle="#f4f4f6";c.lineWidth=4;c.beginPath();c.arc(20,0,7,-1.2,1.2);c.stroke();c.restore()}
    // Var
    var fallen=S.fall>0;c.save();if(fallen){c.translate(S.x,BY);c.rotate(-S.fall*3);c.translate(-S.x,-BY)}
    varBody(c,S.x,BY,1.6,"run",S.run*0.35,fallen?"o":S.boost>0?"happy":S.x<BX0+80?"angry":"");c.restore();
    if(S.boost>0){for(var p=0;p<2;p++)S.parts.push({x:S.x-20,y:BY-60+rand(-30,30),vx:rand(-200,-120),vy:0,l:0.5,col:GOLD})}
    // danger zone
    c.fillStyle="rgba(255,61,94,"+(S.x<BX0+90?0.25+0.2*Math.sin(t*16):0.08)+")";c.fillRect(BX0,BY+12,80,8);
    stepSparks(c,S.parts,1/60,0);stepText(c,S.txt,1/60)};
  S.over=function(){return overObj("Off the treadmill!",(S.dist|0)+" m","Top speed "+(S.belt/10).toFixed(1)+" km/h · "+S.coins+" coffees.",S.dist,S.coins)};
  S.preview=HG.livePreview(S,function(s){var need=s.x<430;if(need&&Math.random()<0.45)step();if(s.cup&&Math.abs(s.cup.x-s.x)<100)drink()});
  return S;
};

/* ---------- register ---------- */
var INFO=[
  {k:"photon",name:"Photon Dash",tag:"Endless speed",desc:"Thread a light-ship through a neon void that keeps getting faster.",unit:"m",ach:[300,"Light Speed","Reach 300 m in Photon Dash"]},
  {k:"apex",name:"Apex Highway",tag:"Highway racing",desc:"Weave through sunset traffic on a winding coast road. Overtakes score.",unit:"m",ach:[1500,"Road King","Reach 1,500 m in Apex Highway"]},
  {k:"pulse",name:"Pulse Defender",tag:"Arena shooter",desc:"Aim the pulse cannon and protect the core from geometric drones.",unit:"pts",ach:[1500,"Core Keeper","Score 1,500 in Pulse Defender"]},
  {k:"rope",name:"Rope Rally",tag:"Swing physics",desc:"Hold to grab, release to fly. Never touch the neon floor.",unit:"m",ach:[400,"Sky Swinger","Swing 400 m in Rope Rally"]},
  {k:"gradient",name:"Gradient Drop",tag:"Reflex run",desc:"Kubo slides down an endless slope. Jump gaps, spikes and walls.",unit:"m",ach:[600,"Downhill Hero","Slide 600 m in Gradient Drop"]},
  {k:"horde",name:"Glitch Horde",tag:"Survival",desc:"Survive the night shift against corrupted office bots. Auto-aim blaster.",unit:"pts",ach:[1000,"Night Shift Pro","Score 1,000 in Glitch Horde"]},
  {k:"drift",name:"Drift Circuit",tag:"Drifting",desc:"Slide through gates before the clock runs out. Long drifts, big combos.",unit:"pts",ach:[2500,"Sideways Legend","Score 2,500 in Drift Circuit"]},
  {k:"flip",name:"Flipside",tag:"Gravity skill",desc:"Flip between floor and ceiling to dodge spikes, gaps and zappers.",unit:"m",ach:[300,"Upside Master","Run 300 m in Flipside"]}
];
var OFFICE=[
  {k:"boss",name:"Boss Alert",tag:"Reflex · office",desc:"Slack off on your phone, but look busy before the boss peeks in.",unit:"chill",ach:[600,"Never Caught","Score 600 in Boss Alert"]},
  {k:"jam",name:"Jam Session",tag:"Traffic jam",desc:"Hop into the moving lane before the morning jam drives Vansh mad.",unit:"m",ach:[800,"Lane Hopper","Drive 800 m in Jam Session"]},
  {k:"wfh",name:"Home Office Hustle",tag:"Multitasking",desc:"Meeting, coffee, plant, cat, delivery. Keep all five alive.",unit:"pts",ach:[900,"WFH Pro","Score 900 in Home Office Hustle"]},
  {k:"grind",name:"Rise & Grind",tag:"Treadmill tapper",desc:"Tap to keep up with the treadmill. Coffee helps.",unit:"m",ach:[400,"Morning Person","Run 400 m in Rise & Grind"]}
];
INFO.forEach(function(i){HG.GAMES[i.k]=NEW[i.k]});OFFICE.forEach(function(i){HG.GAMES[i.k]=NEW[i.k]});HG.OFFICE=OFFICE;HG.varHead=varHead;HG.varBody=varBody;
HG.NEON=INFO;HG.SKINS=SKINS;HG.skin=skin;HG.skinId=skinId;HG.neonSfx=snd;
})();
