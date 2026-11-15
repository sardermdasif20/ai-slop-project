(()=>{
const canvas=document.getElementById('world'),ctx=canvas.getContext('2d'),mini=document.getElementById('minimap'),mctx=mini.getContext('2d'),$=id=>document.getElementById(id);
let W,H,D=1,last=0,worldTime=0,running=false,cam={x:0,y:0},keys={},player,objects=[],particles=[],toastT=0,near=null,coins=0,level=1,stats,quests,dayMinutes=480;
const TILE=64,MAP_W=38,MAP_H=30;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rand=(a,b)=>a+Math.random()*(b-a),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const map=Array.from({length:MAP_H},(_,y)=>Array.from({length:MAP_W},(_,x)=>terrainAt(x,y)));
function terrainAt(x,y){
 let n=Math.sin(x*.43)*Math.cos(y*.38)+Math.sin((x+y)*.19)*.7;
 if((x<2||y<2||x>MAP_W-3||y>MAP_H-3))return 'water';
 if((x>=15&&x<=22&&y>=11&&y<=17))return 'path';
 if((x>=4&&x<=13&&y>=5&&y<=12))return 'garden';
 if((x>=25&&x<=34&&y>=5&&y<=13))return 'forest';
 if((x>=5&&x<=12&&y>=20&&y<=27))return 'meadow';
 if((x>=25&&x<=34&&y>=20&&y<=27))return 'pond';
 if(n>1.1)return 'flower';
 return 'grass';
}
function resize(){D=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*D;canvas.height=H*D;ctx.setTransform(D,0,0,D,0,0)}
addEventListener('resize',resize);resize();
function makeWorld(){
 objects=[];
 // handcrafted landmarks
 const add=(type,x,y,name,extra={})=>objects.push({type,x:x*TILE+TILE/2,y:y*TILE+TILE/2,name,...extra});
 add('house',18,14,'Your cozy cottage',{color:0});add('house',11,8,'Mossy Cottage',{color:1});add('house',29,8,'Fern House',{color:2});
 add('pond',29,23,'Moonleaf Pond');add('tree',7,5,'Old Oak');add('tree',9,6,'Old Oak');add('tree',32,7,'Whispering Pine');add('tree',33,10,'Whispering Pine');add('tree',8,23,'Apple Tree');add('tree',11,25,'Apple Tree');
 add('market',19,11,'Village Market');add('fountain',19,16,'Wishing Fountain');add('bench',16,15,'Sunny Bench');add('bench',22,15,'Sunny Bench');
 add('npc',17,12,'Milo the Mouse',{kind:'mouse',dialogue:'Psst! I dropped my shiny acorns around the garden. Could you help me find three?'});add('npc',24,18,'Pip the Bunny',{kind:'bunny',dialogue:'The meadow is full of clover today. I love it here!'});add('npc',30,21,'Luna the Fox',{kind:'fox',dialogue:'Moonleaf Pond is magical at sunset. Bring me a fish treat sometime!'});
 add('food',17,15,'Fish snack');add('food',20,14,'Fish snack');add('toy',12,10,'Yarn ball');add('toy',8,24,'Feather toy');
 // collectibles placed across zones
 for(let i=0;i<42;i++){let x=rand(4,34),y=rand(4,26);if(map[Math.floor(y)][Math.floor(x)]!=='water')add(Math.random()<.65?'coin':'flower',x,y,Math.random()<.65?'Fish treat':'Wildflower',{taken:false})}
 for(let i=0;i<12;i++){let x=rand(5,33),y=rand(5,26);if(map[Math.floor(y)][Math.floor(x)]!=='water')add('acorn',x,y,'Golden acorn',{taken:false})}
}
function reset(){player={x:18.5*TILE,y:18*TILE,vx:0,vy:0,dir:0,frame:0,move:0};stats={hunger:82,energy:90,happy:76};coins=0;level=1;dayMinutes=480;worldTime=0;quests={talk:false,acorns:0,play:false};makeWorld();updateHud()}
function toast(s){$('toast').textContent=s;$('toast').style.opacity=1;toastT=2}
function updateHud(){
 $('coins').textContent=coins;$('level').textContent=String(level).padStart(2,'0');
 for(let [k,v] of Object.entries(stats)){$(k+'N').textContent=Math.round(v)+'%';$(k+'B').style.width=v+'%'}
 $('mood').textContent=stats.happy>80?'Feeling purr-fect ✦':stats.energy<25?'Sleepy whiskers…':stats.hunger<25?'Quite hungry…':'Feeling curious ✦';
 $('questText').textContent=quests.acorns<3?`Help Milo find golden acorns: ${quests.acorns}/3. Explore the garden and forest.`:!quests.talk?'Return to Milo the Mouse and tell him the good news!':!quests.play?'Find a toy and have a little playtime.':'Adventure complete! Explore freely and make this world yours.';
 $('questTitle').textContent=quests.play?'WOODLAND FRIENDSHIP QUEST':'TODAY’S LITTLE ADVENTURE';
}
function tileColor(type,x,y){let n=Math.sin(x*12.9+y*78.2)*.5+.5;return ({grass:['#6e9b60','#78a568','#648f58'],path:['#d6bd82','#cdb17a','#ddc58d'],garden:['#6b9858','#7ba366','#5d8953'],forest:['#416e4b','#4b7850','#3b6548'],meadow:['#84a968','#91b474','#7da05f'],pond:['#5e9c8b','#68aa9c','#579585'],flower:['#7ba363','#80a76a','#71985e'],water:['#4b8f8a','#559c96','#43817e']})[type][Math.floor(n*3)]}
function drawGround(){
 let startX=Math.floor((cam.x-W/2)/TILE)-1,startY=Math.floor((cam.y-H/2)/TILE)-1,endX=startX+Math.ceil(W/TILE)+3,endY=startY+Math.ceil(H/TILE)+3;
 for(let y=startY;y<endY;y++)for(let x=startX;x<endX;x++){
  if(x<0||y<0||x>=MAP_W||y>=MAP_H)continue;
  let type=map[y][x],sx=x*TILE-cam.x+W/2,sy=y*TILE-cam.y+H/2;
  ctx.fillStyle=tileColor(type,x,y);ctx.fillRect(sx,sy,TILE+1,TILE+1);
  // little ground texture
  let seed=Math.sin(x*43.1+y*17.7)*10000,fx=(seed-Math.floor(seed))*52,fy=((seed*1.7)-Math.floor(seed*1.7))*52;
  if(type==='path'){ctx.fillStyle='#9f875d55';ctx.beginPath();ctx.ellipse(sx+fx,sy+fy,4,2,0,0,7);ctx.fill()}
  else if(type!=='water'&&type!=='pond'&&type!=='path'&&Math.floor(seed*4)%4===0){ctx.strokeStyle='#d5e6a033';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(sx+fx,sy+fy);ctx.lineTo(sx+fx+2,sy+fy-5);ctx.stroke()}
  if(type==='water'||type==='pond'){ctx.strokeStyle='#b2e2d044';ctx.beginPath();ctx.moveTo(sx+12+(worldTime*8+x*7)%35,sy+22);ctx.quadraticCurveTo(sx+30,sy+17,sx+48,sy+22);ctx.stroke()}
 }
}
function worldToScreen(x,y){return {x:x-cam.x+W/2,y:y-cam.y+H/2}}
function drawTree(o){let p=worldToScreen(o.x,o.y),s=1;ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='#3d3024';ctx.fillRect(-5,-2,10,29);ctx.fillStyle='#315e40';for(let i=0;i<4;i++){ctx.beginPath();ctx.arc(Math.sin(i*2)*13,-12-i*10,22-i*2,0,7);ctx.fill()}ctx.fillStyle='#527d4b';ctx.beginPath();ctx.arc(-11,-28,11,0,7);ctx.arc(10,-37,12,0,7);ctx.arc(1,-13,13,0,7);ctx.fill();ctx.fillStyle='#9bb96b';ctx.beginPath();ctx.arc(-8,-35,4,0,7);ctx.arc(9,-44,4,0,7);ctx.fill();ctx.restore()}
function drawHouse(o){let p=worldToScreen(o.x,o.y),colors=[['#d5a66e','#8c543d'],['#b9c78b','#5c7650'],['#d6c4a0','#697c63']][o.color||0];ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(0,16,43,13,0,0,7);ctx.fill();ctx.fillStyle=colors[0];ctx.fillRect(-33,-28,66,48);ctx.fillStyle=colors[1];ctx.beginPath();ctx.moveTo(-42,-25);ctx.lineTo(0,-57);ctx.lineTo(42,-25);ctx.closePath();ctx.fill();ctx.fillStyle='#f4dca9';ctx.fillRect(-24,-15,14,13);ctx.fillRect(10,-15,14,13);ctx.strokeStyle='#8b6442';ctx.lineWidth=2;ctx.strokeRect(-24,-15,14,13);ctx.strokeRect(10,-15,14,13);ctx.fillStyle='#80543a';ctx.fillRect(-7,-8,15,28);ctx.fillStyle='#edcf87';ctx.beginPath();ctx.arc(4,3,1.5,0,7);ctx.fill();ctx.restore()}
function drawObject(o){
 if(o.taken)return;let p=worldToScreen(o.x,o.y);if(p.x<-100||p.x>W+100||p.y<-100||p.y>H+100)return;
 ctx.save();ctx.translate(p.x,p.y);
 if(o.type==='tree'){drawTree(o);ctx.restore();return}
 if(o.type==='house'){drawHouse(o);ctx.restore();return}
 if(o.type==='npc'){let colors={mouse:'#b6a28b',bunny:'#e8d8bf',fox:'#d88d54'},c=colors[o.kind];ctx.fillStyle='#0003';ctx.beginPath();ctx.ellipse(0,9,13,5,0,0,7);ctx.fill();ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(0,-3,11,12,0,0,7);ctx.fill();ctx.beginPath();ctx.arc(0,-15,9,0,7);ctx.fill();if(o.kind==='bunny'){ctx.beginPath();ctx.ellipse(-5,-28,3,9,-.2,0,7);ctx.ellipse(5,-28,3,9,.2,0,7);ctx.fill()}else if(o.kind==='fox'){ctx.fillStyle='#f6e4c6';ctx.beginPath();ctx.moveTo(-8,-15);ctx.lineTo(-4,-25);ctx.lineTo(0,-16);ctx.moveTo(0,-16);ctx.lineTo(5,-26);ctx.lineTo(9,-15);ctx.fill()}ctx.fillStyle='#302c25';ctx.beginPath();ctx.arc(-3,-16,1,0,7);ctx.arc(3,-16,1,0,7);ctx.fill();ctx.fillStyle='#f8e6d2';ctx.font='bold 10px sans-serif';ctx.textAlign='center';ctx.fillText(o.name.split(' ')[0],0,-39)}
 else if(o.type==='pond'||o.type==='fountain'){ctx.fillStyle='#3c897f';ctx.beginPath();ctx.ellipse(0,0,o.type==='pond'?52:23,o.type==='pond'?30:17,0,0,7);ctx.fill();ctx.strokeStyle='#a4d5bd';ctx.lineWidth=3;ctx.stroke();ctx.strokeStyle='#d5eee0';ctx.beginPath();ctx.ellipse(0,0,24,9,0,0,7);ctx.stroke()}
 else if(o.type==='bench'){ctx.fillStyle='#8e603d';ctx.fillRect(-19,-7,38,7);ctx.fillRect(-17,-17,34,7);ctx.fillRect(-14,0,4,10);ctx.fillRect(10,0,4,10)}
 else if(o.type==='market'){ctx.fillStyle='#b9784c';ctx.fillRect(-24,-15,48,24);ctx.fillStyle='#e7c778';ctx.beginPath();ctx.moveTo(-28,-15);ctx.lineTo(-20,-28);ctx.lineTo(20,-28);ctx.lineTo(28,-15);ctx.fill();ctx.fillStyle='#fff0cf';ctx.fillRect(-16,-8,32,8)}
 else if(['coin','acorn','flower','food','toy'].includes(o.type)){let bob=Math.sin(worldTime*3+o.x)*3;ctx.translate(0,bob);if(o.type==='coin'){ctx.shadowColor='#ffe38a';ctx.shadowBlur=14;ctx.fillStyle='#ffd36b';ctx.beginPath();ctx.arc(0,0,8,0,7);ctx.fill();ctx.strokeStyle='#fff0ad';ctx.stroke()}else if(o.type==='acorn'){ctx.fillStyle='#b77a3e';ctx.beginPath();ctx.ellipse(0,2,6,8,0,0,7);ctx.fill();ctx.fillStyle='#e5bd6b';ctx.fillRect(-7,-6,14,5)}else if(o.type==='flower'){ctx.fillStyle='#f5c6db';for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(Math.cos(i*1.256)*5,Math.sin(i*1.256)*5,4,0,7);ctx.fill()}ctx.fillStyle='#f2d36e';ctx.beginPath();ctx.arc(0,0,3,0,7);ctx.fill()}else if(o.type==='food'){ctx.fillStyle='#f3c86c';ctx.beginPath();ctx.ellipse(0,0,9,5,-.3,0,7);ctx.fill();ctx.fillStyle='#fff0c6';ctx.fillRect(-4,-2,8,2)}else{ctx.strokeStyle='#d98aa7';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,8,0,5.8);ctx.stroke();ctx.fillStyle='#f1c6d4';ctx.beginPath();ctx.arc(10,-7,4,0,7);ctx.fill()}}
 ctx.restore();
}
function drawCat(){
 let p=worldToScreen(player.x,player.y),moving=player.move>0;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(player.dir*.08);let bob=moving?Math.sin(player.frame*12)*2:Math.sin(worldTime*2)*1.5;ctx.translate(0,bob);
 ctx.fillStyle='#0004';ctx.beginPath();ctx.ellipse(0,13,20,7,0,0,7);ctx.fill();
 // tail
 ctx.strokeStyle='#d18d57';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-13,1);ctx.quadraticCurveTo(-30,-8+Math.sin(worldTime*4)*6,-24,-20);ctx.stroke();
 // body
 ctx.fillStyle='#d99a62';ctx.beginPath();ctx.ellipse(0,0,17,12,-.1,0,7);ctx.fill();
 // stripes
 ctx.strokeStyle='#9c613e';ctx.lineWidth=2;for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(i*7-2,-8);ctx.lineTo(i*7+1,0);ctx.stroke()}
 // head and ears
 ctx.fillStyle='#e2a66e';ctx.beginPath();ctx.arc(9,-10,12,0,7);ctx.fill();ctx.beginPath();ctx.moveTo(1,-17);ctx.lineTo(2,-30);ctx.lineTo(11,-21);ctx.fill();ctx.beginPath();ctx.moveTo(12,-21);ctx.lineTo(23,-30);ctx.lineTo(24,-15);ctx.fill();ctx.fillStyle='#bd7771';ctx.beginPath();ctx.moveTo(4,-20);ctx.lineTo(4,-26);ctx.lineTo(8,-21);ctx.moveTo(16,-21);ctx.lineTo(22,-26);ctx.lineTo(21,-18);ctx.fill();
 // face
 ctx.fillStyle='#332c27';ctx.beginPath();ctx.arc(6,-12,1.5,0,7);ctx.arc(15,-12,1.5,0,7);ctx.fill();ctx.fillStyle='#c87c78';ctx.beginPath();ctx.arc(11,-7,2,0,7);ctx.fill();ctx.strokeStyle='#fff0d8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(3,-6);ctx.lineTo(-4,-7);ctx.moveTo(3,-4);ctx.lineTo(-4,-2);ctx.moveTo(19,-6);ctx.lineTo(26,-7);ctx.moveTo(19,-4);ctx.lineTo(26,-2);ctx.stroke();
 // paws
 ctx.fillStyle='#f1c59a';for(let i=0;i<4;i++){let x=i<2?-9:8,y= i%2?8:7;ctx.beginPath();ctx.ellipse(x+(moving?Math.sin(player.frame*14+i)*2:0),y,4,3,0,0,7);ctx.fill()}
 // collar
 ctx.strokeStyle='#78a85d';ctx.lineWidth=3;ctx.beginPath();ctx.arc(7,-2,9,.2,2.6);ctx.stroke();ctx.fillStyle='#e8c76e';ctx.beginPath();ctx.arc(13,4,2.5,0,7);ctx.fill();
 ctx.restore();
}
function drawWorld(){
 ctx.clearRect(0,0,W,H);drawGround();
 // draw depth-sorted objects
 objects.slice().sort((a,b)=>a.y-b.y).forEach(o=>drawObject(o));
 drawCat();
 // sparkles
 for(let p of particles){let q=worldToScreen(p.x,p.y);ctx.globalAlpha=p.life/p.max;ctx.fillStyle=p.color||'#fff0a8';ctx.beginPath();ctx.arc(q.x,q.y,p.r,0,7);ctx.fill()}ctx.globalAlpha=1;
 // ambient light / time tint
 let hour=(dayMinutes/60)%24;let night=hour<6||hour>19;let alpha=night?.24:hour>17?.1:0;if(alpha){ctx.fillStyle=`rgba(18,28,66,${alpha})`;ctx.fillRect(0,0,W,H)}
}
function drawMini(){let w=mini.width,h=mini.height;mctx.clearRect(0,0,w,h);let sx=w/MAP_W,sy=h/MAP_H;for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){mctx.fillStyle=map[y][x]==='water'?'#397b7a':map[y][x]==='path'?'#c7ae78':map[y][x]==='forest'?'#416c4b':map[y][x]==='pond'?'#5c9b91':'#709b62';mctx.fillRect(x*sx,y*sy,sx+1,sy+1)}for(let o of objects){if(o.type==='npc'&&!o.taken){mctx.fillStyle='#f6d17b';mctx.fillRect(o.x/TILE*sx-2,o.y/TILE*sy-2,4,4)}}mctx.fillStyle='#fff4d1';mctx.beginPath();mctx.arc(player.x/TILE*sx,player.y/TILE*sy,5,0,7);mctx.fill();mctx.strokeStyle='#fff4d1';mctx.strokeRect(player.x/TILE*sx-14,player.y/TILE*sy-10,28,20)}
function interact(){
 if(!near)return;
 if(near.type==='npc'){
  $('interTitle').textContent=near.name;$('interText').textContent=near.dialogue;
  let opts=$('interOptions');opts.innerHTML='';
  if(near.kind==='mouse'&&quests.acorns>=3&&!quests.talk){let b=document.createElement('button');b.textContent='GIVE THE ACORNS';b.onclick=()=>{quests.talk=true;coins+=8;stats.happy=Math.min(100,stats.happy+15);toast('Milo gave you 8 fish treats!');$('interact').classList.add('hidden');updateHud()};opts.appendChild(b)}
  else {let b=document.createElement('button');b.textContent='SAY HELLO';b.onclick=()=>{stats.happy=Math.min(100,stats.happy+4);toast('A lovely little chat!');$('interact').classList.add('hidden');updateHud()};opts.appendChild(b)}
  $('interact').classList.remove('hidden');
 }else if(near.type==='food'){stats.hunger=Math.min(100,stats.hunger+24);stats.happy=Math.min(100,stats.happy+3);near.taken=true;toast('Mmm! A tasty fish snack.');updateHud()}
 else if(near.type==='toy'){stats.happy=Math.min(100,stats.happy+17);stats.energy=Math.max(0,stats.energy-5);near.taken=true;quests.play=true;for(let i=0;i<16;i++)particles.push({x:near.x,y:near.y,vx:rand(-30,30),vy:rand(-40,20),life:1,max:1,r:rand(2,4),color:'#f5d7ed'});toast('Playtime! Happiness increased.');updateHud()}
 else if(near.type==='pond'){stats.happy=Math.min(100,stats.happy+7);toast('The water is cool and peaceful.')}
 else if(near.type==='house'){stats.energy=Math.min(100,stats.energy+12);toast('Home sweet home. You feel rested.');updateHud()}
 else {toast('A lovely spot to explore!')}
}
function findNear(){near=null;let best=Infinity;for(let o of objects){if(o.taken)continue;if(['npc','food','toy','pond','house','fountain','market','bench'].includes(o.type)){let d=dist(player,o);if(d<70&&d<best){best=d;near=o}}}let hint=$('hint');if(near){hint.textContent=`E  ·  ${near.type==='npc'?'TALK TO ':near.type==='food'?'EAT ':near.type==='toy'?'PLAY WITH ': 'INTERACT · '}${near.name.toUpperCase()}`;hint.style.opacity=1}else hint.style.opacity=0}
function collectNearby(){for(let o of objects){if(o.taken)continue;let d=dist(player,o);if(d<34&&['coin','acorn','flower'].includes(o.type)){o.taken=true;if(o.type==='coin'){coins++;stats.happy=Math.min(100,stats.happy+1);toast('+1 fish treat')}else if(o.type==='acorn'){quests.acorns=Math.min(3,quests.acorns+1);coins+=2;toast('Golden acorn found!')}else{stats.happy=Math.min(100,stats.happy+3);toast('Pretty wildflower collected')}if(coins>=20)level=Math.min(99,1+Math.floor(coins/20));for(let i=0;i<5;i++)particles.push({x:o.x,y:o.y,vx:rand(-35,35),vy:rand(-50,0),life:.7,max:.7,r:3});updateHud()}}}
function keydown(e){let k=e.key.toLowerCase();if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();keys[k]=true;if(!e.repeat){if(k==='e')interact();if(k===' '){stats.happy=Math.min(100,stats.happy+2);toast('MEOW!');for(let i=0;i<7;i++)particles.push({x:player.x+rand(-10,10),y:player.y-30,vx:rand(-20,20),vy:rand(-45,-15),life:.8,max:.8,r:2,color:'#fff0d4'})}}}
function keyup(e){keys[e.key.toLowerCase()]=false}
addEventListener('keydown',keydown);addEventListener('keyup',keyup);
let touch=null;canvas.addEventListener('touchstart',e=>{let p=e.changedTouches[0];touch={x:p.clientX,y:p.clientY}},{passive:true});canvas.addEventListener('touchend',e=>{if(!touch)return;let p=e.changedTouches[0],dx=p.clientX-touch.x,dy=p.clientY-touch.y;if(Math.abs(dx)+Math.abs(dy)>18){keys[ Math.abs(dx)>Math.abs(dy)?(dx>0?'d':'a'):(dy>0?'s':'w')]=true;setTimeout(()=>{keys.a=keys.d=keys.w=keys.s=false},180)}else{keys.e=true;setTimeout(()=>keys.e=false,100)}touch=null},{passive:true});
function update(dt){
 if(!running)return;worldTime+=dt;dayMinutes=(dayMinutes+dt*1.4)%1440;
 let ax=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),ay=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0),len=Math.hypot(ax,ay)||1;ax/=len;ay/=len;
 let sprint=keys.shift&&stats.energy>1,speed=sprint?235:145;if(sprint)stats.energy=Math.max(0,stats.energy-dt*8);else stats.energy=Math.min(100,stats.energy+dt*1.4);
 player.vx+=(ax*speed-player.vx)*Math.min(1,dt*8);player.vy+=(ay*speed-player.vy)*Math.min(1,dt*8);player.x=clamp(player.x+player.vx*dt,TILE*2, (MAP_W-2)*TILE);player.y=clamp(player.y+player.vy*dt,TILE*2,(MAP_H-2)*TILE);
 player.move=Math.hypot(player.vx,player.vy)/speed;player.frame+=dt*player.move*8;
 // keep cat out of lake/water; collision with water tiles
 let tx=Math.floor(player.x/TILE),ty=Math.floor(player.y/TILE);if(['water','pond'].includes(map[ty]?.[tx])){player.x-=player.vx*dt*1.2;player.y-=player.vy*dt*1.2;player.vx*=.25;player.vy*=.25}
 if(player.move>.05)player.dir=Math.atan2(player.vy,player.vx);
 cam.x+=(player.x-cam.x)*Math.min(1,dt*4);cam.y+=(player.y-cam.y)*Math.min(1,dt*4);
 stats.hunger=Math.max(0,stats.hunger-dt*.23);stats.happy=Math.max(0,stats.happy-dt*.09);
 collectNearby();findNear();
 for(let p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=20*dt;p.life-=dt}particles=particles.filter(p=>p.life>0);
 if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').style.opacity=0}
 let hour=Math.floor(dayMinutes/60),min=Math.floor(dayMinutes%60);$('clock').textContent=`${String(hour%12||12).padStart(2,'0')}:${String(min).padStart(2,'0')} ${hour>=12?'PM':'AM'}`;
 updateHud();
}
function loop(ts){let dt=Math.min((ts-last)/1000||0,.04);last=ts;update(dt);drawWorld();drawMini();requestAnimationFrame(loop)}
$('begin').onclick=()=>{$('start').classList.add('hidden');reset();running=true;toast('Welcome home, little explorer!')};
$('closePanel').onclick=()=>$('interact').classList.add('hidden');
$('wake').onclick=()=>{$('gameover').classList.add('hidden');stats.energy=100;stats.hunger=Math.max(stats.hunger,60);running=true;toast('Fresh from your catnap!')};
reset();requestAnimationFrame(loop);
})();