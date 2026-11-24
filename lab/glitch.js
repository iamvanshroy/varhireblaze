/* VB Reality Glitch — six interactive illusions, each drawn from scratch, each with a "show me" reveal. */
VBLab.reg("glitch",{mount:function(root,L){
  var W=640,H=420,raf=0,cur=0,reveal=false,t0=performance.now(),ml=0.5,after={phase:"ready",t:0};
  var IL=[
   {n:"Tilted Bricks",d:"Every grey line here is perfectly horizontal. The shifted rows of tiles trick your brain into seeing wedges.",r:"Show the rulers"},
   {n:"The Vanishing Dot",d:"Stare at the + for 15 seconds. The pink dots disappear, and a green dot starts running in a circle.",r:"Stop the gaps"},
   {n:"Fair Lengths",d:"Drag the slider until the two shafts look equal. Then check how far off your eyes were.",r:"Check my answer"},
   {n:"Drifting Rings",d:"Nothing here moves, but the rings seem to creep around when you look away from them. It works best in your side vision.",r:"Remove the shading"},
   {n:"Ghost Flag",d:"Stare at the dot in the middle until the timer ends. When it switches to white, you'll see the real colours for a few seconds.",r:"Start the stare"},
   {n:"Same Grey",d:"The two small squares are exactly the same grey. The background changes how bright they look.",r:"Hide the background"}];
  root.innerHTML='<div class="lab-pad"><div class="lab-h">Reality Glitch</div><p class="lab-mut" style="margin-bottom:14px">Six optical illusions, all drawn live in your browser. Your eyes aren\'t broken. Your brain is just guessing.</p>'+
   '<div class="lab-row" id="rgTabs" style="margin-bottom:12px">'+IL.map(function(x,i){return '<button class="lab-btn" data-i="'+i+'">'+(i+1)+'. '+x.n+'</button>'}).join("")+'</div>'+
   '<div style="display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:18px" class="rg-w"><canvas class="lab-cv" id="rgcv" style="width:100%;aspect-ratio:640/420;background:#fff"></canvas>'+
   '<div class="lab-card"><b id="rgN" style="font-size:20px"></b><p class="lab-mut" id="rgD" style="margin:8px 0 14px"></p><div id="rgX"></div><button class="lab-btn pri" id="rgR"></button><p class="lab-mut" id="rgO" style="margin-top:12px;font-size:13px"></p></div></div></div>'+
   '<style>@media(max-width:780px){.rg-w{grid-template-columns:1fr!important}}</style>';
  var cv=root.querySelector("#rgcv"),c=L.fitCanvas(cv,W,H);
  function sel(i){cur=i;reveal=false;t0=performance.now();after={phase:"ready",t:0};ml=.3+Math.random()*.4;var x=IL[i];root.querySelector("#rgN").textContent=x.n;root.querySelector("#rgD").textContent=x.d;root.querySelector("#rgR").textContent=x.r;root.querySelector("#rgO").textContent="";
    root.querySelectorAll("#rgTabs [data-i]").forEach(function(b){b.classList.toggle("on",+b.dataset.i===i)});
    root.querySelector("#rgX").innerHTML=i===2?'<input type="range" id="rgS" min="0" max="100" value="'+Math.round(ml*100)+'" style="width:100%;accent-color:#ff6a00;margin-bottom:12px">':"";
    var s=root.querySelector("#rgS");if(s)s.oninput=function(){ml=s.value/100;reveal=false;root.querySelector("#rgO").textContent=""};
    var seen=L.ls("vb_glitch_seen",{});seen[i]=1;L.ss("vb_glitch_seen",seen);if(Object.keys(seen).length===6)L.secret("glitch6","Seen Through It (all 6 illusions)")}
  root.querySelector("#rgTabs").onclick=function(e){var b=e.target.closest("[data-i]");if(b)sel(+b.dataset.i)};
  root.querySelector("#rgR").onclick=function(){if(cur===4){after={phase:"stare",t:performance.now()};this.textContent="Staring… keep still";return}reveal=!reveal;this.textContent=reveal?"Hide":IL[cur].r;
    if(cur===2){var a=120+ml*160,b=230;var off=Math.round(Math.abs(a-b));root.querySelector("#rgO").innerHTML=reveal?(off<6?"🎯 Almost perfect: off by "+off+" px. Your brain resisted!":"You were off by <b>"+off+" px</b>. The arrow fins make the top line look "+(a>b?"shorter":"longer")+" than it is."):""}};
  function bricks(t){c.fillStyle="#fff";c.fillRect(0,0,W,H);var rows=9,h=H/rows,tw=58;for(var r=0;r<rows;r++){var off=[0,14,28,14][r%4];for(var x=-tw*2;x<W+tw;x+=tw*2){c.fillStyle="#111";c.fillRect(x+off,r*h,tw,h)}c.fillStyle="#8a8a8a";c.fillRect(0,(r+1)*h-1.5,W,3)}
    if(reveal){c.strokeStyle="#ff6a00";c.lineWidth=2;for(r=1;r<rows;r++){c.beginPath();c.moveTo(0,r*h);c.lineTo(W,r*h);c.stroke()}}}
  function chaser(t){c.fillStyle="#bdbdbd";c.fillRect(0,0,W,H);var n=12,cx=W/2,cy=H/2,R=150,miss=Math.floor(t/110)%n;for(var i=0;i<n;i++){if(i===miss&&!reveal)continue;var a=i/n*Math.PI*2,x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R;var g=c.createRadialGradient(x,y,0,x,y,30);g.addColorStop(0,"rgba(214,120,214,.95)");g.addColorStop(1,"rgba(214,120,214,0)");c.fillStyle=g;c.beginPath();c.arc(x,y,30,0,7);c.fill()}
    c.strokeStyle="#000";c.lineWidth=2;c.beginPath();c.moveTo(cx-8,cy);c.lineTo(cx+8,cy);c.moveTo(cx,cy-8);c.lineTo(cx,cy+8);c.stroke()}
  function arrows(){c.fillStyle="#fff";c.fillRect(0,0,W,H);var a=120+ml*160,b=230,cx=W/2;function line(len,y,inward){var x1=cx-len/2,x2=cx+len/2;c.strokeStyle="#111";c.lineWidth=5;c.lineCap="round";c.beginPath();c.moveTo(x1,y);c.lineTo(x2,y);var f=26,d=inward?1:-1;c.moveTo(x1,y);c.lineTo(x1+f*d,y-f);c.moveTo(x1,y);c.lineTo(x1+f*d,y+f);c.moveTo(x2,y);c.lineTo(x2-f*d,y-f);c.moveTo(x2,y);c.lineTo(x2-f*d,y+f);c.stroke();
      if(reveal){c.strokeStyle="#ff6a00";c.lineWidth=2;c.setLineDash([5,5]);c.beginPath();c.moveTo(x1,30);c.lineTo(x1,H-30);c.moveTo(x2,30);c.lineTo(x2,H-30);c.stroke();c.setLineDash([])}}
    line(a,140,true);line(b,290,false);c.fillStyle="#888";c.font="600 14px Inter";c.textAlign="center";c.fillText("Make the top line the same length as the bottom one",W/2,H-20)}
  function drift(){c.fillStyle="#7a7a7a";c.fillRect(0,0,W,H);var cols=reveal?["#7a7a7a","#7a7a7a","#7a7a7a","#7a7a7a"]:["#111","#3a6ea5","#fff","#e0b400"];
    [[170,210],[470,210]].forEach(function(o,k){for(var ring=0;ring<5;ring++){var r1=150-ring*28,r0=r1-24,n=16+ring*-2,dir=(ring+k)%2?1:-1;for(var s=0;s<n;s++){var a0=s/n*Math.PI*2,a1=(s+1)/n*Math.PI*2;var seg=4;for(var q=0;q<seg;q++){c.fillStyle=cols[(dir>0?q:seg-1-q)];c.beginPath();var b0=a0+(a1-a0)*q/seg,b1=a0+(a1-a0)*(q+1)/seg;c.arc(o[0],o[1],r1,b0,b1);c.arc(o[0],o[1],r0,b1,b0,true);c.fill()}}}
      c.fillStyle=reveal?"#7a7a7a":"#ff6a00";c.beginPath();c.arc(o[0],o[1],22,0,7);c.fill()})}
  function flag(t){var now=performance.now(),el=(now-after.t)/1000;
    if(after.phase==="stare"&&el>=18){after.phase="white";after.t=now;L.beep(880,0,.2,"sine",.05);root.querySelector("#rgR").textContent="Look again"}
    if(after.phase==="white"){c.fillStyle="#fff";c.fillRect(0,0,W,H);c.fillStyle="#000";c.beginPath();c.arc(W/2,H/2,4,0,7);c.fill();if(el>8){after.phase="ready";root.querySelector("#rgR").textContent=IL[4].r;root.querySelector("#rgO").textContent="Did you see an orange, white and black flag? That was your eyes, not the screen."}return}
    var w=W*0.7,h=H*0.6,x=(W-w)/2,y=(H-h)/2;c.fillStyle="#fff";c.fillRect(0,0,W,H);
    c.fillStyle="#0095ff";c.fillRect(x,y,w,h/3);c.fillStyle="#000";c.fillRect(x,y+h/3,w,h/3);c.fillStyle="#fff";c.fillRect(x,y+2*h/3,w,h/3);c.strokeStyle="#ddd";c.strokeRect(x,y,w,h);
    c.fillStyle="#00f0ff";c.beginPath();c.arc(W/2,H/2,5,0,7);c.fill();c.fillStyle="#000";c.beginPath();c.arc(W/2,H/2,2,0,7);c.fill();
    if(after.phase==="stare"){c.fillStyle="#333";c.font="700 18px Inter";c.textAlign="center";c.fillText(Math.ceil(18-el)+"",W/2,y-14)}}
  function grey(){var g=c.createLinearGradient(0,0,W,0);g.addColorStop(0,"#111");g.addColorStop(1,"#eee");c.fillStyle=reveal?"#9a9a9a":g;c.fillRect(0,0,W,H);c.fillStyle="#808080";c.fillRect(110,160,100,100);c.fillRect(430,160,100,100);
    if(reveal){c.fillStyle="#111";c.font="600 14px Inter";c.textAlign="center";c.fillText("#808080",160,290);c.fillText("#808080",480,290)}}
  function loop(){raf=requestAnimationFrame(loop);var t=performance.now()-t0;[bricks,chaser,arrows,drift,flag,grey][cur](t)}
  sel(0);raf=requestAnimationFrame(loop);
  return function(){cancelAnimationFrame(raf)}
}});
