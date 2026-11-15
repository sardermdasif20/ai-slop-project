(()=>{
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d'),$=id=>document.getElementById(id);
let W,H,DPR,last=0,mode='menu',t=0,speed=360,distance=0,gems=0,best=+(localStorage.getItem('emeraldBest')||0),spawn=0,objects=[],particles=[],player,shake=0,worldOffset=0;
$('best').textContent=best;
function resize(){DPR=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*DPR;canvas.height=H*DPR;ctx.setTransform(DPR,0,0,DPR,0,0)}
addEventListener('resize',resize);resize();
const lanes=[-.58,0,.58];
function reset(){t=0;speed=360;distance=0;gems=0;spawn=.6;objects=[];particles=[];shake=0;worldOffset=0;player={lane:1,xLane:1,jump:0,vy:0,slide:0,hit:0};updateHud()}
function updateHud(){$('distance').textContent=Math.floor(distance);$('gems').textContent=gems;$('best').textContent=best}
function addObject(type,lane,z){objects.push({type,lane,z,phase:Math.random()*6,passed:false})}
function pattern(){
 let lane=Math.floor(Math.random()*3),r=Math.random();
 if(r<.28){addObject('root',lane,1.08);addObject('gem',1-lane,1.22);addObject('gem',1-lane,1.42);addObject('gem',1-lane,1.62)}
 else if(r<.53){addObject('arch',lane,1.08);addObject('gem',lane,1.42)}
 else if(r<.76){addObject('gap',lane,1.08);addObject('gem',(lane+1)%3,1.35)}
 else {addObject('cart',lane,1.08);addObject('gem',(lane+2)%3,1.28)}
 if(Math.random()<.35)addObject('gem',(lane+1+Math.floor(Math.random()*2))%3,1.45);
}
function laneX(lane,z){let horizon=H*.31,ground=H*.91,depth=1-z;let spread= W*.11+depth*W*.31;return W/2+lanes[lane]*spread}
function project(z){let depth=1-z;return H*.31+depth*H*.62}
function rounded(x,y,w,h,r){ctx.beginPath();ctx.roundRect(x,y,w,h,r)}
function drawRoad(){
 let horizon=H*.31,base=H*.95;
 // sky gradient and distant emerald city
 let sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#102f2c');sky.addColorStop(.45,'#39745b');sky.addColorStop(1,'#102e26');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
 // moon / sun
 let sun=ctx.createRadialGradient(W*.75,H*.18,5,W*.75,H*.18,110);sun.addColorStop(0,'#f5dc9cbb');sun.addColorStop(1,'#f5dc9c00');ctx.fillStyle=sun;ctx.fillRect(W*.75-110,H*.18-110,220,220);
 ctx.fillStyle='#f4d89b';ctx.beginPath();ctx.arc(W*.75,H*.18,23,0,7);ctx.fill();
 // mountain layers
 for(let layer=0;layer<3;layer++){ctx.fillStyle=['#244c42','#1b4239','#12362f'][layer];ctx.beginPath();ctx.moveTo(0,horizon+80+layer*30);for(let x=0;x<=W+60;x+=60){let y=horizon-40+Math.sin(x*.012+layer*2+worldOffset*.0003)*55+Math.cos(x*.021+layer)*22+layer*40;ctx.lineTo(x,y)}ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();ctx.fill()}
 // distant towers
 for(let i=0;i<9;i++){let x=W*(.12+i*.095),y=horizon+8+Math.sin(i*2)*12;ctx.fillStyle='#c5b37a55';ctx.fillRect(x,y-50-(i%3)*23,7,58+(i%3)*23);ctx.beginPath();ctx.moveTo(x-8,y-50-(i%3)*23);ctx.lineTo(x+3,y-67-(i%3)*23);ctx.lineTo(x+15,y-50-(i%3)*23);ctx.fill()}
 // road trapezoid
 ctx.fillStyle='#d9b96d';ctx.beginPath();ctx.moveTo(W*.47,horizon);ctx.lineTo(W*.53,horizon);ctx.lineTo(W*.92,base);ctx.lineTo(W*.08,base);ctx.closePath();ctx.fill();
 ctx.fillStyle='#e8cb82';ctx.beginPath();ctx.moveTo(W*.485,horizon);ctx.lineTo(W*.515,horizon);ctx.lineTo(W*.83,base);ctx.lineTo(W*.17,base);ctx.closePath();ctx.fill();
 // tile joints moving down
 for(let i=0;i<15;i++){let z=((i/15+worldOffset/260)%1),y=project(z),w=W*(.025+z*.39);ctx.strokeStyle='#a47c3c55';ctx.lineWidth=1+z*2;ctx.beginPath();ctx.moveTo(W/2-w,y);ctx.lineTo(W/2+w,y);ctx.stroke()}
 // lane separators
 for(let k of [-.29,.29]){ctx.strokeStyle='#9d773c77';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(W/2+k*W*.11,horizon);ctx.lineTo(W/2+k*W*.65,base);ctx.stroke()}
 // road edge gold line
 ctx.strokeStyle='#fff0b4';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(W*.47,horizon);ctx.lineTo(W*.08,base);ctx.moveTo(W*.53,horizon);ctx.lineTo(W*.92,base);ctx.stroke();
 // foreground foliage silhouettes
 for(let side of [-1,1])for(let i=0;i<12;i++){let z=(i/12+worldOffset/500)%1,y=project(z),x=W/2+side*(W*.12+z*W*.43),r=8+z*35;ctx.fillStyle=i%2?'#0a2d26':'#174737';ctx.beginPath();ctx.arc(x,y,r,0,7);ctx.arc(x+side*r*.6,y-r*.5,r*.8,0,7);ctx.fill()}
}
function drawObject(o){
 let y=project(o.z),x=laneX(o.lane,o.z),scale=.25+o.z*1.6,sz=scale*48;if(y>H+100)return;
 ctx.save();ctx.translate(x,y);ctx.scale(scale,scale);
 if(o.type==='gem'){let bob=Math.sin(t*5+o.phase)*5;ctx.translate(0,-25+bob);ctx.rotate(t*1.7+o.phase);ctx.shadowColor='#7affd0';ctx.shadowBlur=22;ctx.fillStyle='#7df5bb';ctx.beginPath();ctx.moveTo(0,-18);ctx.lineTo(12,0);ctx.lineTo(0,18);ctx.lineTo(-12,0);ctx.closePath();ctx.fill();ctx.strokeStyle='#efffd7';ctx.lineWidth=2;ctx.stroke()}
 else if(o.type==='root'){ctx.fillStyle='#493c2b';ctx.strokeStyle='#b28c53';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-30,4);ctx.quadraticCurveTo(-24,-38,-4,-23);ctx.quadraticCurveTo(10,-55,25,-12);ctx.lineTo(31,8);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#315d37';ctx.beginPath();ctx.ellipse(-15,-20,12,5,-.5,0,7);ctx.ellipse(16,-28,13,6,.5,0,7);ctx.fill()}
 else if(o.type==='arch'){ctx.strokeStyle='#315d37';ctx.lineWidth=12;ctx.beginPath();ctx.moveTo(-37,12);ctx.lineTo(-37,-38);ctx.quadraticCurveTo(0,-70,37,-38);ctx.lineTo(37,12);ctx.stroke();ctx.strokeStyle='#b4a06b';ctx.lineWidth=3;ctx.stroke();for(let i=-2;i<=2;i++){ctx.fillStyle='#557b3c';ctx.beginPath();ctx.arc(i*14,-45-Math.cos(i)*8,7,0,7);ctx.fill()}}
 else if(o.type==='gap'){ctx.fillStyle='#163b33';ctx.beginPath();ctx.ellipse(0,2,43,15,0,0,7);ctx.fill();ctx.strokeStyle='#f5d68b';ctx.lineWidth=3;ctx.stroke()}
 else if(o.type==='cart'){ctx.fillStyle='#6d492c';rounded(-29,-26,58,30,5);ctx.fill();ctx.strokeStyle='#d1a75e';ctx.lineWidth=3;ctx.stroke();ctx.fillStyle='#2c271d';for(let a of [-19,19]){ctx.beginPath();ctx.arc(a,8,9,0,7);ctx.fill();ctx.strokeStyle='#d0b16f';ctx.stroke()}}
 ctx.restore();
}
function drawPlayer(){
 let x=laneX(player.lane,.03),y=H*.84-player.jump*95,lean=(player.lane-player.xLane)*.2;
 ctx.save();ctx.translate(x,y);ctx.rotate(lean);
 let sliding=player.slide>0,scale=sliding?.82:1;
 ctx.scale(scale,scale);
 // shadow
 ctx.fillStyle='#061d16aa';ctx.beginPath();ctx.ellipse(0,17,27,8,0,0,7);ctx.fill();
 // scarf
 ctx.fillStyle='#c94e39';ctx.beginPath();ctx.moveTo(-5,-40);ctx.quadraticCurveTo(-35,-50,-43,-25);ctx.quadraticCurveTo(-22,-35,-9,-18);ctx.fill();
 // body
 ctx.fillStyle='#204e43';rounded(-14,-43,28,39,8);ctx.fill();
 ctx.fillStyle='#d9b878';rounded(-11,-39,22,7,3);ctx.fill();
 // head
 ctx.fillStyle='#d7a77b';ctx.beginPath();ctx.arc(0,-53,12,0,7);ctx.fill();
 // hair
 ctx.fillStyle='#38251d';ctx.beginPath();ctx.arc(0,-59,12,Math.PI,Math.PI*2);ctx.fill();ctx.fillRect(-12,-59,5,10);
 // arms
 ctx.strokeStyle='#d7a77b';ctx.lineWidth=6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-12,-35);ctx.lineTo(-24,-18);ctx.moveTo(12,-35);ctx.lineTo(22,-23);ctx.stroke();
 // legs
 ctx.strokeStyle='#4a3327';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-7,-7);ctx.lineTo(-12,9);ctx.moveTo(7,-7);ctx.lineTo(13,9);ctx.stroke();
 ctx.strokeStyle='#d7b777';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(-17,10);ctx.lineTo(-7,10);ctx.moveTo(8,10);ctx.lineTo(19,10);ctx.stroke();
 if(player.hit>0){ctx.strokeStyle='#fff2b3';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,-30,35,0,7);ctx.stroke()}
 ctx.restore();
}
function draw(){ctx.save();if(shake>0)ctx.translate((Math.random()-.5)*shake,(Math.random()-.5)*shake);drawRoad();objects.slice().sort((a,b)=>a.z-b.z).forEach(drawObject);drawPlayer();ctx.restore();for(let p of particles){ctx.globalAlpha=p.life/p.max;ctx.fillStyle='#aaffce';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,7);ctx.fill()}ctx.globalAlpha=1;
 // soft storm glow
 let grad=ctx.createLinearGradient(0,0,W,0);grad.addColorStop(0,'#071e1a44');grad.addColorStop(.5,'#0000');grad.addColorStop(1,'#071e1a44');ctx.fillStyle=grad;ctx.fillRect(0,0,W,H)}
