import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene=new THREE.Scene(); scene.background=new THREE.Color(0x081414); scene.fog=new THREE.FogExp2(0x101e1c,.026);
const camera=new THREE.PerspectiveCamera(72,innerWidth/innerHeight,.1,220); camera.position.set(0,1.7,8);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:"high-performance"}); renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.1;document.getElementById('game').appendChild(renderer.domElement);
const clock=new THREE.Clock(); let yaw=0,pitch=0,locked=false,started=false,paused=false,lanternOn=false,oil=100,sanity=100,memories=0,phase=0,dialogBusy=false;
const keys={};const colliders=[];const interactables=[];const memoryItems=[];const mats={};
const texLoader=new THREE.TextureLoader();
function mat(color,rough=.9,emissive=0){return new THREE.MeshStandardMaterial({color,roughness:rough,emissive,emissiveIntensity:emissive?1:0})}
function textureMat(file,rough=1){const t=texLoader.load('./assets/'+file);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(2,2);return new THREE.MeshStandardMaterial({map:t,roughness:rough})}
const groundMat=textureMat('mud-ground.jpg'),woodMat=textureMat('wet-wood.jpg'),wallMat=textureMat('old-plaster.jpg'),brickMat=textureMat('brick-wall.jpg');
const waterMat=new THREE.MeshStandardMaterial({color:0x142b2b,roughness:.22,metalness:.15,transparent:true,opacity:.94});
scene.add(new THREE.HemisphereLight(0x9bb4ad,0x10120d,1.15));
const moon=new THREE.DirectionalLight(0x9bbbd0,1.0);moon.position.set(-18,25,8);moon.castShadow=true;moon.shadow.mapSize.set(2048,2048);scene.add(moon);
const ambient=new THREE.AmbientLight(0x3a514c,.35);scene.add(ambient);
const lantern=new THREE.PointLight(0xffb96b,0,17,1.7);lantern.position.set(0,1.5,0);camera.add(lantern);scene.add(camera);
function box(x,y,z,sx,sy,sz,material,collide=true){const m=new THREE.Mesh(new THREE.BoxGeometry(sx,sy,sz),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;scene.add(m);if(collide)colliders.push({x,z,sx,sz});return m}
function cylinder(x,y,z,r1,r2,h,material,seg=8){const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,seg),material);m.position.set(x,y,z);m.castShadow=true;scene.add(m);return m}
function tree(x,z,scale=1){const trunk=cylinder(x,1.8*scale,z,.22*scale,.34*scale,3.6*scale,mat(0x30271e));for(let i=0;i<4;i++){let a=i*Math.PI/2;const branch=cylinder(x+Math.sin(a)*.7*scale,2.8*scale,z+Math.cos(a)*.7*scale,.08*scale,.19*scale,1.9*scale,mat(0x30271e));branch.rotation.z=Math.sin(a)*-.65;branch.rotation.x=Math.cos(a)*.65}
 for(let i=0;i<10;i++){let a=Math.random()*6.28,r=Math.random()*1.8*scale;const leaf=new THREE.Mesh(new THREE.IcosahedronGeometry((.6+Math.random()*.6)*scale,1),mat([0x172b23,0x203a2d,0x293b2c][i%3]));leaf.position.set(x+Math.cos(a)*r,3.5*scale+Math.random()*1.6*scale,z+Math.sin(a)*r);leaf.scale.y=.8;leaf.castShadow=true;scene.add(leaf)}}
