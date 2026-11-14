const $=id=>document.getElementById(id);
const canvas=$("board"),ctx=canvas.getContext("2d");
let mode="ai",turn=0,scores=[0,0],pieces=[],striker=null,drag=null,aim=null,anim=false,queenPotted=false,sound=true,matchOver=false;
const W=800,C={wood:"#b9783e",inner:"#e7c58d",line:"#7c3d22",pocket:"#241710"};
function reset(){
 turn=0;scores=[0,0];queenPotted=false;matchOver=false;pieces=[];
 const cx=400,cy=400;
 pieces.push({x:cx,y:cy,r:17,type:"queen",color:"#b83c35",alive:true});
 for(let i=0;i<6;i++){let a=i*Math.PI/3;pieces.push({x:cx+36*Math.cos(a),y:cy+36*Math.sin(a),r:16,type:"black",color:"#282b2b",alive:true});}
 for(let i=0;i<6;i++){let a=i*Math.PI/3+Math.PI/6;pieces.push({x:cx+70*Math.cos(a),y:cy+70*Math.sin(a),r:16,type:"white",color:"#f2e7d0",alive:true});}
 for(let i=0;i<12;i++){let a=i*Math.PI/6;pieces.push({x:cx+105*Math.cos(a),y:cy+105*Math.sin(a),r:15,type:i%2?"black":"white",color:i%2?"#282b2b":"#f2e7d0",alive:true});}
 striker={x:400,y:690,r:21,vx:0,vy:0,alive:true};updateUI();draw();
}
function board(){
 ctx.clearRect(0,0,W,W);ctx.fillStyle="#81502e";ctx.fillRect(0,0,W,W);
 let g=ctx.createLinearGradient(40,40,760,760);g.addColorStop(0,"#f2d6a4");g.addColorStop(.5,"#d9ad70");g.addColorStop(1,"#c18a52");ctx.fillStyle=g;ctx.fillRect(48,48,704,704);
 ctx.strokeStyle="#733e25";ctx.lineWidth=9;ctx.strokeRect(75,75,650,650);
 ctx.strokeStyle="#9a5731";ctx.lineWidth=3;ctx.strokeRect(100,100,600,600);
 ctx.lineWidth=4;ctx.strokeStyle="#8a4428";
 [170,630].forEach(y=>{ctx.beginPath();ctx.moveTo(170,y);ctx.lineTo(630,y);ctx.stroke();[170,630].forEach(x=>{ctx.beginPath();ctx.arc(x,y,13,0,Math.PI*2);ctx.stroke();});});
 [170,630].forEach(x=>{ctx.beginPath();ctx.moveTo(x,170);ctx.lineTo(x,630);ctx.stroke();});
 ctx.beginPath();ctx.arc(400,400,125,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.arc(400,400,38,0,Math.PI*2);ctx.stroke();
 [[120,120,1,1],[680,120,-1,1],[120,680,1,-1],[680,680,-1,-1]].forEach(([x,y,sx,sy])=>{ctx.beginPath();ctx.arc(x,y,30,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.moveTo(x+sx*18,y);ctx.lineTo(x+sx*44,y);ctx.moveTo(x,y+sy*18);ctx.lineTo(x,y+sy*44);ctx.stroke();});
 [[90,90],[710,90],[90,710],[710,710]].forEach(([x,y])=>{ctx.beginPath();ctx.arc(x,y,31,0,Math.PI*2);ctx.fillStyle=C.pocket;ctx.fill();ctx.beginPath();ctx.arc(x,y,36,0,Math.PI*2);ctx.strokeStyle="#6c3a23";ctx.lineWidth=5;ctx.stroke();});
}
function disc(p){
 if(!p||!p.alive)return;
 ctx.save();ctx.shadowColor="#4c2b18aa";ctx.shadowBlur=8;ctx.shadowOffsetY=4;
 let gr=ctx.createRadialGradient(p.x-p.r*.35,p.y-p.r*.4,2,p.x,p.y,p.r);gr.addColorStop(0,p.type==="black"?"#777":"#fff");gr.addColorStop(.45,p.color);gr.addColorStop(1,p.type==="black"?"#101313":p.type==="queen"?"#651d1a":"#b9a98e");
 ctx.fillStyle=gr;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.strokeStyle=p.type==="queen"?"#f4c36b":"#725239";ctx.lineWidth=2;ctx.stroke();
 ctx.beginPath();ctx.arc(p.x,p.y,p.r*.62,0,Math.PI*2);ctx.strokeStyle="#ffffff55";ctx.lineWidth=2;ctx.stroke();ctx.restore();
}
function draw(){
 board();pieces.forEach(disc);disc(striker);
 if(drag&&aim){ctx.save();ctx.strokeStyle="#fff7";ctx.lineWidth=4;ctx.setLineDash([10,10]);ctx.beginPath();ctx.moveTo(striker.x,striker.y);ctx.lineTo(striker.x+(striker.x-aim.x)*1.5,striker.y+(striker.y-aim.y)*1.5);ctx.stroke();ctx.restore();}
}
function updateUI(){
 $("p1score").textContent=scores[0]+" POINTS";$("p2score").textContent=scores[1]+" POINTS";
 $("p1name").textContent="PLAYER 1";$("p2name").textContent=mode==="ai"?"CPU":"PLAYER 2";
 $("turnLabel").textContent=turn===0?"PLAYER 1 TURN":(mode==="ai"?"CPU TURN":"PLAYER 2 TURN");
 $("p1").classList.toggle("active",turn===0);$("p2").classList.toggle("active",turn===1);
 $("status").textContent=turn===0?"Your turn — line up the striker":(mode==="ai"?"Computer is playing…":"Player 2 — line up the striker");
}
function pocket(p){return [[90,90],[710,90],[90,710],[710,710]].some(([x,y])=>Math.hypot(p.x-x,p.y-y)<34);}
function step(){
 let moving=false,all=[...pieces,striker];
 for(let p of all){if(!p||!p.alive)continue;if(Math.abs(p.vx||0)>.05||Math.abs(p.vy||0)>.05)moving=true;p.x+=p.vx||0;p.y+=p.vy||0;p.vx=(p.vx||0)*.986;p.vy=(p.vy||0)*.986;
 if(p.x<116+p.r){p.x=116+p.r;p.vx=Math.abs(p.vx)*.82;}if(p.x>684-p.r){p.x=684-p.r;p.vx=-Math.abs(p.vx)*.82;}if(p.y<116+p.r){p.y=116+p.r;p.vy=Math.abs(p.vy)*.82;}if(p.y>684-p.r){p.y=684-p.r;p.vy=-Math.abs(p.vy)*.82;}
 if(pocket(p)){if(p===striker){p.x=400;p.y=turn===0?690:110;p.vx=p.vy=0;}else{p.alive=false;scores[turn]+=p.type==="queen"?3:1;if(p.type==="queen")queenPotted=true;}}
 }
 for(let i=0;i<all.length;i++)for(let j=i+1;j<all.length;j++){let a=all[i],b=all[j];if(!a?.alive||!b?.alive)continue;let dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy),min=a.r+b.r;if(d>0&&d<min){let nx=dx/d,ny=dy/d,over=min-d;a.x-=nx*over/2;a.y-=ny*over/2;b.x+=nx*over/2;b.y+=ny*over/2;let rel=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;if(rel<0){let impulse=rel*.92;a.vx+=impulse*nx;a.vy+=impulse*ny;b.vx-=impulse*nx;b.vy-=impulse*ny;}}}
 draw();if(moving){requestAnimationFrame(step);}else{anim=false;finishTurn();}
}
function finishTurn(){
 if(pieces.filter(p=>p.alive&&p.type!=="queen").length===0){updateUI();endGame();return;}
 turn=1-turn;
 striker.x=400;striker.y=turn===0?690:110;striker.vx=0;striker.vy=0;
 updateUI();draw();
 if(mode==="ai"&&turn===1&&!matchOver)setTimeout(cpuMove,700);
}
function shoot(dx,dy){
 let power=Math.min(22,Math.hypot(dx,dy)*.12);if(power<1.2)return;
 striker.vx=dx/Math.max(1,Math.hypot(dx,dy))*power;striker.vy=dy/Math.max(1,Math.hypot(dx,dy))*power;
 anim=true;requestAnimationFrame(step);
}
function cpuMove(){
 if(matchOver)return;let target=pieces.find(p=>p.alive&&p.type!=="queen")||pieces.find(p=>p.alive);if(!target){endGame();return;}
 striker.x=400;striker.y=110;let dx=target.x-striker.x,dy=target.y-striker.y;shoot(dx,dy);
}
function endGame(){matchOver=true;let winner=scores[0]===scores[1]?"DRAW":scores[0]>scores[1]?"PLAYER 1 WINS":(mode==="ai"?"CPU WINS":"PLAYER 2 WINS");$("resultTitle").textContent=winner;$("resultText").textContent=`Final score: ${scores[0]} — ${scores[1]}`;$("game").classList.add("hidden");$("result").classList.remove("hidden");}
function start(m){mode=m;if(m==="online"){alert("Online multiplayer is not connected yet. It needs a realtime game server and player accounts.");return;}$("home").classList.add("hidden");$("result").classList.add("hidden");$("game").classList.remove("hidden");reset();}
function pos(e){let r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*800/r.width,y:(e.clientY-r.top)*800/r.height};}
canvas.addEventListener("pointerdown",e=>{if(anim||matchOver||(mode==="ai"&&turn===1))return;let p=pos(e);if(Math.hypot(p.x-striker.x,p.y-striker.y)<55){drag=true;aim=p;canvas.setPointerCapture(e.pointerId);}});
canvas.addEventListener("pointermove",e=>{if(!drag)return;aim=pos(e);let power=Math.min(100,Math.round(Math.hypot(aim.x-striker.x,aim.y-striker.y)*.35));$("powerFill").style.width=power+"%";$("powerVal").textContent=power+"%";draw();});
canvas.addEventListener("pointerup",e=>{if(!drag)return;let p=pos(e);let dx=striker.x-p.x,dy=striker.y-p.y;drag=false;aim=null;$("powerFill").style.width="0%";$("powerVal").textContent="0%";shoot(dx,dy);});
document.querySelectorAll(".mode").forEach(b=>b.addEventListener("click",()=>start(b.dataset.mode)));
$("backBtn").onclick=()=>{$("game").classList.add("hidden");$("home").classList.remove("hidden");};
$("restartBtn").onclick=reset;$("againBtn").onclick=()=>start(mode);$("menuResult").onclick=()=>{$("result").classList.add("hidden");$("home").classList.remove("hidden");};
$("soundBtn").onclick=()=>{sound=!sound;$("soundBtn").textContent=sound?"♫":"♪";};
$("queenBtn").onclick=()=>alert("Queen: 3 points. This starter build uses simplified carrom scoring.");
reset();