function burst(x,y){for(let i=0;i<14;i++){let a=Math.random()*Math.PI*2,v=rand(30,160);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.6,max:.6,r:rand(1,3)})}}
function rand(a,b){return a+Math.random()*(b-a)}
function moveLane(dir){if(mode!=='run')return;player.lane=Math.max(0,Math.min(2,player.lane+dir))}
function jump(){if(mode==='run'&&player.jump===0&&player.slide<=0){player.vy=7.8}}
function slide(){if(mode==='run'&&player.jump<.5)player.slide=.72}
function keydown(e){let k=e.key.toLowerCase();if(['arrowleft','arrowright','arrowup','arrowdown',' '].includes(k))e.preventDefault();if(e.repeat)return;if(k==='arrowleft'||k==='a')moveLane(-1);if(k==='arrowright'||k==='d')moveLane(1);if(k==='arrowup'||k==='w'||k===' ')jump();if(k==='arrowdown'||k==='s')slide();if(k==='p'||k==='escape')togglePause()}
addEventListener('keydown',keydown);
let touchStart=null;canvas.addEventListener('touchstart',e=>{let p=e.changedTouches[0];touchStart={x:p.clientX,y:p.clientY}},{passive:true});canvas.addEventListener('touchend',e=>{if(!touchStart)return;let p=e.changedTouches[0],dx=p.clientX-touchStart.x,dy=p.clientY-touchStart.y;if(Math.max(Math.abs(dx),Math.abs(dy))>25){if(Math.abs(dx)>Math.abs(dy))moveLane(dx>0?1:-1);else if(dy<0)jump();else slide()}touchStart=null},{passive:true});
function crash(){mode='over';$('pauseBtn').classList.add('hidden');best=Math.max(best,Math.floor(distance));localStorage.setItem('emeraldBest',best);updateHud();$('resulttag').textContent='THE STORM HAS FOUND YOU';$('resulttitle').innerHTML='RUN<br><em>ENDED</em>';$('resultcopy').textContent=`You travelled ${Math.floor(distance)} metres and collected ${gems} emeralds. Your best run is ${best} metres.`;$('result').classList.remove('hidden')}
function togglePause(){if(mode==='run'){mode='pause';$('pause').classList.remove('hidden')}else if(mode==='pause'){mode='run';$('pause').classList.add('hidden')}}
function update(dt){
 if(mode!=='run')return;t+=dt;distance+=speed*dt/30;speed=Math.min(690,360+distance*.18);worldOffset+=speed*dt;player.hit=Math.max(0,player.hit-dt);player.slide=Math.max(0,player.slide-dt);
 if(player.vy!==0||player.jump>0){player.jump+=player.vy*dt;player.vy-=18*dt;if(player.jump<=0){player.jump=0;player.vy=0}}
 spawn-=dt;if(spawn<=0){pattern();spawn=Math.max(.53,1.08-distance/1800)}
 for(let o of objects){o.z-=speed*dt/900;if(o.z<.11&&!o.passed){o.passed=true;if(o.type==='gem'){gems++;burst(laneX(o.lane,o.z),project(o.z)-20);updateHud()}else if(o.lane===player.lane){let safe=(o.type==='root'||o.type==='gap')?player.jump>.62:(o.type==='arch'?player.slide>0:false);if(!safe){shake=15;player.hit=.25;burst(W/2,H*.82);crash();return}}}}
 objects=objects.filter(o=>o.z>-.12);
 for(let p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=.97;p.vy*=.97;p.life-=dt}particles=particles.filter(p=>p.life>0);shake=Math.max(0,shake-dt*35);updateHud()
}
function loop(ts){let dt=Math.min((ts-last)/1000||0,.035);last=ts;update(dt);draw();requestAnimationFrame(loop)}
function start(){reset();mode='run';$('menu').classList.add('hidden');$('result').classList.add('hidden');$('pause').classList.add('hidden');$('pauseBtn').classList.remove('hidden')}
$('play').onclick=start;$('retry').onclick=start;$('pauseBtn').onclick=togglePause;$('resume').onclick=togglePause;
reset();requestAnimationFrame(loop);
})();