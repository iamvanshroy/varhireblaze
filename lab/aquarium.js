/* VB Aquarium — buy fish with VB coins, decorate, feed. Saved locally. */
VBLab.reg("aquarium",{mount:function(root,L){
  var VW=800,VH=460,KEY="vb_tank",raf=0;
  var FISH=[{id:"ember",n:"Ember Guppy",p:0,c1:"#ff6a00",c2:"#ffd23f",s:.8},{id:"azure",n:"Azure Tetra",p:40,c1:"#3de8ff",c2:"#3da2ff",s:.7},{id:"mint",n:"Mint Darter",p:60,c1:"#2bd46b",c2:"#9dff3d",s:.75},
    {id:"plum",n:"Plum Angel",p:120,c1:"#a66bff",c2:"#ff9ad5",s:1.1,tall:1},{id:"sun",n:"Sunburst Puffer",p:180,c1:"#ffd23f",c2:"#ff9a3c",s:1,round:1},{id:"ghost",n:"Ghost Ray",p:300,c1:"#e8e8f0",c2:"#8e8e99",s:1.4,ray:1},{id:"lava",n:"Lava Koi",p:500,c1:"#ff3d5e",c2:"#fff",s:1.3,koi:1}];
  var DECOR=[{id:"weed",n:"Seaweed",p:20},{id:"rock",n:"Rock arch",p:35},{id:"chest",n:"Treasure chest",p:80},{id:"coral",n:"Coral",p:50},{id:"castle",n:"VB castle",p:150}];
  var tank=L.ls(KEY,null)||{fish:[{t:"ember",name:"Blaze"}],decor:["weed"],fed:0,last:Date.now()};
  var fs=[],food=[],bubbles=[],fx=FISH.reduce(function(o,f){o[f.id]=f;return o},{});
  function spawn(f){var d=fx[f.t];return{d:d,name:f.name,x:100+Math.random()*600,y:80+Math.random()*250,vx:(Math.random()<.5?-1:1)*(30+Math.random()*30),vy:0,ph:Math.random()*9,tx:0,ty:0,hungry:0}}
  tank.fish.forEach(function(f){fs.push(spawn(f))});
  function save(){L.ss(KEY,tank)}
  root.innerHTML='<div class="lab-pad"><div class="lab-row" style="justify-content:space-between;margin-bottom:14px"><div><div class="lab-h">Aquarium</div><p class="lab-mut">Tap the water to drop food. Earn coins by playing <a href="/games.html" style="color:#ff9a3c">VB games</a>, then spend them here.</p></div><span class="lab-mut" id="aqCount"></span></div>'+
   '<canvas class="lab-cv" id="aqcv" style="width:100%;aspect-ratio:800/460;cursor:pointer"></canvas>'+
   '<div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:16px" class="aq-shop"><div class="lab-card"><b>Fish shop</b><div id="aqF" style="margin-top:10px;display:grid;gap:8px"></div></div><div class="lab-card"><b>Decor</b><div id="aqD" style="margin-top:10px;display:grid;gap:8px"></div></div></div></div>'+
   '<style>@media(max-width:700px){.aq-shop{grid-template-columns:1fr!important}}.aqi{display:flex;justify-content:space-between;align-items:center;gap:10px;font-size:14px}</style>';
  var cv=root.querySelector("#aqcv"),c=L.fitCanvas(cv,VW,VH);
  function shop(){root.querySelector("#aqCount").textContent=tank.fish.length+" fish · max 12";
    root.querySelector("#aqF").innerHTML=FISH.map(function(f){var owned=tank.fish.filter(function(x){return x.t===f.id}).length;return '<div class="aqi"><span><i style="display:inline-block;width:12px;height:12px;border-radius:50%;background:linear-gradient(90deg,'+f.c1+','+f.c2+');margin-right:8px"></i>'+f.n+(owned?' <span class="lab-mut">×'+owned+'</span>':'')+'</span><button class="lab-btn" data-buyf="'+f.id+'">'+(f.p?"🪙 "+f.p:"Free")+'</button></div>'}).join("");
    root.querySelector("#aqD").innerHTML=DECOR.map(function(d){var has=tank.decor.indexOf(d.id)>=0;return '<div class="aqi"><span>'+d.n+'</span>'+(has?'<span class="lab-mut">Placed ✓</span>':'<button class="lab-btn" data-buyd="'+d.id+'">🪙 '+d.p+'</button>')+'</div>'}).join("")}
  root.addEventListener("click",function(e){var b=e.target.closest("[data-buyf]"),d=e.target.closest("[data-buyd]");
    if(b){var f=fx[b.dataset.buyf];if(tank.fish.length>=12){L.toast("Your tank is full (12 fish)");return}if(f.p&&!L.coins.spend(f.p)){L.toast("Not enough coins. Play a <a href='/games.html' style='color:#ff9a3c'>VB game</a> to earn more");return}
      var nm=(prompt("Name your "+f.n+"?",f.n.split(" ")[0])||f.n.split(" ")[0]).replace(/[<>&"]/g,"").slice(0,14);tank.fish.push({t:f.id,name:nm});fs.push(spawn({t:f.id,name:nm}));save();shop();L.beep(600,1200,.15,"sine",.06);L.toast("Welcome, "+nm+"! 🐠")}
    if(d){var dd=DECOR.filter(function(x){return x.id===d.dataset.buyd})[0];if(!L.coins.spend(dd.p)){L.toast("Not enough coins yet");return}tank.decor.push(dd.id);save();shop();L.toast(dd.n+" placed")}});
  cv.addEventListener("click",function(e){var p=L.pos(cv,e,VW,VH);for(var i=0;i<5;i++)food.push({x:p.x+(Math.random()-.5)*30,y:Math.min(p.y,60)+Math.random()*10,vy:20+Math.random()*15});L.beep(1200,600,.05,"sine",.03);
    var day=VBLab.today();if(tank.fedDay!==day){tank.fedDay=day;save();L.coins.add(5);L.toast("Daily feeding bonus +5 🪙")}});
  function decor(t){var has=function(id){return tank.decor.indexOf(id)>=0};
    if(has("castle")){c.fillStyle="#2a2a33";c.fillRect(560,300,110,110);c.fillRect(550,270,30,140);c.fillRect(650,270,30,140);c.fillStyle="#ff6a00";c.font="700 30px Space Grotesk";c.textAlign="center";c.fillText("VB",615,355);c.fillStyle="#0b0b10";c.beginPath();c.arc(615,410,18,Math.PI,0);c.fill()}
    if(has("rock")){c.fillStyle="#4a4643";c.beginPath();c.moveTo(140,420);c.quadraticCurveTo(200,300,270,420);c.lineTo(250,420);c.quadraticCurveTo(200,340,160,420);c.fill()}
    if(has("chest")){c.fillStyle="#7a4d00";c.fillRect(400,385,60,32);c.fillStyle="#a66b00";c.beginPath();c.ellipse(430,385,30,12,0,Math.PI,0);c.fill();c.fillStyle="#ffd23f";c.fillRect(426,388,8,10);if(Math.sin(t/900)>.7){c.fillStyle="#ffd23f88";c.beginPath();c.arc(430,370,4+Math.random()*3,0,7);c.fill()}}
    if(has("coral")){c.strokeStyle="#ff9ad5";c.lineWidth=7;c.lineCap="round";[[720,420,-1],[740,420,0],[760,420,1]].forEach(function(b){c.beginPath();c.moveTo(b[0],b[1]);c.quadraticCurveTo(b[0]+b[2]*20,b[1]-40,b[0]+b[2]*10,b[1]-75);c.stroke()})}
    if(has("weed")){c.strokeStyle="#2bd46b";c.lineWidth=6;c.lineCap="round";for(var i=0;i<5;i++){var bx=40+i*18;c.beginPath();c.moveTo(bx,425);for(var s=1;s<=6;s++)c.lineTo(bx+Math.sin(t/700+s*.7+i)*8*s/3,425-s*24);c.stroke()}}}
  function fish(f,t){var d=f.d,s=d.s,dir=f.vx<0?-1:1,w=Math.sin(t/120+f.ph)*0.25;c.save();c.translate(f.x,f.y);c.scale(dir,1);
    var g=c.createLinearGradient(-30*s,0,30*s,0);g.addColorStop(0,d.c2);g.addColorStop(1,d.c1);c.fillStyle=g;
    if(d.ray){c.beginPath();c.moveTo(30*s,0);c.quadraticCurveTo(0,-34*s*(1+w),-20*s,0);c.quadraticCurveTo(0,34*s*(1-w),30*s,0);c.fill();c.strokeStyle=d.c2;c.lineWidth=2;c.beginPath();c.moveTo(-20*s,0);c.quadraticCurveTo(-45*s,Math.sin(t/200)*10,-60*s,0);c.stroke()}
    else{c.beginPath();c.moveTo(-18*s,0);c.lineTo(-34*s,-12*s*(1+w));c.lineTo(-34*s,12*s*(1-w));c.closePath();c.fill();
      c.beginPath();c.ellipse(0,0,24*s,(d.round?18:d.tall?20:10)*s,0,0,7);c.fill();
      if(d.tall){c.beginPath();c.moveTo(-4*s,-16*s);c.lineTo(4*s,-34*s);c.lineTo(12*s,-14*s);c.moveTo(-4*s,16*s);c.lineTo(4*s,34*s);c.lineTo(12*s,14*s);c.fill()}
      if(d.koi){c.fillStyle="#fff";c.beginPath();c.ellipse(4*s,-3*s,8*s,5*s,0,0,7);c.ellipse(-10*s,3*s,6*s,4*s,0,0,7);c.fill()}
      if(d.round){c.fillStyle="#ffffff55";for(var k=0;k<6;k++){c.beginPath();c.arc(Math.cos(k)*12*s,Math.sin(k)*12*s,1.6,0,7);c.fill()}}
      c.fillStyle="#fff";c.beginPath();c.arc(13*s,-3*s,4*s,0,7);c.fill();c.fillStyle="#111";c.beginPath();c.arc(14*s,-3*s,2*s,0,7);c.fill()}
    c.restore()}
  var last=0;function loop(t){raf=requestAnimationFrame(loop);var dt=Math.min(.05,(t-(last||t))/1000);last=t;
    var g=c.createLinearGradient(0,0,0,VH);g.addColorStop(0,"#0a3b5c");g.addColorStop(1,"#041624");c.fillStyle=g;c.fillRect(0,0,VW,VH);
    c.globalAlpha=.06;c.fillStyle="#fff";for(var i=0;i<6;i++){c.beginPath();var lx=(i*170+t/40)%1000-100;c.moveTo(lx,0);c.lineTo(lx+60,0);c.lineTo(lx-60,VH);c.lineTo(lx-120,VH);c.fill()}c.globalAlpha=1;
    c.fillStyle="#c9a66b";c.beginPath();c.moveTo(0,VH);c.lineTo(0,420);for(var x=0;x<=VW;x+=40)c.lineTo(x,418+Math.sin(x/90)*6);c.lineTo(VW,VH);c.fill();
    decor(t);
    if(Math.random()<.08)bubbles.push({x:Math.random()<.5?60+Math.random()*30:615,y:VH-40,r:2+Math.random()*4});
    bubbles=bubbles.filter(function(b){b.y-=40*dt*(1+b.r/4);b.x+=Math.sin(b.y/20)*.3;c.strokeStyle="#ffffff66";c.lineWidth=1.2;c.beginPath();c.arc(b.x,b.y,b.r,0,7);c.stroke();return b.y>0});
    food=food.filter(function(f){f.y=Math.min(415,f.y+f.vy*dt);c.fillStyle="#d48a3a";c.beginPath();c.arc(f.x,f.y,3,0,7);c.fill();return !f.eaten});
    fs.forEach(function(f){var tgt=null,bd=1e9;food.forEach(function(p){var dd=Math.hypot(p.x-f.x,p.y-f.y);if(dd<bd&&!p.eaten){bd=dd;tgt=p}});
      if(tgt&&bd<400){var ax=tgt.x-f.x,ay=tgt.y-f.y,m=Math.hypot(ax,ay)||1;f.vx+=(ax/m*120-f.vx)*dt*2;f.vy+=(ay/m*120-f.vy)*dt*2;if(bd<14){tgt.eaten=true;L.beep(900,700,.04,"sine",.02)}}
      else{f.vy+=(Math.sin(t/1500+f.ph)*15-f.vy)*dt;if(Math.abs(f.vx)<25)f.vx=(f.vx<0?-1:1)*40;}
      f.x+=f.vx*dt;f.y+=f.vy*dt;if(f.x<40){f.x=40;f.vx=Math.abs(f.vx)}if(f.x>VW-40){f.x=VW-40;f.vx=-Math.abs(f.vx)}f.y=Math.max(40,Math.min(390,f.y));fish(f,t)});
    if(!fs.length){c.fillStyle="#fff";c.font="600 18px Inter";c.textAlign="center";c.fillText("Your tank is empty. Grab a free Ember Guppy below!",VW/2,VH/2)}}
  shop();raf=requestAnimationFrame(loop);
  return function(){cancelAnimationFrame(raf)}
}});
