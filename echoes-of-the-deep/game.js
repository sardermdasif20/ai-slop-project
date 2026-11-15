(()=> {
const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
let W,H,dpr,started=false,ended=false,last=0,time=0,keys={},player,cores,rocks,particles,monster,beacon,sonar,oxygen,saved,score,toastTimer=0;
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function resize(){dpr=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;canvas.width=W*dpr;canvas.height=H*dpr;ctx.setTransform(dpr,0,0,dpr,0,0)}
addEventListener('resize',resize);resize();
function reset(){
 time=0;oxygen=100;saved=0;score=0;sonar=0;toastTimer=0;ended=false;
 player={x:0,y:0,vx:0,vy:0,angle:0,boost:0,inv:0};
 cores=Array.from({length:5},(_,i)=>({x:rand(-780,780),y:rand(-560,560),got:false,phase:rand(0,7)}));
 rocks=Array.from({length:95},()=>({x:rand(-1300,1300),y:rand(-900,900),r:rand(8,48),a:rand(.1,.45),type:Math.random()}));
 particles=[];
 monster={x:700,y:-500,vx:0,vy:0,phase:0,alert:0};
 beacon={x:0,y:0};
}
function world(){return {x:player.x-W/2,y:player.y-H/2}}
function toast(s){$('notice').textContent=s;$('notice').style.opacity=1;toastTimer=1.3}
function pulse(){if(!started||ended||sonar>0)return;sonar=.85;monster.alert=Math.max(monster.alert,2.6);toast('SONAR PULSE // ECHO RETURNED');for(let i=0;i<25;i++)particles.push({x:player.x,y:player.y,a:rand(0,Math.PI*2),v:rand(40,220),life:rand(.25,.8),max:.8})}
function collect(){let target=cores.find(c=>!c.got&&Math.hypot(c.x-player.x,c.y-player.y)<58);if(target){target.got=true;saved++;score+=250;toast('DATA CORE RECOVERED');for(let i=0;i<22;i++)particles.push({x:target.x,y:target.y,a:rand(0,6.28),v:rand(20,130),life:.8,max:.8});if(saved===5){beacon={x:player.x+rand(-500,500),y:player.y+rand(-400,400)};toast('ALL CORES FOUND // RETURN TO BEACON')}}else if(saved===5&&Math.hypot(beacon.x-player.x,beacon.y-player.y)<65){finish(true)}else toast('NO SALVAGE IN RANGE')}
function finish(win){ended=true;$('end').classList.remove('hidden');$('endtag').textContent=win?'DIVE REPORT // SUCCESS':'DIVE REPORT // LOST SIGNAL';$('endtitle').innerHTML=win?'MISSION<br><span>COMPLETE.</span>':'SIGNAL<br><span>LOST.</span>';$('enddesc').textContent=win?`All five data cores recovered. Dive score: ${score}. The Asterion's final transmission is yours.`:`Oxygen depleted or the leviathan caught you. You recovered ${saved} of 5 data cores. Dive score: ${score}.`}
function keydown(e){let k=e.key.toLowerCase();keys[k]=true;if([' ','arrowup','arrowdown','arrowleft','arrowright'].includes(k))e.preventDefault();if(k===' '&&!e.repeat)pulse();if(k==='e'&&!e.repeat)collect()}
function keyup(e){keys[e.key.toLowerCase()]=false}
addEventListener('keydown',keydown);addEventListener('keyup',keyup);
function draw(){
 ctx.clearRect(0,0,W,H);let g=ctx.createRadialGradient(W*.48,H*.5,10,W*.5,H*.5,Math.max(W,H)*.8);g.addColorStop(0,'#0b2c3b');g.addColorStop(.55,'#061b2a');g.addColorStop(1,'#020911');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 let cam=world();
 // suspended particles
 for(let i=0;i<120;i++){let x=((i*137.5+time*9)% (W+40))-20,y=((i*83.7+Math.sin(time+i)*18)%(H+40))-20;ctx.fillStyle=`rgba(134,220,220,${.12+(i%4)*.04})`;ctx.fillRect(x,y,1.4,1.4)}
 // distant wreck silhouette
 ctx.save();ctx.translate(W/2-cam.x*.13,H/2-cam.y*.13);ctx.globalAlpha=.16;ctx.fillStyle='#183e4b';ctx.beginPath();ctx.moveTo(-420,180);ctx.lineTo(-350,-80);ctx.lineTo(-120,-170);ctx.lineTo(40,-130);ctx.lineTo(220,-210);ctx.lineTo(390,-30);ctx.lineTo(470,190);ctx.closePath();ctx.fill();ctx.restore();
 // seabed grid
 ctx.strokeStyle='#5ab2bd12';ctx.lineWidth=1;let spacing=100,ox=(-cam.x%spacing),oy=(-cam.y%spacing);ctx.beginPath();for(let x=ox;x<W;x+=spacing){ctx.moveTo(x,0);ctx.lineTo(x,H)}for(let y=oy;y<H;y+=spacing){ctx.moveTo(0,y);ctx.lineTo(W,y)}ctx.stroke();
 // rocks
 for(let r of rocks){let x=r.x-cam.x,y=r.y-cam.y;if(x<-70||x>W+70||y<-70||y>H+70)continue;ctx.fillStyle=`rgba(18,47,58,${r.a})`;ctx.beginPath();ctx.ellipse(x,y,r.r,r.r*.62, r.type,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#76c4c422';ctx.stroke()}
 // cores only visible inside sonar radius
 for(let c of cores){if(c.got)continue;let x=c.x-cam.x,y=c.y-cam.y,dist=Math.hypot(c.x-player.x,c.y-player.y),visible=dist<sonar*1000+110;if(visible){let glow=ctx.createRadialGradient(x,y,1,x,y,28);glow.addColorStop(0,'#8fffffcc');glow.addColorStop(1,'#54d8df00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,28,0,7);ctx.fill();ctx.save();ctx.translate(x,y);ctx.rotate(time*.8+c.phase);ctx.strokeStyle='#9cfff3';ctx.lineWidth=2;ctx.strokeRect(-7,-7,14,14);ctx.restore()}}
 // beacon
 if(saved===5){let x=beacon.x-cam.x,y=beacon.y-cam.y;ctx.strokeStyle='#8dffc9';ctx.setLineDash([5,7]);ctx.beginPath();ctx.arc(x,y,24,0,7);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#8dffc9';ctx.fillRect(x-2,y-34,4,68)}
 // monster, visibility based on sonar or proximity
 let mx=monster.x-cam.x,my=monster.y-cam.y,md=Math.hypot(monster.x-player.x,monster.y-player.y);
 if(md<sonar*950+130||md<190){ctx.save();ctx.translate(mx,my);let alpha=clamp(1-md/1200,.15,.8);ctx.globalAlpha=alpha;ctx.fillStyle='#061017';ctx.shadowColor='#ef5960';ctx.shadowBlur=monster.alert?35:15;ctx.beginPath();ctx.ellipse(0,0,58,23,Math.atan2(monster.vy,monster.vx),0,7);ctx.fill();ctx.fillStyle='#ff5364';ctx.beginPath();ctx.arc(28,-4,3,0,7);ctx.fill();ctx.restore()}
 // particles
 for(let p of particles){let x=p.x-cam.x,y=p.y-cam.y;ctx.fillStyle=`rgba(117,244,230,${p.life/p.max})`;ctx.beginPath();ctx.arc(x,y,2,0,7);ctx.fill()}
 // player sub
 ctx.save();ctx.translate(W/2,H/2);ctx.rotate(player.angle);ctx.shadowColor='#75f4e6';ctx.shadowBlur=20;ctx.fillStyle='#c3fff6';ctx.beginPath();ctx.moveTo(23,0);ctx.lineTo(-15,-11);ctx.lineTo(-9,0);ctx.lineTo(-15,11);ctx.closePath();ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#235f70';ctx.fillRect(-7,-5,8,10);ctx.strokeStyle='#e2ffff';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-17,-13);ctx.lineTo(-17,13);ctx.stroke();ctx.restore();
 // sonar rings
 if(sonar>0){let radius=(.85-sonar)*850;ctx.strokeStyle=`rgba(117,244,230,${sonar/.85*.75})`;ctx.lineWidth=2;ctx.beginPath();ctx.arc(W/2,H/2,radius,0,7);ctx.stroke();ctx.strokeStyle=`rgba(117,244,230,${sonar/.85*.14})`;ctx.beginPath();ctx.arc(W/2,H/2,radius*.84,0,7);ctx.stroke()}
 // vignette
 let vg=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.72);vg.addColorStop(0,'#0000');vg.addColorStop(1,'#000b');ctx.fillStyle=vg;ctx.fillRect(0,0,W,H);
}
function update(dt){
 if(!started||ended)return;time+=dt;oxygen-=dt*(.75+(monster.alert>.1?.12:0));if(oxygen<=0){oxygen=0;finish(false)}
 let ax=(keys.d||keys.arrowright?1:0)-(keys.a||keys.arrowleft?1:0),ay=(keys.s||keys.arrowdown?1:0)-(keys.w||keys.arrowup?1:0),len=Math.hypot(ax,ay)||1;ax/=len;ay/=len;
 let boosting=keys.shift&&player.boost<=0&&oxygen>8;if(boosting){player.boost=.55;oxygen-=2;toast('THRUSTER BOOST')}
 let speed=boosting?420:190;player.vx+=(ax*speed-player.vx)*Math.min(1,dt*3.8);player.vy+=(ay*speed-player.vy)*Math.min(1,dt*3.8);player.x+=player.vx*dt;player.y+=player.vy*dt;if(Math.hypot(player.vx,player.vy)>8)player.angle=Math.atan2(player.vy,player.vx);
 player.boost=Math.max(0,player.boost-dt);player.inv=Math.max(0,player.inv-dt);sonar=Math.max(0,sonar-dt);monster.alert=Math.max(0,monster.alert-dt*.45);
 let dx=player.x-monster.x,dy=player.y-monster.y,d=Math.hypot(dx,dy)||1,aggression=monster.alert>0?1.15:.48;
 monster.vx+=(dx/d*115*aggression-monster.vx)*dt*.48;monster.vy+=(dy/d*115*aggression-monster.vy)*dt*.48;monster.x+=monster.vx*dt;monster.y+=monster.vy*dt;
 if(d<42&&player.inv<=0){oxygen-=16;player.inv=1.8;player.x-=dx/d*90;player.y-=dy/d*90;toast('HULL BREACH // CREATURE CONTACT')}
 for(let p of particles){p.life-=dt;p.x+=Math.cos(p.a)*p.v*dt;p.y+=Math.sin(p.a)*p.v*dt}particles=particles.filter(p=>p.life>0);
 if(toastTimer>0){toastTimer-=dt;if(toastTimer<=0)$('notice').style.opacity=0}
 $('oxygen').textContent=Math.ceil(oxygen)+'%';$('oxygen').style.color=oxygen<25?'#ff727c':'var(--cyan)';$('salvage').textContent=saved+' / 5';$('depth').textContent=Math.round(240+Math.abs(player.y)*.08)+' M';
 if(saved===5)$('mission').textContent='All data cores secured. Follow the green extraction beacon and press E when close.';
}
function loop(ts){let dt=Math.min((ts-last)/1000||0,.033);last=ts;update(dt);draw();requestAnimationFrame(loop)}
$('start').onclick=()=>{$('intro').classList.add('hidden');reset();started=true;toast('DIVE SYSTEMS ONLINE')};
$('again').onclick=()=>{$('end').classList.add('hidden');reset();started=true};
reset();requestAnimationFrame(loop);
})();