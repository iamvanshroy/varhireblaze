/* Daily Brain Challenge — memory, logic and speed; same puzzles for everyone each day; streaks. */
VBLab.reg("brain",{mount:function(root,L){
  var day=L.today(),R=L.rng("vb-brain-"+day),KEY="vb_brain",st=L.ls(KEY,{days:{},streak:0,lastDay:""}),today=st.days[day]||{},timers=[];
  function T(f,ms){var id=setTimeout(f,ms);timers.push(id);return id}
  /* puzzles for today, all generated from the date seed */
  var COL=["#ff6a00","#3de8ff","#2bd46b","#a66bff"],seq=[];for(var i=0;i<12;i++)seq.push(Math.floor(R()*4));
  function pattern(){var k=Math.floor(R()*4),a=2+Math.floor(R()*9),d=2+Math.floor(R()*7),s=[];
    if(k===0)for(var i=0;i<5;i++)s.push(a+d*i);else if(k===1){var r=2+Math.floor(R()*2);for(i=0;i<5;i++)s.push(a*Math.pow(r,i))}
    else if(k===2){s=[a,a+d];for(i=2;i<5;i++)s.push(s[i-1]+s[i-2])}else{for(i=0;i<5;i++)s.push((i+a%4+1)*(i+a%4+1)+d)}
    var ans=s.pop(),opts=[ans,ans+d,ans-Math.max(1,Math.floor(d/2)),ans+2*d+1].sort(function(){return R()-.5});return{q:s,ans:ans,opts:opts}}
  var logic=[pattern(),pattern(),pattern(),pattern(),pattern()];
  var math=[];for(i=0;i<40;i++){var x=2+Math.floor(R()*12),y=2+Math.floor(R()*12),op=["+","−","×"][Math.floor(R()*3)];math.push({q:x+" "+op+" "+y,a:op==="+"?x+y:op==="−"?x-y:x*y})}
  root.innerHTML='<div class="lab-pad" style="max-width:760px"><div class="lab-row" style="justify-content:space-between;margin-bottom:16px"><div><div class="lab-h">Daily Brain Challenge</div><p class="lab-mut">'+day+' · the same three tests for everyone today.</p></div><span class="coinpill" style="background:rgba(255,106,0,.12);border-color:rgba(255,106,0,.4);color:#ff9a3c">🔥 <span id="brStreak">'+st.streak+'</span> day streak</span></div><div id="brMain"></div></div>'+
   '<style>.br-tests{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}@media(max-width:600px){.br-tests{grid-template-columns:1fr}}.br-t{text-align:left;cursor:pointer;color:#fff;font:inherit}.br-t:disabled{cursor:default;opacity:.85}.br-pad{width:100%;aspect-ratio:1;border-radius:20px;border:0;cursor:pointer;opacity:.35;transition:opacity .12s,transform .12s}.br-pad.lit{opacity:1;transform:scale(1.04);box-shadow:0 0 30px currentColor}.br-big{font:700 44px Space Grotesk;text-align:center;margin:18px 0}</style>';
  var M=root.querySelector("#brMain");
  function total(){return (today.memory||0)+(today.logic||0)+(today.speed||0)}
  function done(){return today.memory!=null&&today.logic!=null&&today.speed!=null}
  function save(){st.days[day]=today;if(done()&&st.lastDay!==day){var y=new Date();y.setDate(y.getDate()-1);var yk=y.getFullYear()+"-"+("0"+(y.getMonth()+1)).slice(-2)+"-"+("0"+y.getDate()).slice(-2);st.streak=st.lastDay===yk?st.streak+1:1;st.lastDay=day;L.coins.add(20+Math.min(30,st.streak*5));L.toast("🧠 Daily challenge done! +"+(20+Math.min(30,st.streak*5))+" 🪙");root.querySelector("#brStreak").textContent=st.streak}
    var keys=Object.keys(st.days).sort();while(keys.length>40)delete st.days[keys.shift()];L.ss(KEY,st)}
  function home(){var tests=[["memory","🟧","Memory","Repeat the colour pattern. It grows each round."],["logic","🔢","Logic","Five number patterns. Find what comes next."],["speed","⚡","Speed","Quick maths. Answer as many as you can in 30 seconds."]];
    M.innerHTML='<div class="br-tests">'+tests.map(function(t){var sc=today[t[0]];return '<button class="lab-card br-t" data-test="'+t[0]+'"'+(sc!=null?" disabled":"")+'><div style="font-size:30px">'+t[1]+'</div><b style="font-size:18px">'+t[2]+'</b><p class="lab-mut" style="font-size:13px;margin:4px 0 10px">'+t[3]+'</p>'+(sc!=null?'<b style="color:#2bd46b">'+sc+' / 1000 ✓</b>':'<span style="color:#ff9a3c;font-weight:600">Start ›</span>')+'</button>'}).join("")+'</div>'+
      (done()?'<div class="lab-card" style="margin-top:16px;text-align:center"><div class="lab-mut">Today\'s brain score</div><div class="br-big" style="color:#ff9a3c">'+total()+'</div><button class="lab-btn pri" id="brCopy">📋 Copy my result</button><p class="lab-mut" style="margin-top:10px">Come back tomorrow for new puzzles and keep your streak.</p></div>':'')+
      '<div class="lab-card" style="margin-top:16px"><b>🌍 Today\'s top 10</b><div id="brBoard" style="margin-top:10px"></div></div>';
    M.querySelectorAll("[data-test]").forEach(function(b){b.onclick=function(){({memory:memory,logic:logicT,speed:speed})[b.dataset.test]()}});
    var cp=M.querySelector("#brCopy");if(cp)cp.onclick=function(){var bar=function(v){return v>=800?"🟩":v>=500?"🟨":"🟥"};var txt="VB Brain "+day+"\n🧠 "+total()+"/3000 "+bar(today.memory)+bar(today.logic)+bar(today.speed)+"\n🔥 "+st.streak+" day streak\nvarhireblaze.com/lab.html#brain";try{navigator.clipboard.writeText(txt);L.toast("Result copied. Paste it anywhere!")}catch(e){prompt("Copy your result:",txt)}};
    L.board(M.querySelector("#brBoard"),"brain",done()?total():0,function(v){return v})}
  function memory(){var round=3,pos=0,input=false;
    M.innerHTML='<div class="lab-card" style="max-width:420px;margin:0 auto;text-align:center"><b>Memory</b><p class="lab-mut" id="brMs">Watch the pattern…</p><div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px">'+COL.map(function(c,i){return '<button class="br-pad" data-p="'+i+'" style="background:'+c+';color:'+c+'"></button>'}).join("")+'</div></div>';
    var pads=M.querySelectorAll("[data-p]"),ms=M.querySelector("#brMs");
    function flash(i,d){pads[i].classList.add("lit");L.beep(300+i*120,0,.25,"triangle",.06);T(function(){pads[i].classList.remove("lit")},d)}
    function show(){input=false;pos=0;ms.textContent="Round "+(round-2)+": watch…";var sp=Math.max(320,600-round*25);for(var k=0;k<round;k++)(function(k){T(function(){flash(seq[k],sp*.7)},500+k*sp)})(k);T(function(){input=true;ms.textContent="Your turn"},500+round*sp)}
    pads.forEach(function(p){p.onclick=function(){if(!input)return;var i=+p.dataset.p;flash(i,180);if(i!==seq[pos]){input=false;finish();return}pos++;if(pos===round){input=false;if(round===12){finish(true);return}round++;ms.textContent="Nice!";T(show,700)}}});
    function finish(all){var sc=Math.round(((all?12:round-1)-2)/10*1000);sc=Math.max(0,Math.min(1000,sc));today.memory=sc;save();L.beep(all?880:200,all?1320:100,.3,"triangle",.06);ms.innerHTML="You remembered <b>"+(all?12:round-1)+"</b> steps. Score: <b>"+sc+"</b>";T(home,1800)}
    T(show,400)}
  function logicT(){var i=0,right=0,t0=performance.now();
    function q(){var p=logic[i];M.innerHTML='<div class="lab-card" style="max-width:520px;margin:0 auto;text-align:center"><b>Logic · '+(i+1)+' / 5</b><div class="br-big">'+p.q.join(", ")+', <span style="color:#ff9a3c">?</span></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'+p.opts.map(function(o){return '<button class="lab-btn" style="font-size:20px;padding:14px" data-o="'+o+'">'+o+'</button>'}).join("")+'</div></div>';
      M.querySelectorAll("[data-o]").forEach(function(b){b.onclick=function(){var ok=+b.dataset.o===p.ans;b.style.background=ok?"#2bd46b":"#ff3d5e";L.beep(ok?660:200,ok?990:120,.15,"triangle",.05);if(ok)right++;i++;T(i<5?q:end,450)}})}
    function end(){var secs=(performance.now()-t0)/1000,bonus=Math.max(0,Math.round((60-secs)*3));var sc=Math.min(1000,right*170+(right===5?bonus:Math.round(bonus/3)));today.logic=sc;save();M.innerHTML='<div class="lab-card" style="text-align:center"><div class="br-big">'+right+' / 5</div><p class="lab-mut">in '+secs.toFixed(1)+'s · Score <b>'+sc+'</b></p></div>';T(home,1800)}
    q()}
  function speed(){var i=0,right=0,end=performance.now()+30000,iv;
    M.innerHTML='<div class="lab-card" style="max-width:420px;margin:0 auto;text-align:center"><b>Speed</b> <span class="lab-mut" id="brT">30</span><div class="br-big" id="brQ"></div><form id="brF"><input class="lab-in" id="brA" inputmode="numeric" autocomplete="off" style="font-size:24px;text-align:center;width:160px"></form><p class="lab-mut" style="margin-top:10px">Correct: <b id="brR">0</b> · press Enter</p></div>';
    var qe=M.querySelector("#brQ"),a=M.querySelector("#brA");function show(){qe.textContent=math[i%40].q+" ="}show();a.focus();
    M.querySelector("#brF").onsubmit=function(e){e.preventDefault();var v=parseInt(a.value.replace("−","-"),10);if(v===math[i%40].a){right++;L.beep(700,1000,.06,"square",.03)}else L.beep(180,0,.08,"sawtooth",.03);i++;a.value="";M.querySelector("#brR").textContent=right;show()};
    a.addEventListener("input",function(){if(parseInt(a.value,10)===math[i%40].a)M.querySelector("#brF").requestSubmit?M.querySelector("#brF").requestSubmit():M.querySelector("#brF").onsubmit(new Event("submit"))});
    iv=setInterval(function(){var left=Math.max(0,Math.ceil((end-performance.now())/1000));var te=M.querySelector("#brT");if(te)te.textContent=left+"s";if(left<=0){clearInterval(iv);var sc=Math.min(1000,right*60);today.speed=sc;save();M.innerHTML='<div class="lab-card" style="text-align:center"><div class="br-big">'+right+' correct</div><p class="lab-mut">Score <b>'+sc+'</b></p></div>';T(home,1800)}},200);timers.push(iv)}
  home();
  return function(){timers.forEach(function(x){clearTimeout(x);clearInterval(x)})}
}});
