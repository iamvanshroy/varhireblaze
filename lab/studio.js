/* VB Game Studio — tile-based platformer maker. Build, play, share as a link. */
VBLab.reg("studio",{mount:function(root,L){
  var COLS=40,ROWS=15,T=32,VW=800,VH=480;
  var TILES={".":{n:"Empty"},"#":{n:"Block",c:"#3a3a46"},"=":{n:"Brick",c:"#ff6a00"},"^":{n:"Spikes",c:"#ff3d5e"},"o":{n:"Coin",c:"#ffd23f"},"S":{n:"Start",c:"#3de8ff"},"F":{n:"Goal",c:"#2bd46b"},"B":{n:"Bounce",c:"#a66bff"},"x":{n:"Eraser"}};
  var PRE={
    "First steps":["........................................","........................................","........................................","........................................","........................................","..........................o.o.o.........","........................=======.........","...............o.o......................","..............=====.................F...","......o.o.o.........................###.",".....=======..........^^^...............","S.......................................","####...##########...########..##########","####...##########...########..##########","########################################"],
    "Bounce house":["........................................","........................................","..................o..o..o...............","........................................","...................=======..............","..........o.............................","........................................","..........=.........................o...","....................................=...","...................................F....","S..................................#....","....................^^^^^^^^^^...........","####B######B######B##########B##########","########################################","########################################"]};
  function blankLvl(){var a=[];for(var y=0;y<ROWS;y++){var r="";for(var x=0;x<COLS;x++)r+=(y>=ROWS-2?"#":".");a.push(r)}a[ROWS-3]="S"+a[ROWS-3].slice(1);var r2=a[ROWS-3].split("");r2[COLS-2]="F";a[ROWS-3]=r2.join("");return a}
  function enc(lv){return btoa(lv.join("")).replace(/=+$/,"").replace(/\+/g,"-").replace(/\//g,"_")}
  function dec(s){try{var str=atob(s.replace(/-/g,"+").replace(/_/g,"/"));if(str.length!==COLS*ROWS||/[^.#=^oSFB]/.test(str))return null;var a=[];for(var y=0;y<ROWS;y++)a.push(str.substr(y*COLS,COLS));return a}catch(e){return null}}
  var m=(location.hash.split("?")[1]||"").match(/l=([A-Za-z0-9_-]+)/);
  var shared=m&&dec(m[1]);
  var lvl=shared||L.ls("vb_studio_lvl",null)||PRE["First steps"].slice();
  var mode=shared?"play":"edit",brush="#",camX=0,raf=0,last=0,down=false;
  root.innerHTML='<div class="lab-pad"><div class="lab-row" style="justify-content:space-between;margin-bottom:14px"><div><div class="lab-h">Game Studio</div><p class="lab-mut" id="gsHint"></p></div>'+
   '<div class="lab-row"><button class="lab-btn" id="gsMode"></button><button class="lab-btn" id="gsShare">🔗 Share level</button></div></div>'+
   '<canvas class="lab-cv" id="gscv" style="width:100%;aspect-ratio:800/480"></canvas>'+
   '<div id="gsEdit"><div class="lab-row" style="margin-top:12px" id="gsBr"></div>'+
   '<div class="lab-row" style="margin-top:10px"><span class="lab-mut">Templates:</span>'+Object.keys(PRE).map(function(k){return '<button class="lab-btn" data-pre="'+k+'">'+k+'</button>'}).join("")+'<button class="lab-btn" id="gsNew">Blank</button>'+
   '<span class="lab-mut" style="margin-left:auto">Scroll <button class="lab-btn" id="gsL">◀</button><button class="lab-btn" id="gsR">▶</button></span></div></div>'+
   '<div id="gsPad" class="lab-row" style="margin-top:12px;display:none;justify-content:center;gap:14px"><button class="lab-btn" data-k="l" style="width:70px;height:56px;font-size:22px">◀</button><button class="lab-btn" data-k="r" style="width:70px;height:56px;font-size:22px">▶</button><button class="lab-btn pri" data-k="j" style="width:110px;height:56px;font-size:18px">Jump</button></div></div>';
  var cv=root.querySelector("#gscv"),c=L.fitCanvas(cv,VW,VH);
  var br=root.querySelector("#gsBr");br.innerHTML="#=^oBSFx".split("").map(function(k){return '<button class="lab-btn" data-b="'+k+'"><span style="display:inline-block;width:12px;height:12px;border-radius:3px;vertical-align:-1px;margin-right:6px;background:'+(TILES[k].c||"repeating-conic-gradient(#444 0 25%,#222 0 50%) 50%/6px 6px")+'"></span>'+TILES[k].n+'</button>'}).join("");
  function paintBr(){br.querySelectorAll("[data-b]").forEach(function(b){b.classList.toggle("on",b.dataset.b===brush)})}paintBr();
  br.onclick=function(e){var b=e.target.closest("[data-b]");if(b){brush=b.dataset.b;paintBr()}};
  function at(x,y){if(y<0)return".";if(x<0||x>=COLS||y>=ROWS)return"#";return lvl[y][x]}
  function put(x,y,ch){if(x<0||y<0||x>=COLS||y>=ROWS)return;if(ch==="S"||ch==="F")for(var yy=0;yy<ROWS;yy++)lvl[yy]=lvl[yy].split(ch).join(".");var r=lvl[y].split("");r[x]=ch==="x"?".":ch;lvl[y]=r.join("");L.ss("vb_studio_lvl",lvl)}
  function find(ch){for(var y=0;y<ROWS;y++){var i=lvl[y].indexOf(ch);if(i>=0)return{x:i,y:y}}return null}
  /* player */
  var P,coins,got,dead,won,keys={},tStart=0;
  function reset(){var s=find("S")||{x:1,y:ROWS-3};P={x:s.x*T+6,y:s.y*T+4,vx:0,vy:0,w:20,h:28,on:false,face:1};got={};coins=0;dead=0;won=false;tStart=performance.now()}
  function solid(ch){return ch==="#"||ch==="="||ch==="B"}
  function physics(dt){var acc=keys.l?-1:keys.r?1:0;P.vx+=acc*1800*dt;P.vx*=P.on?Math.pow(0.0008,dt):Math.pow(0.15,dt);P.vx=Math.max(-260,Math.min(260,P.vx));if(acc)P.face=acc;
    if(keys.j&&P.on){P.vy=-560;P.on=false;L.beep(300,600,.12,"square",.04)}P.vy=Math.min(900,P.vy+1500*dt);
    P.x+=P.vx*dt;var x0=Math.floor(P.x/T),x1=Math.floor((P.x+P.w-1)/T),y0=Math.floor(P.y/T),y1=Math.floor((P.y+P.h-1)/T),yy,xx;
    for(yy=y0;yy<=y1;yy++){if(P.vx>0&&solid(at(x1,yy))){P.x=x1*T-P.w;P.vx=0}if(P.vx<0&&solid(at(x0,yy))){P.x=(x0+1)*T;P.vx=0}}
    P.y+=P.vy*dt;P.on=false;x0=Math.floor(P.x/T);x1=Math.floor((P.x+P.w-1)/T);y0=Math.floor(P.y/T);y1=Math.floor((P.y+P.h-1)/T);
    for(xx=x0;xx<=x1;xx++){if(P.vy>0&&solid(at(xx,y1))){P.y=y1*T-P.h;if(at(xx,y1)==="B"){P.vy=-820;L.beep(200,900,.18,"sine",.06)}else{P.vy=0;P.on=true}}else if(P.vy<0&&solid(at(xx,y0))){P.y=(y0+1)*T;P.vy=0}}
    for(yy=Math.floor(P.y/T);yy<=Math.floor((P.y+P.h-1)/T);yy++)for(xx=Math.floor(P.x/T);xx<=Math.floor((P.x+P.w-1)/T);xx++){var ch=at(xx,yy);
      if(ch==="o"&&!got[xx+","+yy]){got[xx+","+yy]=1;coins++;L.beep(988,1319,.1,"square",.04)}
      if(ch==="^"&&P.y+P.h>yy*T+14){die();return}
      if(ch==="F"&&!won){won=true;var secs=((performance.now()-tStart)/1000).toFixed(1);L.beep(523,1046,.4,"triangle",.07);msg="Level clear! "+coins+" coins in "+secs+"s";var w=L.ls("vb_studio_wins",0)+1;L.ss("vb_studio_wins",w);if(w===1){L.coins.add(15);L.toast("First level cleared! +15 🪙")}}}
    if(P.y>ROWS*T+60)die()}
  var msg="";function die(){dead++;L.beep(400,80,.3,"sawtooth",.05);var s=find("S")||{x:1,y:ROWS-3};P.x=s.x*T+6;P.y=s.y*T+4;P.vx=P.vy=0}
  function draw(){c.fillStyle="#0b0b10";c.fillRect(0,0,VW,VH);var g=c.createLinearGradient(0,0,0,VH);g.addColorStop(0,"#1a0f2b");g.addColorStop(1,"#0b0b10");c.fillStyle=g;c.fillRect(0,0,VW,VH);
    c.save();c.translate(-camX,0);
    for(var y=0;y<ROWS;y++)for(var x=Math.floor(camX/T);x<=Math.floor((camX+VW)/T)&&x<COLS;x++){var ch=lvl[y][x],X=x*T,Y=y*T;
      if(mode==="edit"){c.strokeStyle="rgba(255,255,255,.04)";c.strokeRect(X+.5,Y+.5,T-1,T-1)}
      if(ch==="#"){c.fillStyle="#2a2a33";c.fillRect(X,Y,T,T);c.fillStyle="#3a3a46";c.fillRect(X,Y,T,4)}
      else if(ch==="="){c.fillStyle="#c24f00";c.fillRect(X,Y,T,T);c.fillStyle="#ff6a00";c.fillRect(X+1,Y+1,T/2-2,T/2-2);c.fillRect(X+T/2+1,Y+1,T/2-2,T/2-2);c.fillRect(X+T/4,Y+T/2+1,T/2-2,T/2-2)}
      else if(ch==="B"){c.fillStyle="#2a2a33";c.fillRect(X,Y,T,T);c.fillStyle="#a66bff";c.fillRect(X+3,Y,T-6,8)}
      else if(ch==="^"){c.fillStyle="#ff3d5e";for(var k=0;k<4;k++){c.beginPath();c.moveTo(X+k*8,Y+T);c.lineTo(X+k*8+4,Y+12);c.lineTo(X+k*8+8,Y+T);c.fill()}}
      else if(ch==="o"&&!(mode==="play"&&got[x+","+y])){var bob=Math.sin(performance.now()/250+x)*3;c.fillStyle="#ffd23f";c.beginPath();c.ellipse(X+T/2,Y+T/2+bob,8,10,0,0,7);c.fill();c.fillStyle="#fff6";c.fillRect(X+T/2-2,Y+T/2-5+bob,3,8)}
      else if(ch==="F"){c.fillStyle="#ddd";c.fillRect(X+6,Y-T,3,T*2);c.fillStyle="#2bd46b";c.beginPath();c.moveTo(X+9,Y-T);c.lineTo(X+28,Y-T+9);c.lineTo(X+9,Y-T+18);c.fill()}
      else if(ch==="S"&&mode==="edit"){c.fillStyle="#3de8ff55";c.fillRect(X+4,Y+4,T-8,T-8);c.fillStyle="#3de8ff";c.font="700 12px Inter";c.textAlign="center";c.fillText("S",X+T/2,Y+T/2+4)}}
    if(mode==="play"){var HG=window.HireGames;if(HG&&HG.varBody){c.save();c.translate(P.x+P.w/2,P.y+P.h);if(P.face<0)c.scale(-1,1);HG.varBody(c,0,0,0.24,P.on&&Math.abs(P.vx)>30?"run":"stand",P.on&&Math.abs(P.vx)>30?performance.now()/1000:0,"happy");c.restore()}
      else{c.fillStyle="#f3dcc4";c.fillRect(P.x,P.y,P.w,P.h)}}
    c.restore();
    if(mode==="play"){c.fillStyle="#fff";c.font="700 16px Inter";c.textAlign="left";c.fillText("🪙 "+coins+"   ☠ "+dead,14,26);if(won){c.fillStyle="rgba(0,0,0,.6)";c.fillRect(0,VH/2-50,VW,100);c.fillStyle="#2bd46b";c.font="700 30px Space Grotesk";c.textAlign="center";c.fillText(msg,VW/2,VH/2+4);c.fillStyle="#ccc";c.font="500 15px Inter";c.fillText("Press R or tap Edit to keep building",VW/2,VH/2+32)}}}
  function loop(t){raf=requestAnimationFrame(loop);var dt=Math.min(0.033,(t-(last||t))/1000);last=t;if(mode==="play"&&!won){physics(dt);camX=Math.max(0,Math.min(COLS*T-VW,P.x-VW/2+P.w/2))}draw()}
  function setMode(m2){mode=m2;root.querySelector("#gsMode").textContent=mode==="edit"?"▶ Play level":"✏️ Edit level";root.querySelector("#gsEdit").style.display=mode==="edit"?"":"none";
    root.querySelector("#gsPad").style.display=mode==="play"&&matchMedia("(hover:none)").matches?"flex":"none";
    root.querySelector("#gsHint").textContent=mode==="edit"?"Pick a tile and paint on the grid. Needs a Start (S) and a Goal flag.":"Arrows or A/D to move, Space or W to jump, R to restart.";if(mode==="play"){reset();if(!find("F"))L.toast("Tip: add a Goal flag so the level can be finished")}else camX=Math.min(camX,COLS*T-VW)}
  root.querySelector("#gsMode").onclick=function(){setMode(mode==="edit"?"play":"edit")};
  function paintAt(e){var p=L.pos(cv,e,VW,VH);put(Math.floor((p.x+camX)/T),Math.floor(p.y/T),brush)}
  cv.addEventListener("pointerdown",function(e){if(mode!=="edit")return;down=true;try{cv.setPointerCapture(e.pointerId)}catch(err){}paintAt(e)});
  cv.addEventListener("pointermove",function(e){if(down&&mode==="edit"&&brush!=="S"&&brush!=="F")paintAt(e)});
  cv.addEventListener("pointerup",function(){down=false});
  root.querySelector("#gsL").onclick=function(){camX=Math.max(0,camX-T*6)};root.querySelector("#gsR").onclick=function(){camX=Math.min(COLS*T-VW,camX+T*6)};
  root.querySelectorAll("[data-pre]").forEach(function(b){b.onclick=function(){lvl=PRE[b.dataset.pre].slice();L.ss("vb_studio_lvl",lvl);camX=0}});
  root.querySelector("#gsNew").onclick=function(){lvl=blankLvl();L.ss("vb_studio_lvl",lvl);camX=0};
  root.querySelector("#gsShare").onclick=function(){var url=location.origin+"/lab.html#studio?l="+enc(lvl);if(window.VBShare)VBShare.share("wa",{title:"My VB level",text:"I built a level on VB Game Studio 🕹️ Can you beat it?",url:url});try{navigator.clipboard.writeText(url);L.toast("Level link copied")}catch(e){}};
  var KM={ArrowLeft:"l",KeyA:"l",ArrowRight:"r",KeyD:"r",ArrowUp:"j",KeyW:"j",Space:"j"};
  function kd(e){if(/INPUT|SELECT|TEXTAREA/.test(e.target.tagName))return;if(KM[e.code]&&mode==="play"){keys[KM[e.code]]=true;e.preventDefault()}if(e.code==="KeyR"&&mode==="play")reset()}
  function ku(e){if(KM[e.code])keys[KM[e.code]]=false}
  document.addEventListener("keydown",kd);document.addEventListener("keyup",ku);
  root.querySelectorAll("#gsPad [data-k]").forEach(function(b){var k=b.dataset.k;b.addEventListener("pointerdown",function(e){e.preventDefault();keys[k]=true});["pointerup","pointerleave","pointercancel"].forEach(function(ev){b.addEventListener(ev,function(){keys[k]=false})})});
  setMode(mode);if(shared)L.toast("Someone sent you a level. Good luck!");raf=requestAnimationFrame(loop);
  return function(){cancelAnimationFrame(raf);document.removeEventListener("keydown",kd);document.removeEventListener("keyup",ku)}
}});
