/* VB Physics Playground — custom circle/segment physics: spawn, draw ramps, grab & throw, explode. */
VBLab.reg("physics",{mount:function(root,L){
  var VW=900,VH=520,raf=0,tool="ball",B=[],S=[],grav=1,wind=0,slow=false,drawing=null,grab=null,fx=[],ptr={x:0,y:0},prev={x:0,y:0};
  var COLS=["#ff6a00","#ffd23f","#3de8ff","#a66bff","#2bd46b","#ff3d5e","#ff9ad5"];
  function wall(){S=[{a:{x:0,y:VH},b:{x:VW,y:VH},fixed:1},{a:{x:0,y:0},b:{x:0,y:VH},fixed:1},{a:{x:VW,y:0},b:{x:VW,y:VH},fixed:1}]}
  function demo(){wall();S.push({a:{x:120,y:200},b:{x:420,y:290}},{a:{x:820,y:330},b:{x:520,y:410}},{a:{x:330,y:470},b:{x:470,y:430}});for(var i=0;i<14;i++)add(140+Math.random()*200,40+Math.random()*80,10+Math.random()*16)}
  function add(x,y,r,kind){if(B.length>220)B.shift();B.push({x:x,y:y,vx:(Math.random()-.5)*40,vy:0,r:r,m:r*r,c:kind==="vb"?"#ff6a00":COLS[Math.floor(Math.random()*COLS.length)],k:kind||"ball",rot:0,bounce:kind==="bouncy"?.95:kind==="heavy"?.15:.45})}
  root.innerHTML='<div class="lab-pad"><div class="lab-row" style="justify-content:space-between;margin-bottom:12px"><div><div class="lab-h">Physics Playground</div><p class="lab-mut">Pick a tool, then click or drag on the canvas. Grab any ball and fling it.</p></div><span class="lab-mut" id="phN"></span></div>'+
   '<div class="lab-row" id="phT" style="margin-bottom:10px">'+[["ball","⚪ Ball"],["bouncy","🟣 Bouncy"],["heavy","⚫ Heavy"],["vb","🟠 VB ball"],["rain","🌧 Ball rain"],["ramp","📏 Draw ramp"],["grab","✋ Grab & throw"],["bomb","💥 Explode"],["erase","🧽 Erase"]].map(function(t){return '<button class="lab-btn" data-t="'+t[0]+'">'+t[1]+'</button>'}).join("")+'</div>'+
   '<canvas class="lab-cv" id="phcv" style="width:100%;aspect-ratio:900/520"></canvas>'+
   '<div class="lab-row" style="margin-top:10px"><span class="lab-mut">Gravity:</span><button class="lab-btn" data-g="1">⬇ Down</button><button class="lab-btn" data-g="0">○ Zero</button><button class="lab-btn" data-g="-1">⬆ Up</button>'+
   '<span class="lab-mut" style="margin-left:10px">Wind</span><input type="range" id="phW" min="-100" max="100" value="0" style="accent-color:#ff6a00">'+
   '<button class="lab-btn" id="phS">🐢 Slow-mo: off</button><button class="lab-btn" id="phShake">🫨 Shake</button><button class="lab-btn" id="phClr">Clear</button><button class="lab-btn" id="phDemo">Reset demo</button></div></div>';
  var cv=root.querySelector("#phcv"),c=L.fitCanvas(cv,VW,VH);
  function setT(t){tool=t;root.querySelectorAll("#phT [data-t]").forEach(function(b){b.classList.toggle("on",b.dataset.t===t)})}setT("ball");
  function setG(g){grav=g;root.querySelectorAll("[data-g]").forEach(function(b){b.classList.toggle("on",+b.dataset.g===g)})}setG(1);
  root.querySelector("#phT").onclick=function(e){var b=e.target.closest("[data-t]");if(b)setT(b.dataset.t)};
  root.querySelectorAll("[data-g]").forEach(function(b){b.onclick=function(){setG(+b.dataset.g)}});
  root.querySelector("#phW").oninput=function(e){wind=+e.target.value};
  root.querySelector("#phS").onclick=function(){slow=!slow;this.textContent="🐢 Slow-mo: "+(slow?"on":"off");this.classList.toggle("on",slow)};
  root.querySelector("#phShake").onclick=function(){B.forEach(function(b){b.vx+=(Math.random()-.5)*700;b.vy-=Math.random()*600})};
  root.querySelector("#phClr").onclick=function(){B=[];wall()};root.querySelector("#phDemo").onclick=function(){B=[];demo()};
  function boom(x,y){fx.push({x:x,y:y,t:0});L.beep(160,40,.4,"sawtooth",.09);B.forEach(function(b){var dx=b.x-x,dy=b.y-y,d=Math.hypot(dx,dy)||1;if(d<220){var f=(1-d/220)*1600*(400/b.m+.4);b.vx+=dx/d*f;b.vy+=dy/d*f}});
    var n=L.ls("vb_phys_booms",0)+1;L.ss("vb_phys_booms",n);if(n===25)L.secret("boom25","Demolition Expert (25 explosions)")}
  function nearestSeg(p){var best=null,bd=14;S.forEach(function(s,i){if(s.fixed)return;var d=segDist(p,s).d;if(d<bd){bd=d;best=i}});return best}
  function segDist(p,s){var ax=s.b.x-s.a.x,ay=s.b.y-s.a.y,l=ax*ax+ay*ay||1,t=Math.max(0,Math.min(1,((p.x-s.a.x)*ax+(p.y-s.a.y)*ay)/l));var qx=s.a.x+ax*t,qy=s.a.y+ay*t;return{d:Math.hypot(p.x-qx,p.y-qy),qx:qx,qy:qy}}
  cv.addEventListener("pointerdown",function(e){var p=L.pos(cv,e,VW,VH);ptr=p;prev={x:p.x,y:p.y};try{cv.setPointerCapture(e.pointerId)}catch(err){}L.audio();
    if(tool==="ramp"){drawing={a:p,b:{x:p.x,y:p.y}};return}
    if(tool==="bomb"){boom(p.x,p.y);return}
    if(tool==="erase"){var si=nearestSeg(p);if(si!=null)S.splice(si,1);B=B.filter(function(b){return Math.hypot(b.x-p.x,b.y-p.y)>b.r+10});return}
    if(tool==="grab"){var g=null;B.forEach(function(b){if(Math.hypot(b.x-p.x,b.y-p.y)<b.r+8)g=b});grab=g;return}
    if(tool==="rain"){for(var i=0;i<25;i++)add(p.x+(Math.random()-.5)*200,-20-Math.random()*200,6+Math.random()*10);return}
    add(p.x,p.y,tool==="heavy"?26:tool==="vb"?22:10+Math.random()*14,tool);L.beep(500+Math.random()*300,0,.05,"sine",.04)});
  cv.addEventListener("pointermove",function(e){var p=L.pos(cv,e,VW,VH);prev=ptr;ptr=p;if(drawing)drawing.b=p});
  function up(){if(drawing){if(Math.hypot(drawing.b.x-drawing.a.x,drawing.b.y-drawing.a.y)>12){S.push(drawing);L.beep(300,500,.08,"triangle",.04)}drawing=null}if(grab){grab.vx=(ptr.x-prev.x)*60;grab.vy=(ptr.y-prev.y)*60;grab=null}}
  cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
  function step(dt){B.forEach(function(b){if(b===grab){b.x+=(ptr.x-b.x)*.5;b.y+=(ptr.y-b.y)*.5;b.vx=b.vy=0;return}b.vy+=900*grav*dt;b.vx+=wind*3*dt;b.vx*=.999;b.vy*=.999;b.x+=b.vx*dt;b.y+=b.vy*dt;b.rot+=b.vx*dt/b.r;if(b.y>VH+200||b.y<-600)b.dead=1});
    B=B.filter(function(b){return !b.dead});
    for(var it=0;it<3;it++){
      for(var i=0;i<B.length;i++)for(var j=i+1;j<B.length;j++){var a=B[i],b=B[j],dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),mn=a.r+b.r;if(d>0&&d<mn){var nx=dx/d,ny=dy/d,ov=mn-d,ta=b.m/(a.m+b.m),tb=a.m/(a.m+b.m);a.x-=nx*ov*ta;a.y-=ny*ov*ta;b.x+=nx*ov*tb;b.y+=ny*ov*tb;
        var rv=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rv<0){var e=Math.min(a.bounce,b.bounce),jj=-(1+e)*rv/(1/a.m+1/b.m);a.vx-=jj*nx/a.m;a.vy-=jj*ny/a.m;b.vx+=jj*nx/b.m;b.vy+=jj*ny/b.m}}}
      B.forEach(function(b){S.forEach(function(s){var r=segDist(b,s);if(r.d<b.r){var nx=(b.x-r.qx)/(r.d||1),ny=(b.y-r.qy)/(r.d||1);if(r.d===0){nx=0;ny=-1}b.x+=nx*(b.r-r.d);b.y+=ny*(b.r-r.d);var vn=b.vx*nx+b.vy*ny;if(vn<0){b.vx-=(1+b.bounce)*vn*nx;b.vy-=(1+b.bounce)*vn*ny;b.vx*=.995;if(vn<-260&&Math.random()<.3)L.beep(200+b.r*4,0,.03,"sine",Math.min(.05,-vn/12000))}}})})}}
  var last=0;function loop(t){raf=requestAnimationFrame(loop);var dt=Math.min(.025,(t-(last||t))/1000);last=t;if(slow)dt*=.25;var n=2;for(var k=0;k<n;k++)step(dt/n);
    c.fillStyle="#0b0b10";c.fillRect(0,0,VW,VH);c.strokeStyle="rgba(255,255,255,.035)";for(var x=0;x<VW;x+=30){c.beginPath();c.moveTo(x,0);c.lineTo(x,VH);c.stroke()}for(var y=0;y<VH;y+=30){c.beginPath();c.moveTo(0,y);c.lineTo(VW,y);c.stroke()}
    c.lineCap="round";S.forEach(function(s){if(s.fixed)return;c.strokeStyle="#c9c9d1";c.lineWidth=6;c.beginPath();c.moveTo(s.a.x,s.a.y);c.lineTo(s.b.x,s.b.y);c.stroke()});
    if(drawing){c.strokeStyle="#ff6a00";c.setLineDash([8,8]);c.lineWidth=4;c.beginPath();c.moveTo(drawing.a.x,drawing.a.y);c.lineTo(drawing.b.x,drawing.b.y);c.stroke();c.setLineDash([])}
    B.forEach(function(b){c.save();c.translate(b.x,b.y);c.rotate(b.rot);var g=c.createRadialGradient(-b.r*.35,-b.r*.35,1,0,0,b.r);g.addColorStop(0,"#fff");g.addColorStop(.25,b.k==="heavy"?"#555":b.c);g.addColorStop(1,b.k==="heavy"?"#1b1b22":b.c);c.fillStyle=g;c.beginPath();c.arc(0,0,b.r,0,7);c.fill();
      if(b.k==="vb"){c.fillStyle="#111";c.font="700 "+Math.round(b.r*.8)+"px Space Grotesk";c.textAlign="center";c.textBaseline="middle";c.fillText("VB",0,1)}else{c.strokeStyle="rgba(0,0,0,.25)";c.lineWidth=2;c.beginPath();c.moveTo(-b.r*.6,0);c.lineTo(b.r*.6,0);c.stroke()}c.restore();if(b===grab){c.strokeStyle="#fff";c.lineWidth=2;c.beginPath();c.arc(b.x,b.y,b.r+5,0,7);c.stroke()}});
    fx=fx.filter(function(f){f.t+=1/60;c.strokeStyle="rgba(255,154,60,"+(1-f.t*2)+")";c.lineWidth=6;c.beginPath();c.arc(f.x,f.y,f.t*440,0,7);c.stroke();return f.t<.5});
    root.querySelector("#phN").textContent=B.length+" objects"}
  demo();raf=requestAnimationFrame(loop);
  return function(){cancelAnimationFrame(raf)}
}});