function lamp(x,z){const pole=cylinder(x,1.7,z,.06,.09,3.4,mat(0x262b26));const bulb=new THREE.PointLight(0xffae63,2.4,9,2);bulb.position.set(x,3.3,z);scene.add(bulb);const glow=new THREE.Mesh(new THREE.SphereGeometry(.12,8,8),new THREE.MeshBasicMaterial({color:0xffc477}));glow.position.copy(bulb.position);scene.add(glow)}
function house(x,z){box(x,1.6,z,5,3.2,4,wallMat);const roof=new THREE.Mesh(new THREE.ConeGeometry(3.8,2.1,4),brickMat);roof.position.set(x,4.1,z);roof.rotation.y=Math.PI/4;roof.castShadow=true;scene.add(roof);box(x,1,z-2.04,1.1,2,.12,woodMat,false);box(x-1.2,2,z-2.08,.65,.65,.08,mat(0x182d2b),false);box(x+1.2,2,z-2.08,.65,.65,.08,mat(0x182d2b),false)}
// world plane and river
const floor=new THREE.Mesh(new THREE.PlaneGeometry(100,100),groundMat);floor.rotation.x=-Math.PI/2;floor.position.y=-.08;floor.receiveShadow=true;scene.add(floor);
const river=new THREE.Mesh(new THREE.PlaneGeometry(34,70,30,50),waterMat);river.rotation.x=-Math.PI/2;river.position.set(29,-.12,-8);scene.add(river);
for(let i=0;i<18;i++){let x=-36+Math.random()*72,z=-35+Math.random()*60;if(x>19&&x<40)continue;tree(x,z,.7+Math.random()*.65)}
house(-13,-8);house(-23,4);house(2,-18);house(-3,16);
for(let x=-29;x<18;x+=7)lamp(x,3);
for(let i=0;i<22;i++){let x=-27+Math.random()*47,z=-28+Math.random()*50;const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(.25+Math.random()*.5,0),mat(0x42443a));rock.position.set(x,.05,z);rock.scale.y=.5;rock.castShadow=true;scene.add(rock)}
// Ghat and ferry
for(let i=0;i<7;i++)box(18,.02,-1+i*1.1,8,.25,1,woodMat,false);
for(let x of [14,22]){cylinder(x,.8,-1,.13,.16,1.6,mat(0x39291d));}
const boat=new THREE.Group();const hull=new THREE.Mesh(new THREE.CylinderGeometry(1.05,1.55,7,12,1,true),woodMat);hull.rotation.z=Math.PI/2;hull.rotation.x=Math.PI/2;hull.position.y=.1;boat.add(hull);const inner=new THREE.Mesh(new THREE.BoxGeometry(5.5,.16,1.3),woodMat);inner.position.y=.4;boat.add(inner);boat.position.set(28,.12,-7);boat.rotation.y=.3;scene.add(boat);
tree(12,-10,1.5);tree(17,-14,1.1);lamp(19,-3);
function makeInteract(x,z,name,desc,kind,fn){const g=new THREE.Group();g.position.set(x,0,z);const orb=new THREE.Mesh(new THREE.IcosahedronGeometry(.22,1),new THREE.MeshBasicMaterial({color:0xc8a36c}));orb.position.y=1.25;g.add(orb);const ring=new THREE.Mesh(new THREE.TorusGeometry(.38,.025,6,24),new THREE.MeshBasicMaterial({color:0xb58c58}));ring.position.y=1.25;g.add(ring);scene.add(g);interactables.push({x,z,name,desc,kind,fn,mesh:g,done:false})}
const memoriesData=[
 ["A CHILD'S SLATE","Arif's handwriting is scratched into the slate: “If the river calls, count to seven. It cannot cross a name spoken backwards.”","The slate feels warm. Someone has held it recently."],
 ["THE RED THREAD","A red thread is tied around a rusted ferry nail. Your mother used this knot to mark safe doors.","A voice behind you whispers: “Rupa… you came back.”"],
 ["THE FERRY TOKEN","A brass token stamped 1987. The ferryman's face has been scratched away.","The token is wet. The rain has not touched it."],
 ["MOTHER'S LETTER","The paper smells of smoke and mustard oil. The ink has bled into the shape of a river.","“I heard him too. I should never have answered.”"],
 ["THE BROKEN OAR","A splinter from the ferry. There are fingernail marks on its underside.","Something knocks three times from beneath the planks."],
 ["THE NAME IN WATER","The river surface reflects a boy standing beside you. When you turn, the ghat is empty.","Arif mouths a word without sound: “Remember.”"]
];
const positions=[[-18,-4],[-7,13],[9,-12],[-24,12],[15,7],[23,-5]];
memoriesData.forEach((d,i)=>makeInteract(...positions[i],d[0],d[1],"memory",()=>collectMemory(i)));
makeInteract(-13,-8,"THE LANTERN","A battered hurricane lantern sits on the veranda. Its wick is still warm.","lantern",()=>{lanternOn=true;oil=100;showDialog("THE LANTERN","The flame catches with a small blue pulse. The darkness seems to lean away — but only a little.",["Keep moving"],()=>{});});
makeInteract(18,-1,"THE FERRYMAN","A thin man stands at the end of the jetty. His face is hidden by rain.","ferryman",()=>ferrymanScene());
makeInteract(-3,16,"THE SHRINE","A tiny roadside shrine. Someone has left fresh marigolds and a child's sandal.","shrine",()=>shrineScene());
makeInteract(1,-18,"THE RADIO","An old radio hisses with a voice you recognise.","radio",()=>radioScene());
function addFloatingText(text,x,z){const c=document.createElement('canvas');c.width=512;c.height=128;const ctx=c.getContext('2d');ctx.font='bold 30px Georgia';ctx.fillStyle='#e6c995';ctx.textAlign='center';ctx.fillText(text,256,70);const t=new THREE.CanvasTexture(c);const s=new THREE.Sprite(new THREE.SpriteMaterial({map:t,transparent:true}));s.position.set(x,2.3,z);s.scale.set(4,1,1);scene.add(s);return s}
interactables.forEach(o=>addFloatingText(o.name,o.x,o.z));
// rain particles
const rainN=2200, rainGeo=new THREE.BufferGeometry(), rainPos=new Float32Array(rainN*3);
for(let i=0;i<rainN;i++){rainPos[i*3]=(Math.random()-.5)*75;rainPos[i*3+1]=Math.random()*28;rainPos[i*3+2]=(Math.random()-.5)*75}
rainGeo.setAttribute('position',new THREE.BufferAttribute(rainPos,3));const rain=new THREE.Points(rainGeo,new THREE.PointsMaterial({color:0x9db9bd,size:.055,transparent:true,opacity:.55}));scene.add(rain);
// fog wisps
const fogSprites=[];for(let i=0;i<18;i++){const m=new THREE.Mesh(new THREE.PlaneGeometry(7,2.2),new THREE.MeshBasicMaterial({color:0x8ca09a,transparent:true,opacity:.045,depthWrite:false}));m.position.set(-25+Math.random()*50,.45+Math.random()*.4,-25+Math.random()*45);m.rotation.x=-Math.PI/2;m.rotation.z=Math.random()*3;scene.add(m);fogSprites.push(m)}
// sounds
const wind=new Audio('./assets/monsoon-wind.wav');wind.loop=true;wind.volume=.25;const riverSound=new Audio('./assets/river-drone.wav');riverSound.loop=true;riverSound.volume=.23;const heart=new Audio('./assets/distant-heartbeat.wav');heart.loop=true;heart.volume=0;
function startAudio(){wind.play().catch(()=>{});riverSound.play().catch(()=>{});}
function showDialog(speaker,text,choices=["Continue"],callback=()=>{}){dialogBusy=true;document.exitPointerLock?.();document.getElementById('speaker').textContent=speaker;document.getElementById('dialogtext').textContent=text;const area=document.getElementById('choices');area.innerHTML='';choices.forEach((c,i)=>{const b=document.createElement('button');b.textContent=c;b.onclick=()=>{document.getElementById('dialog').classList.add('hidden');dialogBusy=false;callback(i)};area.appendChild(b)});document.getElementById('continue').classList.add('hidden');document.getElementById('dialog').classList.remove('hidden')}
function collectMemory(i){const o=interactables.find(o=>o.kind==='memory'&&o.name===memoriesData[i][0]);if(o.done)return;o.done=true;memories++;document.getElementById('notes').textContent=`MEMORIES ${memories} / 6`;showDialog(memoriesData[i][0],memoriesData[i][1]+"\n\n"+memoriesData[i][2],["Fold the memory away"],()=>{sanity=Math.max(0,sanity-3);updateMeters();if(memories===6)setTimeout(()=>showDialog("THE RIVER","Six memories. Six pieces of a night your family tried to bury. The ferryman is waiting.",["Go to the jetty"],()=>{}),350)})}
function ferrymanScene(){if(memories<6){showDialog("THE FERRYMAN","His voice comes from the rain, not his mouth. “You have forgotten too much. Bring the river what it remembers.”",["I will return"]);return}
showDialog("THE FERRYMAN","“Your brother did not drown, Rupa. He answered. The river kept the voice and let the body go.”",["Ask what it wants","Ask about Arif"],n=>{if(n===0)showDialog("THE FERRYMAN","“A name. A living name. One answer, and the ferry crosses.”",["I will not answer","I will answer"],m=>ending(m===0));else showDialog("THE FERRYMAN","“He is still calling from the other bank. You can take his place… or leave him where he is.”",["Leave him","Call him home"],m=>ending(m===0))})}
function shrineScene(){showDialog("THE SHRINE","The marigolds are fresh. A child's voice counts softly: “এক… দুই… তিন…” The count stops at six.",["Place the red thread"],()=>{sanity=Math.min(100,sanity+12);updateMeters();showDialog("A SMALL MERCY","The flame steadies. For a moment, the rain sounds like rain again.")})}
function radioScene(){showDialog("RADIO STATIC","A woman's voice, almost buried in static: “Rupa, don't let him use your voice. He learned it from me.”",["Turn it off"],()=>{sanity=Math.max(0,sanity-8);updateMeters()})}
function ending(save){document.getElementById('hud').classList.add('hidden');document.getElementById('ending').classList.remove('hidden');if(save){document.getElementById('endingtitle').textContent="THE QUIET BANK";document.getElementById('endingtext').textContent="You refuse to answer. The ferryman lowers his oar. At dawn, the river gives back a brass token and a boy's small footprint in the mud. You walk home alone — but the voice never calls again."}else{document.getElementById('endingtitle').textContent="THE ANSWER";document.getElementById('endingtext').textContent="You speak Arif's name. The boat glides without a ripple. A familiar hand reaches from the mist. When the village wakes, the ferry is gone — and one more voice can be heard calling from the river."}paused=true;document.exitPointerLock?.()}
function updateMeters(){document.getElementById('sanity').style.width=sanity+'%';document.getElementById('oil').style.width=oil+'%';}
function nearest(){let best=null,d=2.6;for(const o of interactables){if(o.done)continue;const dd=Math.hypot(camera.position.x-o.x,camera.position.z-o.z);if(dd<d){d=dd;best=o}}return best}
function startGame(){started=true;document.getElementById('intro').classList.add('hidden');document.getElementById('hud').classList.remove('hidden');startAudio();renderer.domElement.requestPointerLock?.()}
document.getElementById('start').onclick=startGame;
document.addEventListener('pointerlockchange',()=>{locked=document.pointerLockElement===renderer.domElement;if(started&&!dialogBusy&&!locked)document.getElementById('pause').classList.remove('hidden');else document.getElementById('pause').classList.add('hidden')});
document.getElementById('pause').onclick=()=>{renderer.domElement.requestPointerLock?.();document.getElementById('pause').classList.add('hidden')};
document.addEventListener('mousemove',e=>{if(!locked||dialogBusy)return;yaw-=e.movementX*.0022;pitch-=e.movementY*.0018;pitch=Math.max(-1.35,Math.min(1.35,pitch));camera.rotation.set(pitch,yaw,0,'YXZ')});
document.addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='KeyF'&&started){lanternOn=!lanternOn}if(e.code==='KeyE'&&started&&!dialogBusy){const o=nearest();if(o)o.fn()}if(e.code==='Escape'&&dialogBusy){}});
document.addEventListener('keyup',e=>keys[e.code]=false);
renderer.domElement.addEventListener('click',()=>{if(started&&!locked&&!dialogBusy)renderer.domElement.requestPointerLock?.()});
function collide(x,z){for(const c of colliders){if(Math.abs(x-c.x)<c.sx/2+.42&&Math.abs(z-c.z)<c.sz/2+.42)return true}return x<-43||x>43||z<-43||z>43||x>18&&x<40}
function update(dt){if(!started||paused||dialogBusy)return;const speed=(keys.ShiftLeft||keys.ShiftRight)?6.1:3.5;let f=0,s=0;if(keys.KeyW||keys.ArrowUp)f=1;if(keys.KeyS||keys.ArrowDown)f=-1;if(keys.KeyA||keys.ArrowLeft)s=-1;if(keys.KeyD||keys.ArrowRight)s=1;const len=Math.hypot(f,s)||1;f/=len;s/=len;const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*s)*speed*dt,dz=(-Math.cos(yaw)*f-Math.sin(yaw)*s)*speed*dt;const nx=camera.position.x+dx,nz=camera.position.z+dz;if(!collide(nx,camera.position.z))camera.position.x=nx;if(!collide(camera.position.x,nz))camera.position.z=nz;camera.position.y=1.7;
lantern.position.set(0,-.1,-.25);lantern.intensity=lanternOn&&oil>0?2.4:0;if(lanternOn&&oil>0){oil-=dt*.9;if(oil<=0)lanternOn=false}
const threat=Math.max(0,1-Math.hypot(camera.position.x-28,camera.position.z+7)/18);sanity=Math.max(0,sanity-dt*(.06+threat*.6));if(sanity<35)heart.volume=Math.min(.55,(35-sanity)/70);if(sanity<10&&Math.random()<.002)showDialog("A VOICE IN THE RAIN","“Rupa… just turn around. I am right here.”",["Do not turn"],()=>{sanity=Math.max(0,sanity-5);updateMeters()});
updateMeters();const o=nearest();document.getElementById('prompt').textContent=o?'[ E ]  '+o.name:'';
document.getElementById('objective').textContent=!lanternOn?'Find the lantern':memories<6?`Recover the six memories (${memories}/6)`:'Return to the ferryman';
const p=rain.geometry.attributes.position;for(let i=0;i<rainN;i++){p.array[i*3+1]-=dt*18;if(p.array[i*3+1]<0){p.array[i*3+1]=25+Math.random()*5;p.array[i*3]=camera.position.x+(Math.random()-.5)*65;p.array[i*3+2]=camera.position.z+(Math.random()-.5)*65}}p.needsUpdate=true;
fogSprites.forEach((m,i)=>{m.position.x+=Math.sin(clock.elapsedTime*.2+i)*dt*.2});
boat.position.y=.12+Math.sin(clock.elapsedTime*.8)*.07;boat.rotation.z=Math.sin(clock.elapsedTime*.55)*.018;
}
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.04);update(dt);renderer.render(scene,camera)}animate();
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
