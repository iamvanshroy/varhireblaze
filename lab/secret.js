/* VB Secret Internet — the list of hidden secrets around the site, with hints. */
VBLab.reg("secret",{mount:function(root,L){
  var S=[["konami","The Classic Code","A famous button sequence from old consoles works anywhere on this site. ↑ ↑ …"],
    ["logo","Logo Tapper","Our logo really likes attention. Tap it lots, quickly."],
    ["vansh","Say My Name","Type the name of the person who built VarHireBlaze (no text box needed)."],
    ["console","Console Whisperer","Developers: open your browser console on any page."],
    ["hireme","Hire Me Please","Type what every job seeker wants to say, as one word."],
    ["views","Counter Curious","Something at the top of the homepage counts. Click it three times."],
    ["night","Night Owl","Visit between midnight and 4 AM."],
    ["reader","Deep Reader","Read a blog post all the way to the very end."],
    ["vault","The Vault","There's a page called vb-vault that isn't linked anywhere."],
    ["lab15","Lab Rat","Open every single VB Lab experience."],
    ["glitch6","Seen Through It","Try all six illusions in Reality Glitch."],
    ["museum5","Museum Regular","Visit every room of the Dead Internet Museum."],
    ["sixty10","Universe Tourist","Catch every world in the 60-Second Universe."],
    ["boom25","Demolition Expert","Set off 25 explosions in the Physics Playground."],
    ["cards36","Completionist","Collect all 36 VB Trading Cards."]];
  var f=L.ls("vb_secrets",{}),n=S.filter(function(s){return f[s[0]]}).length;
  root.innerHTML='<div class="lab-pad" style="max-width:820px"><div class="lab-h">Secret Internet</div><p class="lab-mut">VarHireBlaze is full of hidden things. Each secret you find is worth <b style="color:#ffd23f">25 🪙</b>. Found secrets are saved on this device.</p>'+
   '<div class="lab-card" style="margin:18px 0;display:flex;align-items:center;gap:18px"><div style="font:700 46px Space Grotesk;color:#ffd23f">'+n+'<span style="font-size:22px;color:#8e8e99">/'+S.length+'</span></div><div style="flex:1"><div style="height:10px;background:#1b1b22;border-radius:9px;overflow:hidden"><div style="height:100%;width:'+(n/S.length*100)+'%;background:linear-gradient(90deg,#ff6a00,#ffd23f);border-radius:9px"></div></div><p class="lab-mut" style="margin-top:8px;font-size:13px">'+(n===S.length?"You found everything. Legend. 🏆":"Hints are below. Some are sneakier than others.")+'</p></div></div>'+
   '<div style="display:grid;gap:10px">'+S.map(function(s){var ok=f[s[0]];return '<div class="lab-card" style="display:flex;gap:14px;align-items:center;padding:14px 16px;'+(ok?"border-color:rgba(255,210,63,.45)":"")+'"><div style="font-size:24px">'+(ok?"🗝️":"🔒")+'</div><div><b>'+(ok?s[1]:"???")+'</b><div class="lab-mut" style="font-size:13px">'+s[2]+'</div></div>'+(ok?'<span class="lab-mut" style="margin-left:auto;font-size:12px">'+new Date(f[s[0]]).toLocaleDateString()+'</span>':'')+'</div>'}).join("")+'</div></div>';
  return function(){}
}});
