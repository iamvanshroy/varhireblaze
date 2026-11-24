/* VB Pixel Studio — pixel art editor with mirror, fill, eyedropper, undo, gallery and PNG export */
VBLab.reg("pixel",{mount:function(root,L){
  var N=32,CELL=16,PAL=["#000000","#ffffff","#ff6a00","#ff9a3c","#ffd23f","#ff3d5e","#a66bff","#3de8ff","#2bd46b","#9dff3d","#5b3a24","#f3dcc4","#8e8e99","#3a3a46","#1b1b22","transparent"];
  var grid,undo=[],color="#ff6a00",tool="pen",mirror=false,grid_on=true,down=false;
  function blank(){var g=[];for(var i=0;i<N*N;i++)g.push("transparent");return g}
  grid=L.ls("vb_pixel_draft",null)||blank();
  root.innerHTML='<div class="lab-pad"><div style="display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:20px" class="px-wrap">'+
    '<div><canvas class="lab-cv" id="pxcv" style="width:100%;max-width:560px;aspect-ratio:1;image-rendering:pixelated;cursor:crosshair"></canvas></div>'+
    '<div><div class="lab-h">Pixel Studio</div><p class="lab-mut" style="margin-bottom:14px">32 × 32 canvas. Your drawing autosaves on this device.</p>'+
    '<div id="pxpal" style="display:grid;grid-template-columns:repeat(8,1fr);gap:6px;margin-bottom:12px"></div>'+
    '<div class="lab-row" style="margin-bottom:10px"><label class="lab-mut">Custom <input type="color" id="pxcustom" value="#ff6a00" style="vertical-align:middle;width:40px;height:28px;border:0;background:none"></label></div>'+
    '<div class="lab-row" id="pxtools" style="margin-bottom:10px"><button class="lab-btn on" data-t="pen">✏️ Pen</button><button class="lab-btn" data-t="erase">🧽 Erase</button><button class="lab-btn" data-t="fill">🪣 Fill</button><button class="lab-btn" data-t="pick">💧 Pick</button></div>'+
    '<div class="lab-row" style="margin-bottom:10px"><button class="lab-btn" id="pxmirror">🪞 Mirror: off</button><button class="lab-btn" id="pxgrid">▦ Grid: on</button></div>'+
    '<div class="lab-row" style="margin-bottom:16px"><button class="lab-btn" id="pxundo">↶ Undo</button><button class="lab-btn" id="pxclear">🗑 Clear</button></div>'+
    '<div class="lab-row"><button class="lab-btn pri" id="pxsave">⭐ Save to gallery</button><button class="lab-btn" id="pxdl">⬇ PNG</button></div></div></div>'+
    '<div style="margin-top:28px"><div class="lab-h" style="font-size:20px">Your gallery</div><p class="lab-mut" style="margin-bottom:12px">Tap a drawing to keep editing it. Saved only on this device.</p><div id="pxgal" style="display:flex;gap:12px;flex-wrap:wrap"></div></div></div>'+
    '<style>@media(max-width:760px){.px-wrap{grid-template-columns:1fr!important}}.pxsw{aspect-ratio:1;border-radius:8px;border:2px solid #2a2a33;cursor:pointer}.pxsw.on{border-color:#fff;transform:scale(1.08)}</style>';
  var cv=root.querySelector("#pxcv"),S=N*CELL,c=L.fitCanvas(cv,S,S);
  var pal=root.querySelector("#pxpal");pal.innerHTML=PAL.map(function(p){return '<div class="pxsw" data-c="'+p+'" title="'+p+'" style="background:'+(p==="transparent"?"repeating-conic-gradient(#444 0 25%,#222 0 50%) 50%/10px 10px":p)+'"></div>'}).join("");
  function paintPal(){[].forEach.call(pal.children,function(d){d.classList.toggle("on",d.dataset.c===color)})}paintPal();
  pal.addEventListener("click",function(e){var d=e.target.closest("[data-c]");if(!d)return;color=d.dataset.c;if(tool==="erase"||tool==="pick")setTool("pen");paintPal()});
  root.querySelector("#pxcustom").addEventListener("input",function(e){color=e.target.value;paintPal()});
  function setTool(t){tool=t;[].forEach.call(root.querySelectorAll("#pxtools [data-t]"),function(b){b.classList.toggle("on",b.dataset.t===t)})}
  root.querySelector("#pxtools").addEventListener("click",function(e){var b=e.target.closest("[data-t]");if(b)setTool(b.dataset.t)});
  function draw(){c.clearRect(0,0,S,S);for(var y=0;y<N;y++)for(var x=0;x<N;x++){var v=grid[y*N+x];if(v==="transparent"){c.fillStyle=(x+y)%2?"#1a1a20":"#141419"}else c.fillStyle=v;c.fillRect(x*CELL,y*CELL,CELL,CELL)}
    if(grid_on){c.strokeStyle="rgba(255,255,255,.05)";c.lineWidth=1;for(var i=0;i<=N;i++){c.beginPath();c.moveTo(i*CELL,0);c.lineTo(i*CELL,S);c.stroke();c.beginPath();c.moveTo(0,i*CELL);c.lineTo(S,i*CELL);c.stroke()}}
    if(mirror){c.strokeStyle="rgba(255,106,0,.6)";c.setLineDash([6,6]);c.beginPath();c.moveTo(S/2,0);c.lineTo(S/2,S);c.stroke();c.setLineDash([])}
    L.ss("vb_pixel_draft",grid)}
  function snap(){undo.push(grid.slice());if(undo.length>60)undo.shift()}
  function set(x,y,v){if(x<0||y<0||x>=N||y>=N)return;grid[y*N+x]=v;if(mirror)grid[y*N+(N-1-x)]=v}
  function fill(x,y,v){var t=grid[y*N+x];if(t===v)return;var st=[[x,y]];while(st.length){var p=st.pop(),i=p[1]*N+p[0];if(p[0]<0||p[1]<0||p[0]>=N||p[1]>=N||grid[i]!==t)continue;grid[i]=v;st.push([p[0]+1,p[1]],[p[0]-1,p[1]],[p[0],p[1]+1],[p[0],p[1]-1])}}
  function act(e,first){var p=L.pos(cv,e,N,N),x=Math.floor(p.x),y=Math.floor(p.y);if(x<0||y<0||x>=N||y>=N)return;
    if(tool==="pick"){color=grid[y*N+x];setTool("pen");paintPal();return}
    if(tool==="fill"){if(first){snap();fill(x,y,color);if(mirror)fill(N-1-x,y,color);L.beep(400,800,.06,"triangle",.05)}draw();return}
    set(x,y,tool==="erase"?"transparent":color);draw()}
  cv.addEventListener("pointerdown",function(e){down=true;try{cv.setPointerCapture(e.pointerId)}catch(err){}if(tool!=="fill"&&tool!=="pick")snap();act(e,true)});
  cv.addEventListener("pointermove",function(e){if(down&&tool!=="fill"&&tool!=="pick")act(e,false)});
  function up(){down=false}cv.addEventListener("pointerup",up);cv.addEventListener("pointercancel",up);
  root.querySelector("#pxmirror").onclick=function(){mirror=!mirror;this.textContent="🪞 Mirror: "+(mirror?"on":"off");this.classList.toggle("on",mirror);draw()};
  root.querySelector("#pxgrid").onclick=function(){grid_on=!grid_on;this.textContent="▦ Grid: "+(grid_on?"on":"off");draw()};
  root.querySelector("#pxundo").onclick=function(){if(undo.length){grid=undo.pop();draw()}};
  root.querySelector("#pxclear").onclick=function(){snap();grid=blank();draw()};
  function toPNG(scale){var o=document.createElement("canvas");o.width=N*scale;o.height=N*scale;var x=o.getContext("2d");for(var i=0;i<N*N;i++){if(grid[i]!=="transparent"){x.fillStyle=grid[i];x.fillRect((i%N)*scale,((i/N)|0)*scale,scale,scale)}}return o.toDataURL("image/png")}
  root.querySelector("#pxdl").onclick=function(){var a=document.createElement("a");a.href=toPNG(16);a.download="vb-pixel-art.png";a.click();L.toast("Saved as a 512×512 PNG")};
  function gal(){var g=L.ls("vb_pixel_gallery",[]),el=root.querySelector("#pxgal");if(!g.length){el.innerHTML='<p class="lab-mut">Nothing saved yet.</p>';return}
    el.innerHTML=g.map(function(it,i){return '<div style="text-align:center"><img src="'+it.png+'" data-i="'+i+'" style="width:96px;height:96px;image-rendering:pixelated;border-radius:12px;border:1px solid #2a2a33;background:#141419;cursor:pointer"><br><button class="lab-btn" data-del="'+i+'" style="margin-top:6px;padding:4px 10px;font-size:12px">Delete</button></div>'}).join("")}
  root.querySelector("#pxgal").addEventListener("click",function(e){var g=L.ls("vb_pixel_gallery",[]);var im=e.target.closest("[data-i]"),dl=e.target.closest("[data-del]");if(im){snap();grid=g[+im.dataset.i].grid.slice();draw();window.scrollTo(0,0)}if(dl){g.splice(+dl.dataset.del,1);L.ss("vb_pixel_gallery",g);gal()}});
  root.querySelector("#pxsave").onclick=function(){var g=L.ls("vb_pixel_gallery",[]);g.unshift({grid:grid.slice(),png:toPNG(4)});L.ss("vb_pixel_gallery",g.slice(0,24));gal();L.beep(660,1320,.12,"triangle",.06);
    var first=!L.ls("vb_pixel_first",false);if(first){L.ss("vb_pixel_first",true);L.coins.add(10);L.toast("First artwork saved! +10 🪙")}else L.toast("Saved to your gallery")};
  draw();gal();
  return function(){}
}});
