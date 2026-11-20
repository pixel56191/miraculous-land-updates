const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
// ===== Ядро: реестры (новый контент добавляется здесь или через Game.use) =====
const G=window.Game={version:'0.0.4.3 Альфа 3D',items:{},nodes:{},recipes:[],mods:[],
 registerItem(id,o){o.ru=o.n;Object.defineProperty(o,'n',{get(){return L(this.ru)},enumerable:true});this.items[id]=o},registerNode(id,o){if(o.hint){o.hru=o.hint;Object.defineProperty(o,'hint',{get(){return L(this.hru)},enumerable:true})}this.nodes[id]=o},registerRecipe(r){this.recipes.push(r)},
 use(f){this.mods.push(f);f(this)}};
G.use(g=>{
 g.registerItem('wood',{n:'Дерево'});g.registerItem('stone',{n:'Камень'});g.registerItem('fiber',{n:'Волокно'});
 g.registerItem('berry',{n:'Ягоды',eat:{food:12,water:3}});
 g.registerItem('axe',{n:'Топор',tool:'axe'});g.registerItem('pickaxe',{n:'Кирка',tool:'pick'});
 g.registerItem('campfire',{n:'Костёр',place:'campfire'});g.registerItem('bandage',{n:'Бинт',eat:{hp:25}});
 g.registerItem('meat',{n:'Сырое мясо',eat:{food:8,hp:-8},cook:'meat_c'});g.registerItem('meat_c',{n:'Жареное мясо',eat:{food:38}});
 g.registerItem('fish',{n:'Рыба',eat:{food:6,hp:-4},cook:'fish_c'});g.registerItem('fish_c',{n:'Жареная рыба',eat:{food:28,water:3}});
 g.registerItem('hide',{n:'Шкура'});g.registerItem('bone',{n:'Кость'});g.registerItem('spear',{n:'Копьё',tool:'spear'});
 g.registerItem('plank',{n:'Доски'});g.registerItem('clay',{n:'Глина',smelt:'brick'});g.registerItem('brick',{n:'Кирпич'});
 g.registerItem('iron_ore',{n:'Железная руда',smelt:'iron_ingot'});g.registerItem('coal',{n:'Уголь'});g.registerItem('iron_ingot',{n:'Железный слиток'});
 g.registerItem('floor',{n:'Пол',place:'floor'});g.registerItem('wall',{n:'Стена',place:'wall'});g.registerItem('window',{n:'Стена с окном',place:'window'});
 g.registerItem('door',{n:'Дверь',place:'door'});g.registerItem('roof',{n:'Крыша',place:'roof'});g.registerItem('chest',{n:'Сундук',place:'chest'});
 g.registerItem('bench',{n:'Верстак',place:'bench'});g.registerItem('furnace',{n:'Печь',place:'furnace'});
 g.registerNode('tree',{hint:'Рубить дерево',solid:1,r:.45,hp:4,tool:'axe',drops:[['wood',2,3],['fiber',0,1]]});
 g.registerNode('rock',{hint:'Добывать камень',solid:1,r:.85,hp:5,tool:'pick',drops:[['stone',2,3]]});
 g.registerNode('bush',{hint:'Собрать ягоды',hp:1,drops:[['berry',1,3],['fiber',0,2]],regrow:70});
 g.registerNode('campfire',{solid:1,r:.6,hp:99,fixed:1});
 g.registerNode('clay',{hint:'Копать глину',solid:1,r:.7,hp:3,drops:[['clay',2,3]]});
 g.registerNode('iron',{hint:'Добывать железную руду',solid:1,r:.8,hp:6,tool:'pick',need:'pick',drops:[['iron_ore',1,2]]});
 g.registerNode('coal',{hint:'Добывать уголь',solid:1,r:.8,hp:5,tool:'pick',need:'pick',drops:[['coal',1,3]]});
 g.registerRecipe({out:'axe',n:1,in:{wood:3,stone:2}});g.registerRecipe({out:'pickaxe',n:1,in:{wood:3,stone:3}});
 g.registerRecipe({out:'campfire',n:1,in:{wood:5,stone:2}});g.registerRecipe({out:'bandage',n:1,in:{fiber:3}});
 g.registerRecipe({out:'spear',n:1,in:{wood:3,stone:1,fiber:2}});
 g.registerRecipe({out:'bench',n:1,in:{wood:6,stone:3}});g.registerRecipe({out:'furnace',n:1,in:{stone:10,clay:4}});
 g.registerRecipe({out:'plank',n:2,in:{wood:2},at:'bench'});g.registerRecipe({out:'floor',n:1,in:{plank:4},at:'bench'});
 g.registerRecipe({out:'wall',n:1,in:{plank:4},at:'bench'});g.registerRecipe({out:'window',n:1,in:{plank:4},at:'bench'});
 g.registerRecipe({out:'door',n:1,in:{plank:4,iron_ingot:1},at:'bench'});g.registerRecipe({out:'roof',n:1,in:{plank:3,brick:2},at:'bench'});
 g.registerRecipe({out:'chest',n:1,in:{plank:8},at:'bench'});
});
// ===== Шум и рельеф =====
let seed=1337,P,S,inv,time,day,dead=false,cool=0,acc=0,saveT=0;
const rng=a=>()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const h=(x,y)=>{const n=Math.sin(x*127.1+y*311.7+seed)*43758.5453;return n-Math.floor(n)};
const sm=a=>a*a*(3-2*a);
function vn(x,y){const xi=Math.floor(x),yi=Math.floor(y),u=sm(x-xi),v=sm(y-yi),a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),d=h(xi+1,yi+1);return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v}
const WPD={wl:.4,amp:26,forest:.5,ftree:.5,res:1,animals:1,wolves:1,diff:1,day:240,start:.1,name:'Мир'};let WP=Object.assign({},WPD),SEEDTXT='';
const hgt=(x,z)=>{const X=x+300,Z=z+300,e=vn(X/40,Z/40)*.6+vn(X/17,Z/17)*.28+vn(X/7,Z/7)*.12;
 const k=clamp(1-Math.hypot(x,z)/16,0,1),s=k*k*(3-2*k);return (e-WP.wl)*WP.amp*(1-s)+1.5*s};
// ===== Three.js: сцена, небо, свет =====
const ren=new THREE.WebGLRenderer({antialias:true});ren.setPixelRatio(Math.min(devicePixelRatio,2));
ren.shadowMap.enabled=true;ren.shadowMap.type=THREE.PCFSoftShadowMap;document.body.prepend(ren.domElement);
const scene=new THREE.Scene(),cam=new THREE.PerspectiveCamera(62,1,.1,700);
scene.fog=new THREE.Fog(0x88aacc,45,180);
const hemi=new THREE.HemisphereLight(0xbfd8ff,0x3a4a2a,.6),sun=new THREE.DirectionalLight(0xfff2d0,1.2),moon=new THREE.DirectionalLight(0x6a7fb0,0);
sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);sun.shadow.bias=-.0006;
const sc=sun.shadow.camera;sc.left=sc.bottom=-45;sc.right=sc.top=45;sc.far=220;
scene.add(hemi,sun,sun.target,moon);
const skyU={top:{value:new THREE.Color()},bot:{value:new THREE.Color()}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(450,16,10),new THREE.ShaderMaterial({uniforms:skyU,side:THREE.BackSide,depthWrite:false,fog:false,
 vertexShader:'varying float vy;void main(){vy=normalize(position).y;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
 fragmentShader:'uniform vec3 top,bot;varying float vy;void main(){gl_FragColor=vec4(mix(bot,top,pow(clamp(vy,0.,1.),.55)),1.);}'}));
sky.renderOrder=-1;scene.add(sky);
const sp=[];{const R=rng(7);for(let i=0;i<700;i++){const a=R()*6.283,e=Math.acos(R()*.95+.05);sp.push(Math.sin(e)*Math.cos(a)*420,Math.cos(e)*420,Math.sin(e)*Math.sin(a)*420)}}
const sg=new THREE.BufferGeometry();sg.setAttribute('position',new THREE.Float32BufferAttribute(sp,3));
const stars=new THREE.Points(sg,new THREE.PointsMaterial({size:1.7,sizeAttenuation:false,transparent:true,fog:false,depthWrite:false}));scene.add(stars);
const sunD=new THREE.Mesh(new THREE.SphereGeometry(14,16,12),new THREE.MeshBasicMaterial({color:0xfff1b0,fog:false})),
 moonD=new THREE.Mesh(new THREE.SphereGeometry(9,16,12),new THREE.MeshBasicMaterial({color:0xdfe8ff,fog:false}));scene.add(sunD,moonD);
const cNT=new THREE.Color(0x02050f),cDT=new THREE.Color(0x3f86d6),cNB=new THREE.Color(0x070b18),cDB=new THREE.Color(0xa8cdee),cDu=new THREE.Color(0xff8a4a),tc=new THREE.Color();
function env(){const a=time*6.2832,sn=Math.sin(a),cs=Math.cos(a),dy=clamp(sn*2+.4,0,1),du=Math.max(0,1-Math.abs(sn)*3.5);
 skyU.top.value.copy(cNT).lerp(cDT,dy);skyU.bot.value.copy(cNB).lerp(cDB,dy).lerp(cDu,du*.85);
 scene.fog.color.copy(skyU.bot.value);sky.position.copy(cam.position);
 sun.intensity=dy*1.3;sun.color.setHex(0xfff2d0).lerp(cDu,du*.7);hemi.intensity=.2+dy*.55;moon.intensity=(1-dy)*.4;
 const d=new THREE.Vector3(cs*.9,sn,.35).normalize();
 sun.position.set(P.x+d.x*90,P.y+Math.max(d.y,.15)*90,P.z+d.z*90);sun.target.position.set(P.x,P.y,P.z);
 moon.position.set(P.x-d.x*90,P.y+90,P.z-d.z*90);
 sunD.position.copy(cam.position).addScaledVector(d,400);moonD.position.copy(cam.position).addScaledVector(d,-400);
 stars.position.copy(cam.position);stars.material.opacity=Math.pow(1-dy,2);}
// ===== Мир =====
let world,nodes,grid,TR,RK,BS,BR,F=[],water;
const M4=new THREE.Matrix4(),QQ=new THREE.Quaternion(),EE=new THREE.Euler(),VV=new THREE.Vector3(),SS=new THREE.Vector3(),IDQ=new THREE.Quaternion();
const mt=c=>new THREE.MeshStandardMaterial({color:c,roughness:.9,flatShading:true});
function put(n,tilt=0){if(n.t=='campfire')return;
 const k=n.gone?.0001:n.s;EE.set(tilt,n.r,0);QQ.setFromEuler(EE);
 if(n.t=='tree'){VV.set(n.x,n.y-.05,n.z);SS.set(k,k,k);M4.compose(VV,QQ,SS);TR.forEach(m=>{m.setMatrixAt(n.i,M4);m.instanceMatrix.needsUpdate=true})}
 else if(RKT.includes(n.t)){VV.set(n.x,n.y+k*.3,n.z);SS.set(k*n.a*1.2,k*.8,k*n.a);M4.compose(VV,QQ,SS);RK.setMatrixAt(n.i,M4);RK.instanceMatrix.needsUpdate=true}
 else{VV.set(n.x,n.y+.3*k,n.z);SS.set(k,k*.75,k);M4.compose(VV,QQ,SS);BS.setMatrixAt(n.i,M4);BS.instanceMatrix.needsUpdate=true;
  const kb=n.dead?.0001:1;for(let j=0;j<4;j++){const a=j*1.7+n.r;VV.set(n.x+Math.cos(a)*.5*k,n.y+.5*k+j*.05,n.z+Math.sin(a)*.5*k);SS.set(kb,kb,kb);M4.compose(VV,IDQ,SS);BR.setMatrixAt(n.i*4+j,M4)}BR.instanceMatrix.needsUpdate=true}}
function buildWorld(){
 if(world)scene.remove(world);world=new THREE.Group();scene.add(world);nodes=[];grid=new Map();F=[];
 const g=new THREE.PlaneGeometry(200,200,160,160);g.rotateX(-Math.PI/2);
 const pa=g.attributes.position,col=new Float32Array(pa.count*3);
 for(let i=0;i<pa.count;i++)pa.setY(i,hgt(pa.getX(i),pa.getZ(i)));
 g.computeVertexNormals();const na=g.attributes.normal,c=new THREE.Color();
 for(let i=0;i<pa.count;i++){const y=pa.getY(i),sl=na.getY(i),j=h(i,3)*.12;
  if(y<.9)c.setRGB(.76+j,.69+j,.47);else if(sl<.82||y>9)c.setRGB(.42+j,.4+j,.38);else c.setRGB(.2+j+y*.012,.47+j-y*.01,.16+j*.5);
  if(y<0)c.multiplyScalar(.7);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
 g.setAttribute('color',new THREE.BufferAttribute(col,3));
 const ter=new THREE.Mesh(g,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));ter.receiveShadow=true;world.add(ter);
 const wg=new THREE.PlaneGeometry(200,200,64,64);wg.rotateX(-Math.PI/2);
 water=new THREE.Mesh(wg,new THREE.MeshStandardMaterial({color:0x2f7fb5,transparent:true,opacity:.78,roughness:.12,metalness:.25}));water.userData.b=wg.attributes.position.array.slice();world.add(water);
 const R=rng(seed),cnt={tree:0,rock:0,bush:0};
 const reg=n=>{const k=Math.floor(n.x/6)+','+Math.floor(n.z/6);(grid.get(k)||grid.set(k,[]).get(k)).push(n)};
 const addN=(t,x,y,z,s)=>{const n={t,x,y,z,s,r:R()*6.28,a:.8+R()*.5,hp:G.nodes[t].hp,i:cnt[RKT.includes(t)?'rock':t]++};nodes.push(n);reg(n)};
 for(let x=-95;x<95;x+=2.2)for(let z=-95;z<95;z+=2.2){
  const px=x+(R()-.5)*2,pz=z+(R()-.5)*2,y=hgt(px,pz),r=R();
  if(y<.7||y>9.5||Math.hypot(px,pz)<6)continue;
  if(vn(px/14+50,pz/14)>WP.forest&&r<WP.ftree)addN('tree',px,y,pz,.8+R()*.8);
  else if(y<1.7&&r>.94-.04*WP.res&&r<.94)addN('clay',px,y,pz,.7+R()*.5);else if(y>4.5&&r>.93-.05*WP.res&&r<.93)addN(r<.93-.025*WP.res?'coal':'iron',px,y,pz,.7+R()*.6);else if(r<.03*WP.res)addN('rock',px,y,pz,.6+R()*1.1);else if(r>.975)addN('bush',px,y,pz,.8+R()*.4)}
 const mk=(geo,mat,n,cs=true)=>{const m=new THREE.InstancedMesh(geo,mat,Math.max(1,n));m.castShadow=cs;m.receiveShadow=true;world.add(m);return m};
 const cone=(r,hh,y)=>new THREE.ConeGeometry(r,hh,7).translate(0,y,0);
 TR=[mk(new THREE.CylinderGeometry(.18,.28,2.4,6).translate(0,1.2,0),mt(0x5b3d24),cnt.tree),mk(cone(1.9,2.2,2.6),mt(0x2f6b34),cnt.tree),mk(cone(1.5,2,3.7),mt(0x38803c),cnt.tree),mk(cone(1.05,1.8,4.8),mt(0x43953f),cnt.tree)];
 const ig=new THREE.IcosahedronGeometry(1,1),ip=ig.attributes.position;
 for(let i=0;i<ip.count;i++){const x=ip.getX(i),y=ip.getY(i),z=ip.getZ(i),k=.8+h(x*9,z*7+y*5)*.4;ip.setXYZ(i,x*k,y*k,z*k)}
 ig.computeVertexNormals();RK=mk(ig,mt(0x8a8a86),cnt.rock);
 BS=mk(new THREE.IcosahedronGeometry(.75,1),mt(0x3d7a2a),cnt.bush);BR=mk(new THREE.SphereGeometry(.09,6,5),new THREE.MeshStandardMaterial({color:0xc0203a,roughness:.4}),cnt.bush*4,false);
 const cl=new THREE.Color();
 nodes.forEach(n=>{put(n);const m=n.t=='tree'?TR:RKT.includes(n.t)?[RK]:[BS];cl.setScalar(.7+h(n.x,n.z)*.3);if(TINT[n.t])cl.multiply(TINT[n.t]);m.forEach((q,j)=>{if(!(n.t=='tree'&&j==0)){q.setColorAt(n.i,cl)}})});
 [...TR,RK,BS].forEach(m=>{if(m.instanceColor)m.instanceColor.needsUpdate=true});
 const gc=7000,gr=mk(new THREE.ConeGeometry(.07,.55,3).translate(0,.27,0),new THREE.MeshStandardMaterial({color:0x5aa84a,roughness:1}),gc,false);gr.castShadow=false;
 let gi=0;for(let t=0;t<30000&&gi<gc;t++){const x=(R()-.5)*190,z=(R()-.5)*190,y=hgt(x,z);if(y<1||y>8)continue;
  const s=.6+R()*1.1;VV.set(x,y,z);EE.set((R()-.5)*.3,R()*6.28,(R()-.5)*.3);QQ.setFromEuler(EE);SS.set(s,s*(.7+R()*.8),s);M4.compose(VV,QQ,SS);gr.setMatrixAt(gi,M4);cl.setScalar(.6+R()*.5);gr.setColorAt(gi,cl);gi++}
 GRN=gi;GR=gr;gr.count=Math.floor(gi*GQ());gr.instanceColor.needsUpdate=true;PC=[];openC=null;TR.forEach((m,i)=>sway(m.material,i?1.2:.12));sway(BS.material,.5);sway(gr.material,3);spawnAnimals()}
function mkFire(x,z){
 const y=hgt(x,z),g=new THREE.Group();g.position.set(x,y,z);
 const st=mt(0x777777),lg=new THREE.MeshStandardMaterial({color:0x4a2f1a,roughness:1});
 for(let i=0;i<8;i++){const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.17,0),st),a=i*.785;m.position.set(Math.cos(a)*.5,.1,Math.sin(a)*.5);m.castShadow=true;g.add(m)}
 for(let i=0;i<3;i++){const m=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,.8,6),lg);m.rotation.set(Math.PI/2.6,i*2.1,0);m.position.y=.15;m.castShadow=true;g.add(m)}
 const f1=new THREE.Mesh(new THREE.ConeGeometry(.28,.8,7),new THREE.MeshBasicMaterial({color:0xff6a1a,transparent:true,opacity:.9})),f2=new THREE.Mesh(new THREE.ConeGeometry(.15,.5,6),new THREE.MeshBasicMaterial({color:0xffe27a}));
 f1.position.y=.5;f2.position.y=.4;g.add(f1,f2);
 const L=new THREE.PointLight(0xff8a30,1.6,28,1.6);L.position.y=1;g.add(L);world.add(g);
 const n={t:'campfire',x,y,z,s:1,r:0,hp:99,f1,f2,L,sk:mkPts(g,18,.12,0xffa030,.95,1),sm:mkPts(g,14,.6,0x888888,.2,0)};nodes.push(n);F.push(n);
 const k=Math.floor(x/6)+','+Math.floor(z/6);(grid.get(k)||grid.set(k,[]).get(k)).push(n);return n}
function near(x,z){const cx=Math.floor(x/6),cz=Math.floor(z/6),o=[];
 for(let i=-1;i<=1;i++)for(let j=-1;j<=1;j++){const a=grid.get((cx+i)+','+(cz+j));if(a)for(const n of a)o.push(n)}return o}
// ===== Игрок =====
const pl=new THREE.Group();scene.add(pl);pl.rotation.order='YXZ';
function box(w,hh,d,c,x,y,z,p){const m=new THREE.Mesh(new THREE.BoxGeometry(w,hh,d),new THREE.MeshStandardMaterial({color:c,roughness:.8}));m.position.set(x,y,z);m.castShadow=true;(p||pl).add(m);return m}
box(.6,.7,.34,0x5a6b3a,0,1.15,0);box(.42,.5,.2,0x7a4a22,0,1.2,-.28);
const head=new THREE.Group();head.position.y=1.72;pl.add(head);
{const M=(c,r=.8)=>new THREE.MeshStandardMaterial({color:c,roughness:r}),skin=M(0xe0b48a),hair=M(0x4a2f1a,.95),
 sp=(r,x,y,z,sx,sy,sz,m,ws=12)=>{const b=new THREE.Mesh(new THREE.SphereGeometry(r,ws,ws-2),m);b.position.set(x,y,z);b.scale.set(sx,sy,sz);b.castShadow=true;head.add(b);return b};
 sp(.22,0,0,0,.95,1.05,1,skin,16);sp(.15,0,-.1,.05,1,.75,.95,skin);
 const nk=new THREE.Mesh(new THREE.CylinderGeometry(.08,.09,.14,10),skin);nk.position.y=-.24;head.add(nk);
 for(const sx of[-1,1]){
  sp(.055,sx*.205,-.005,-.01,.45,1,.8,skin);sp(.03,sx*.2,-.005,0,.3,.7,.5,M(0xc98f68));
  sp(.04,sx*.085,.03,.19,1.2,.8,.4,M(0xffffff));sp(.022,sx*.085,.03,.2,1,1,.6,M(0x2b5d8a));sp(.012,sx*.085,.03,.21,1,1,.6,M(0x111111));sp(.006,sx*.09,.04,.215,1,1,1,M(0xffffff));
  const br=new THREE.Mesh(new THREE.BoxGeometry(.09,.016,.02),hair);br.position.set(sx*.085,.085,.205);br.rotation.z=-sx*.18;head.add(br);
  const sb=new THREE.Mesh(new THREE.BoxGeometry(.03,.12,.07),hair);sb.position.set(sx*.2,.02,.07);head.add(sb);
  sp(.035,sx*.12,-.07,.17,1,.8,.8,M(0xe8a58a))}
 sp(.03,0,-.03,.215,.9,1.1,1,M(0xd8a47c));
 const mo=new THREE.Mesh(new THREE.BoxGeometry(.075,.014,.02),M(0x8a3b3b));mo.position.set(0,-.1,.2);head.add(mo);
 const cap=new THREE.Mesh(new THREE.SphereGeometry(.245,18,12,0,Math.PI*2,0,Math.PI*.5),hair);cap.rotation.x=-.5;cap.scale.set(1,1.05,1.05);cap.castShadow=true;head.add(cap);
 for(let i=-2;i<=2;i++)sp(.06,i*.07,.125-Math.abs(i)*.012,.205-Math.abs(i)*.03,1,.7,.7,hair,8);
 sp(.2,0,-.03,-.1,1,1.05,.85,hair,14);sp(.08,0,.06,-.27,1,1,1,hair);sp(.045,0,-.07,-.33,.8,2.2,.8,hair);}
const limb=(x,y,col,len,hand)=>{const g=new THREE.Group();g.position.set(x,y,0);box(.22,len,.24,col,0,-len/2,0,g);if(hand)box(.18,.16,.2,0xe0b48a,0,-len-.04,0,g);pl.add(g);return g};
const legL=limb(-.15,.8,0x2f3b57,.78),legR=limb(.15,.8,0x2f3b57,.78),armL=limb(-.42,1.45,0x5a6b3a,.6,1),armR=limb(.42,1.45,0x5a6b3a,.6,1);
for(const l of[legL,legR]){box(.27,.13,.36,0x3b2a1e,0,-.74,.05,l);box(.25,.04,.3,0x1d140d,0,-.8,.05,l)}
box(.62,.08,.36,0x3a2a1a,0,.88,0);box(.1,.1,.02,0xc9a64a,0,.88,.19);
const axeG=new THREE.Group(),pkG=new THREE.Group();
const hd=(g,c,w,hh,d)=>{const s=new THREE.Mesh(new THREE.CylinderGeometry(.03,.03,.7,5),new THREE.MeshStandardMaterial({color:0x6b4423}));s.rotation.x=Math.PI/2;s.position.z=.25;g.add(s);box(w,hh,d,c,0,0,.55,g)};
hd(axeG,0xb0b4ba,.04,.24,.16);hd(pkG,0x8a8f96,.04,.1,.5);axeG.position.set(0,-.7,.1);pkG.position.set(0,-.7,.1);armR.add(axeG,pkG);
const upB=new THREE.Group();upB.position.y=.85;pl.add(upB);pl.updateMatrixWorld(true);[...pl.children].filter(c=>c!==upB&&c!==legL&&c!==legR).forEach(c=>upB.attach(c));
// ===== Иконки предметов (нарисованы вручную, SVG 48x48) =====
const ICON={
wood:`<ellipse cx="14" cy="34" rx="7" ry="8" fill="#c9a06a"/><rect x="14" y="26" width="24" height="16" fill="#8f5d30" stroke="none"/><path d="M14 26h24a7 8 0 0 1 0 16H14" fill="#8f5d30"/><path d="M20 31h14M20 37h10" stroke="#5f3b1c" fill="none"/><ellipse cx="14" cy="34" rx="7" ry="8" fill="#d9b27a"/><ellipse cx="14" cy="34" rx="4" ry="5" fill="none" stroke="#9a6a3a"/><circle cx="14" cy="34" r="1.2" fill="#8f5d30" stroke="none"/><rect x="10" y="9" width="28" height="15" rx="6" fill="#a8743f"/><path d="M16 14h16M16 19h10" stroke="#6b4423" fill="none"/><ellipse cx="38" cy="16.5" rx="5" ry="7.5" fill="#e2bd85"/><ellipse cx="38" cy="16.5" rx="2.8" ry="4.6" fill="none" stroke="#a8743f"/>`,
stone:`<path d="M7 35l5-15 10-8 12 3 6 12-3 10z" fill="#9aa0a6"/><path d="M12 20l10-8 12 3-8 8z" fill="#c9ced3"/><path d="M26 23l8-8 6 12-3 10-11 0z" fill="#767c83"/><path d="M12 20l-5 15 12 2 7-14z" fill="#8a9097"/><path d="M15 29l5-3M30 31l4-2" stroke="#5f656b" fill="none"/>`,
fiber:`<path d="M24 43C22 30 14 22 9 8" fill="none" stroke="#4d8f3d" stroke-width="3.6"/><path d="M24 43C23 28 18 18 17 5" fill="none" stroke="#66b04e" stroke-width="3.6"/><path d="M24 43C24 28 27 16 28 4" fill="none" stroke="#7cc65e" stroke-width="3.6"/><path d="M24 43C26 30 33 22 38 9" fill="none" stroke="#5fa04a" stroke-width="3.6"/><path d="M24 43C27 34 36 30 42 20" fill="none" stroke="#4d8f3d" stroke-width="3.6"/><rect x="18" y="31" width="12" height="6" rx="2.5" fill="#c9a064"/><path d="M21 31v6M25 31v6" stroke="#8a6a38" fill="none"/>`,
berry:`<path d="M24 12c3-7 12-8 15-5-2 7-9 10-15 5z" fill="#5fa04a"/><path d="M24 12c0-4 1-6 3-8" fill="none" stroke="#4d8f3d" stroke-width="2"/><circle cx="16" cy="30" r="9" fill="#3a49c2"/><circle cx="32" cy="30" r="9" fill="#3a49c2"/><circle cx="24" cy="19" r="9" fill="#4a5ad6"/><circle cx="12.5" cy="26.5" r="2.4" fill="#fff" opacity=".65" stroke="none"/><circle cx="28.5" cy="26.5" r="2.4" fill="#fff" opacity=".65" stroke="none"/><circle cx="20.5" cy="15.5" r="2.4" fill="#fff" opacity=".7" stroke="none"/><path d="M14 22l2 2 2-2M30 22l2 2 2-2M22 11l2 2 2-2" stroke="#1d2672" fill="none"/>`,
axe:`<g transform="rotate(35 24 24)"><rect x="22" y="8" width="4.6" height="38" rx="2.3" fill="#8a5a2b"/><path d="M26.6 9h9c4.5 0 7 3.5 7 7s-2.5 7-7 7h-9z" fill="#aeb3ba"/><path d="M42.6 16c0 3.5-2.5 7-7 7" fill="none" stroke="#eef1f3" stroke-width="2"/><rect x="21" y="10" width="7" height="3.4" fill="#c9a064"/><rect x="21" y="19" width="7" height="3.4" fill="#c9a064"/></g>`,
pickaxe:`<g transform="rotate(30 24 24)"><rect x="21.8" y="9" width="4.4" height="38" rx="2.2" fill="#8a5a2b"/><path d="M4 18C10 6 38 6 44 18l-5.5 3C33 15 15 15 9.5 21z" fill="#aeb3ba"/><path d="M8 19c8-8 24-8 32 0" fill="none" stroke="#eef1f3" stroke-width="1.8"/><rect x="20.5" y="11" width="7" height="4" rx="1" fill="#c9a064"/></g>`,
campfire:`<path d="M24 4c2 8 11 12 9 23-1 6-6 10-9 10s-10-4-10-11c0-5 4-8 5-13 1 3 3 4 4 3-1-4-1-8 1-12z" fill="#ff8a1f"/><path d="M24 19c1 5 6 8 4 13-1 3-3 4-4 4s-6-1-6-6c0-3 4-5 6-11z" fill="#ffd45a" stroke="none"/><rect x="5" y="37" width="38" height="6.5" rx="3.2" fill="#7a4a22" transform="rotate(-11 24 40)"/><rect x="5" y="37" width="38" height="6.5" rx="3.2" fill="#93602f" transform="rotate(11 24 40)"/><circle cx="8" cy="42" r="3.2" fill="#888"/><circle cx="40" cy="42" r="3.2" fill="#999"/>`,
bandage:`<g transform="rotate(-28 24 24)"><rect x="5" y="14" width="38" height="20" rx="10" fill="#efe7d6"/><rect x="14" y="14" width="20" height="20" fill="#fffaf0" stroke="none"/><path d="M14 14v20M34 14v20" fill="none"/><path d="M24 18.5v11M18.5 24h11" stroke="#d93a3a" stroke-width="3.6" fill="none"/></g>`,
meat:`<path d="M7 26c0-10 11-17 21-14 8 2 13 8 13 15 0 8-8 12-18 12S7 35 7 26z" fill="#d9525e"/><path d="M15 21c4-4 11-5 16-1" fill="none" stroke="#f4939a" stroke-width="3"/><ellipse cx="29" cy="28" rx="5.5" ry="4.4" fill="#f5ddd2"/><path d="M13 31c4 2 8 2 12 0M17 36c4 1 8 0 11-2" stroke="#f4a3a8" fill="none"/>`,
meat_c:`<path d="M8 20c0-9 9-13 16-10 6 3 8 9 6 14-3 8-13 10-19 4-2-2-3-5-3-8z" fill="#b8692f"/><path d="M13 17c3-4 9-5 13-2" fill="none" stroke="#e39a52" stroke-width="2.6"/><path d="M13 22l9 9M20 17l9 9" stroke="#5a2e12" stroke-width="2.4" fill="none"/><path d="M28 29l11 11" stroke="#f2ead8" stroke-width="5.5" fill="none"/><circle cx="40" cy="38" r="3.4" fill="#f2ead8"/><circle cx="37" cy="42" r="3.4" fill="#f2ead8"/>`,
fish:`<path d="M5 24c6-10 20-12 28-4l9-7v22l-9-7c-8 8-22 6-28-4z" fill="#6fa8d6"/><path d="M8 26c8 5 20 5 25-4-9 3-17 2-25 4z" fill="#d8eaf6" stroke="none"/><path d="M33 20l9-7v22l-9-7z" fill="#4f86b8"/><path d="M20 15c2-4 6-5 9-3l-3 6z" fill="#4f86b8"/><path d="M17 17c-2 4-2 8 0 12" fill="none" stroke="#3e6f9e"/><circle cx="12" cy="22" r="2.4" fill="#fff"/><circle cx="11.6" cy="22" r="1.1" fill="#1d1d1d" stroke="none"/>`,
fish_c:`<path d="M3 40L45 9" stroke="#7a4a22" stroke-width="2.6" fill="none"/><path d="M6 25c6-10 19-12 27-4l9-6v21l-9-6c-8 8-21 6-27-5z" fill="#d98f3a"/><path d="M33 21l9-6v21l-9-6z" fill="#b5702a"/><path d="M14 18l11 14M20 16l11 13M26 16l7 9" stroke="#6b3a14" stroke-width="2.2" fill="none"/><path d="M9 25c5-6 14-7 20-3" fill="none" stroke="#f0bd72" stroke-width="2"/><circle cx="12" cy="23" r="2" fill="#fff"/><circle cx="11.7" cy="23" r="1" fill="#1d1d1d" stroke="none"/>`,
hide:`<path d="M6 11l9 3 9-5 9 5 9-3-3 11 5 8-9 3-3 11-8-5-8 5-3-11-9-3 5-8z" fill="#a8743f"/><path d="M15 14l9-5 9 5" fill="none" stroke="#c99560" stroke-width="2.4"/><ellipse cx="19" cy="23" rx="3" ry="2.2" fill="#7a4e24" stroke="none"/><ellipse cx="29" cy="28" rx="3.6" ry="2.6" fill="#7a4e24" stroke="none"/><ellipse cx="23" cy="34" rx="2.2" ry="1.6" fill="#7a4e24" stroke="none"/>`,
bone:`<g transform="rotate(-40 24 24)" fill="#f2ead8"><circle cx="8" cy="19" r="5"/><circle cx="8" cy="29" r="5"/><circle cx="40" cy="19" r="5"/><circle cx="40" cy="29" r="5"/><rect x="8" y="19.5" width="32" height="9" rx="3" stroke="none"/><path d="M10 19.5h28M10 28.5h28" fill="none"/></g>`,
spear:`<g transform="rotate(38 24 24)"><rect x="22.4" y="12" width="3.4" height="35" rx="1.7" fill="#8a5a2b"/><path d="M24 1l7 13-7 3.5-7-3.5z" fill="#c9ced3"/><path d="M24 1v16.5" fill="none" stroke="#8a9097"/><rect x="20.6" y="14.5" width="7" height="4" rx="1" fill="#c9a064"/><path d="M19 17.5l-2 5M29 17.5l2 5" stroke="#c9a064" stroke-width="2" fill="none"/></g>`};
Object.assign(ICON,{
ui_hp:`<path d="M24 42C10 32 4 25 4 16.5 4 10 8.5 6 14 6c4 0 8 3 10 7 2-4 6-7 10-7 5.5 0 10 4 10 10.500 0 8.500-6 15.500-20 25.500z" fill="#e0454f"/><path d="M11 15c1-3.500 4-5.500 7.500-5" fill="none" stroke="#ff9aa0" stroke-width="3"/>`,
ui_food:ICON.meat_c,
ui_water:`<path d="M24 4C18 15 9 22 9 31a15 15 0 0 0 30 0c0-9-9-16-15-27z" fill="#3b9be0"/><path d="M16 31a8 8 0 0 0 6 8" fill="none" stroke="#bfe3ff" stroke-width="3"/>`,
ui_warm:`<rect x="18.500" y="4" width="11" height="30" rx="5.500" fill="#f2f2f2"/><rect x="22" y="13" width="4" height="22" fill="#e0453a" stroke="none"/><circle cx="24" cy="37" r="8" fill="#e0453a"/><path d="M33 10h5M33 16h4M33 22h5" fill="none"/>`,
ui_act:`<rect x="10" y="9" width="6.500" height="22" rx="3.200" fill="#f0c8a0"/><rect x="17.500" y="5" width="6.500" height="26" rx="3.200" fill="#f0c8a0"/><rect x="25" y="6" width="6.500" height="25" rx="3.200" fill="#f0c8a0"/><rect x="32.500" y="11" width="6" height="20" rx="3" fill="#f0c8a0"/><rect x="9" y="24" width="31" height="19" rx="8" fill="#f0c8a0"/><path d="M10 33l-6-7a3 3 0 0 1 5-3.500l5 5z" fill="#f0c8a0"/>`,
ui_craft:`<g transform="rotate(35 24 24)"><rect x="21.500" y="14" width="5" height="32" rx="2" fill="#8a5a2b"/><rect x="9" y="4" width="30" height="13" rx="3" fill="#aeb3ba"/><path d="M12 8.500h24" stroke="#eef1f3" fill="none" stroke-width="2"/></g>`,
ui_redo:`<path d="M39 24a15 15 0 1 1-5-11.200" fill="none" stroke="#e8efe0" stroke-width="4.500"/><path d="M41 5v13H28z" fill="#e8efe0" stroke="none"/>`,
ui_wolf:`<path d="M5 6l10 7h18l10-7-3 18-8 15h-16l-8-15z" fill="#6a6f77"/><path d="M15 29l9 10 9-10-4-4h-10z" fill="#d8dce0"/><path d="M13 21l7 3M35 21l-7 3" stroke="#ff3030" stroke-width="3.500" fill="none"/><path d="M22 36h4" stroke="#1b1b1b" stroke-width="3.500" fill="none"/>`,
ui_unknown:`<rect x="8" y="8" width="32" height="32" rx="6" fill="#4a5262"/><path d="M18 19c0-8 12-8 12 0 0 5-6 5-6 10" fill="none" stroke="#e8efe0" stroke-width="3.500"/><circle cx="24" cy="36" r="2.300" fill="#e8efe0" stroke="none"/>`});
const ico=(id,sz)=>'<svg viewBox="0 0 48 48" width="'+sz+'" height="'+sz+'"><g stroke="#2a2018" stroke-width="1.3" stroke-linejoin="round" stroke-linecap="round">'+(ICON[id]||ICON.ui_unknown)+'</g></svg>';
[['bAct','ui_act','Действие (E)'],['bCraft','ui_craft','Крафт (C)'],['bNew','ui_redo','']].forEach(([i,k,t])=>$(i).innerHTML='<span class="cb">'+ico(k,18)+t+'</span>');
// ===== Игровые данные =====
const count=id=>inv.reduce((a,s)=>a+(s&&s.id==id?s.n:0),0);
const hasTool=t=>inv.some(s=>s&&G.items[s.id].tool==t);
function add(id,n){for(const s of inv){if(n>0&&s&&s.id==id){const k=Math.min(99-s.n,n);s.n+=k;n-=k}}
 for(let i=0;i<inv.length&&n>0;i++){if(!inv[i]){const k=Math.min(99,n);inv[i]={id,n:k};n-=k}}if(n>0)log(L('Инвентарь полон!'));refresh()}
function take(id,n){for(let i=0;i<inv.length&&n>0;i++){const s=inv[i];if(s&&s.id==id){const k=Math.min(s.n,n);s.n-=k;n-=k;if(!s.n)inv[i]=null}}refresh()}
function useSlot(i){const s=inv[i];if(!s||dead)return;if(openC){moveToChest(i);return}const it=G.items[s.id];
 if(it.smelt&&nearPc('furnace',3.5)){if(!count('coal'))return log(L('Нужен уголь'));take('coal',1);take(s.id,1);add(it.smelt,1);snd(260,.25,'triangle');log(L('Переплавлено: {n}',{n:G.items[it.smelt].n}))}
 else if(it.cook&&F.some(f=>Math.hypot(f.x-P.x,f.z-P.z)<3.5)){take(s.id,1);add(it.cook,1);snd(300,.2,'triangle');log(L('Вы пожарили: {n}',{n:G.items[it.cook].n}))}
 else if(it.eat){for(const k in it.eat)S[k]=Math.min(100,S[k]+it.eat[k]);take(s.id,1);snd(500,.1,'sine');playA('eat');log(L('{n} использовано',{n:it.n})+(it.cook?L(' (лучше пожарить на костре)'):''))}
 else if(it.place&&it.place!='campfire'){if(placePiece(it.place))take(s.id,1)}
 else if(it.place){const x=P.x+Math.sin(P.f)*1.9,z=P.z+Math.cos(P.f)*1.9;
  if(hgt(x,z)<.2||near(x,z).some(n=>!n.gone&&G.nodes[n.t].solid&&Math.hypot(n.x-x,n.z-z)<(G.nodes[n.t].r*n.s+.9)))return log(L('Сюда нельзя поставить'));
  mkFire(x,z);take(s.id,1)}
 else log(it.smelt?L('Нужна печь рядом'):L('{n} — материал или инструмент',{n:it.n}))}
function craft(r){if(!Object.entries(r.in).every(([k,v])=>count(k)>=v))return;if(r.at&&!nearPc('bench'))return log(L('Нужен верстак рядом'));for(const k in r.in)take(k,r.in[k]);add(r.out,r.n);playA('build');log(L('Создано: {n}',{n:G.items[r.out].n}))}
function refresh(){
 $('inv').innerHTML='';inv.forEach((s,i)=>{const d=document.createElement('div');d.className='slot';
  if(s){const it=G.items[s.id];d.title=it.n;d.innerHTML=ico(s.id,'80%')+(s.n>1?'<b>'+s.n+'</b>':'');const pv=LASTN&&LASTN[i];if(LASTN&&(!pv||pv.id!=s.id||s.n>pv.n))d.classList.add('pop')}d.onclick=()=>useSlot(i);$('inv').appendChild(d)});
 $('craft').innerHTML='';CB=[];G.recipes.forEach(r=>{const b=document.createElement('button'),it=G.items[r.out];
  b.innerHTML='<span class="cb">'+ico(r.out,24)+it.n+' ('+Object.entries(r.in).map(([k,v])=>ico(k,17)+v).join(' ')+')'+(r.at?ico('bench',17):'')+'</span>';
  b.disabled=!canCraft(r);CB.push([b,r]);b.onclick=()=>craft(r);$('craft').appendChild(b)});
 axeG.visible=hasTool('axe');pkG.visible=hasTool('pick')&&!hasTool('axe');drawChest();LASTN=inv.map(s=>s&&{id:s.id,n:s.n})}
let tt;function log(m){const t=$('toast');t.innerHTML=m;t.style.opacity=1;clearTimeout(tt);tt=setTimeout(()=>t.style.opacity=0,1800)}
function target(){let best=null,bd=3.2;for(const n of near(P.x,P.z)){const d=G.nodes[n.t];if(n.gone||n.dead||d.fixed||n.fall>0)continue;const q=Math.hypot(n.x-P.x,n.z-P.z)-(d.r||.4)*n.s;if(q<bd){bd=q;best=n}}for(const a of AL){if(a.dying>0)continue;const q=Math.hypot(a.x-P.x,a.z-P.z)-.4;if(q<bd){bd=q;best=a}}for(const c of PC){if(c.pk!='chest')continue;const q=Math.hypot(c.x-P.x,c.z-P.z)-.5;if(q<bd){bd=q;best=c}}return best}
function waterAhead(){if(hgt(P.x,P.z)<-.05)return true;for(const d of[.8,1.8,2.8])if(hgt(P.x+Math.sin(P.f)*d,P.z+Math.cos(P.f)*d)<-.05)return true;return false}
const shk=new Set();let swing=0,walkT=0,mvAmt=0,tm=0;
function act(){if(cool>0||dead||MENU)return;const n=target();cool=.5;swing=.35;playA(n?(n.p?'pick':n.k?'hit':RKT.includes(n.t)?'mine':n.t=='bush'?'pick':'chop'):waterAhead()?'drink':'hit');if(n&&n.p)return openChest(n);if(n&&n.k)return hitAn(n);
 if(n){const def=G.nodes[n.t];if(def.need&&!hasTool(def.need))return log(L('Нужна кирка'));n.hp-=def.tool&&hasTool(def.tool)?2.5:1;n.sh=.3;shk.add(n);snd(150,.1,'sawtooth');
  if(n.hp<=0){def.drops.forEach(([id,a,b])=>{const q=a+Math.floor(Math.random()*(b-a+1));if(q)add(id,q)});
   if(def.regrow){n.dead=true;n.rt=def.regrow;n.hp=def.hp}else if(n.t=='tree'){n.fall=1.1;n.fs=P.z<n.z?1:-1;FL.add(n);snd(110,.25,'sawtooth')}else n.gone=true;put(n)}return}
 if(waterAhead()){S.water=Math.min(100,S.water+25);snd(420,.15,'sine');return log(ico('ui_water',18)+' '+L('Вы попили'))}log(L('Рядом ничего нет'))}
// ===== Животные и звуки (0.0.3) =====
const AN={
 rabbit:{hint:'Поймать кролика',c:0xb9a58b,w:.2,h:.18,l:.3,lh:.1,hs:.13,hp:2,spd:3.6,fear:8,drops:[['meat',1,1],['hide',0,1]]},
 deer:{hint:'Охотиться на оленя',c:0x9a6a3a,w:.3,h:.38,l:.65,lh:.65,hs:.19,hp:5,spd:6.2,fear:15,drops:[['meat',2,3],['hide',1,1],['bone',1,1]]},
 wolf:{hint:'Атаковать волка',c:0x5f646b,w:.26,h:.3,l:.55,lh:.45,hs:.17,hp:6,spd:5.4,dmg:8,drops:[['meat',1,2],['hide',1,1],['bone',1,1]]},
 fish:{hint:'Ловить рыбу',c:0xe0803a,hp:1,spd:2,drops:[['fish',1,1]]}};
let AL=[],lastSt=0,AC;
function snd(f,d=.1,ty='square',v=.05){if(ST.vol<=0)return;v*=ST.vol*1.4;try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();const o=AC.createOscillator(),g=AC.createGain();o.type=ty;o.frequency.value=f;g.gain.setValueAtTime(v,AC.currentTime);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d);o.connect(g);g.connect(AC.destination);o.start();o.stop(AC.currentTime+d)}catch(e){}}
function mkAn(k){const D=AN[k],g=new THREE.Group(),hd=new THREE.Group(),tl=new THREE.Group(),legs=[];let cur=g;g.rotation.order='YXZ';g.add(hd,tl);
 const M=(c,r=.9)=>new THREE.MeshStandardMaterial({color:c,roughness:r,flatShading:true}),B=c=>new THREE.MeshBasicMaterial({color:c});
 const sp=(r,x,y,z,sx,sy,sz,m)=>{const b=new THREE.Mesh(new THREE.SphereGeometry(r,10,8),m);b.position.set(x,y,z);b.scale.set(sx,sy,sz);b.castShadow=true;cur.add(b);return b};
 const co=(r,hh,x,y,z,rx,rz,m)=>{const b=new THREE.Mesh(new THREE.ConeGeometry(r,hh,6),m);b.position.set(x,y,z);b.rotation.set(rx,0,rz);b.castShadow=true;cur.add(b);return b};
 const cy=(r1,r2,hh,x,y,z,rx,rz,m)=>{const b=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,hh,6),m);b.position.set(x,y,z);b.rotation.set(rx,0,rz);b.castShadow=true;cur.add(b);return b};
 const leg=(x,y,z,ln,r,m,hm)=>{const p=new THREE.Group();p.position.set(x,y,z);const l=new THREE.Mesh(new THREE.CylinderGeometry(r,r*.7,ln,6).translate(0,-ln/2,0),m);l.castShadow=true;p.add(l);
  if(hm){const f=new THREE.Mesh(new THREE.CylinderGeometry(r*.75,r*.85,.07,6).translate(0,-ln+.035,0),hm);p.add(f)}g.add(p);legs.push(p)};
 const out=(a,b)=>({g,legs,hd,tl,hp:new THREE.Vector3(a[0],a[1],a[2]),tp:new THREE.Vector3(b[0],b[1],b[2])});
 if(k=='fish'){const bm=M(D.c),bl=M(0xf4d9a8),dk=M(0xb85f20),fn=M(0xe0803a);
  sp(.2,0,0,0,.6,.75,1.7,bm);sp(.17,0,.07,0,.5,.45,1.5,dk);sp(.16,0,-.06,.02,.5,.5,1.5,bl);co(.1,.22,0,.22,-.02,0,0,dk).scale.x=.25;
  for(const sx of[-1,1]){sp(.07,sx*.13,-.08,.1,.2,.6,1,fn);sp(.04,sx*.115,.05,.27,.5,1,1,B(0xffffff));sp(.026,sx*.128,.05,.275,.4,1,1,B(0x050505))}
  sp(.025,0,-.04,.34,1,.6,1,B(0x3a1b10));cur=tl;co(.15,.3,0,0,-.46,Math.PI/2,0,fn).scale.x=.3;cur=g;return out([0,0,.2],[0,0,-.32])}
 if(k=='rabbit'){const f=M(D.c),bl=M(0xe8dcc6),pk=M(0xe9a0a8),wh=M(0xffffff),bk=B(0x120c08);
  sp(.15,0,.2,0,.9,.85,1.35,f);sp(.12,0,.12,.01,.8,.5,1.3,bl);for(const sx of[-1,1])sp(.1,sx*.1,.17,-.12,.7,1,1.15,f);
  cur=hd;for(const sx of[-1,1]){sp(.045,sx*.05,.26,.28,1,.9,1,bl);sp(.02,sx*.075,.33,.29,.7,1,1,bk);sp(.007,sx*.079,.34,.305,1,1,1,B(0xffffff));
   const e=sp(.04,sx*.045,.45,.17,.5,2.7,.5,f);e.rotation.x=-.25;const ei=sp(.028,sx*.045,.45,.185,.3,2.4,.3,pk);ei.rotation.x=-.25;
   for(let j=0;j<3;j++)cy(.002,.002,.13,sx*.1,.275+j*.015,.34,(j-1)*.2,Math.PI/2,bl)}
  sp(.1,0,.3,.22,.95,.9,1,f);sp(.055,0,.27,.31,1,.8,1.1,f);sp(.016,0,.285,.355,1,.8,.8,pk);sp(.012,0,.25,.345,.6,1.6,.4,wh);
  cur=tl;sp(.05,0,.22,-.27,1,1,1,wh);cur=g;
  for(const sx of[-1,1]){leg(sx*.06,.12,.12,.12,.02,f,bl);leg(sx*.1,.14,-.12,.14,.035,f,bl)}return out([0,.22,.12],[0,.22,-.25])}
 if(k=='deer'){const f=M(D.c),bl=M(0xd9c4a0),mz=M(0xc8a878),spt=M(0xf3e9d8),an=M(0xd8c9a8),hf=M(0x2a1d14),pk=M(0xe9a0a8);
  sp(.2,0,.98,0,.85,1,2.5,f);sp(.17,0,.9,0,.8,.55,2.4,bl);sp(.18,0,1,.38,.9,1.05,1,f);
  for(let i=0;i<10;i++){const z=-.35+(i%5)*.17,x=(i<5?-1:1)*.1,y=.98+.2*Math.sqrt(Math.max(0,1-Math.pow(x/.17,2)-Math.pow(z/.5,2)))+.004;sp(.025,x,y,z,1,.4,1,spt)}
  cur=hd;cy(.09,.13,.55,0,1.3,.52,.6,0,f);
  sp(.1,0,1.55,.75,.8,.85,1.25,f);sp(.06,0,1.5,.9,.8,.7,1.3,mz);sp(.03,0,1.52,1,1,.8,.8,B(0x111111));
  for(const sx of[-1,1]){
   const e=sp(.06,sx*.13,1.63,.7,.35,1.5,.9,f);e.rotation.z=sx*.8;const ei=sp(.04,sx*.135,1.63,.71,.2,1.3,.6,pk);ei.rotation.z=sx*.8;
   sp(.025,sx*.08,1.57,.84,.7,1,1,B(0x120c08));sp(.008,sx*.085,1.58,.855,1,1,1,B(0xffffff));
   cy(.02,.012,.55,sx*.09,1.9,.66,-.35,-sx*.3,an);cy(.012,.008,.22,sx*.14,1.78,.73,.5,-sx*.6,an);cy(.012,.008,.22,sx*.17,1.92,.66,.4,-sx*.6,an);cy(.01,.006,.2,sx*.2,2.06,.58,.3,-sx*.7,an)}
  cur=tl;sp(.05,0,1.1,-.52,.7,1.3,.8,spt);cur=g;
  for(const sx of[-1,1]){leg(sx*.12,.85,.36,.85,.04,f,hf);leg(sx*.12,.85,-.36,.85,.05,f,hf)}return out([0,1.05,.38],[0,1.1,-.5])}
 const f=M(D.c),lt=M(0xb8bcc2),dk=M(0x2b2e33),wh=M(0xffffff);
 sp(.26,0,.64,0,.6,.65,1.45,f);sp(.2,0,.55,0,.6,.5,1.4,lt);sp(.2,0,.66,.3,.8,.95,.9,f);sp(.14,0,.72,.42,1.1,1,.8,lt);
 cur=hd;cy(.1,.13,.34,0,.82,.45,.8,0,f);
 sp(.12,0,.9,.66,.95,.85,1,f);sp(.07,0,.85,.8,.75,.7,1.6,lt);sp(.026,0,.87,.93,1,.8,.8,B(0x0a0a0a));
 for(const sx of[-1,1]){sp(.05,sx*.09,.86,.68,.8,1,1,lt);sp(.026,sx*.07,.93,.74,.6,.8,1,B(0xffd23a));sp(.012,sx*.073,.93,.755,.6,1,1,B(0x050505));
  co(.055,.15,sx*.075,1.06,.6,-.15,sx*.2,f);co(.03,.1,sx*.075,1.05,.615,-.15,sx*.2,M(0x3a3d42));co(.009,.04,sx*.035,.8,.87,Math.PI,0,wh)}
 cur=tl;sp(.09,0,.62,-.52,.9,.9,2.6,f).rotation.x=-.45;sp(.055,0,.5,-.74,1,1,1.2,dk);cur=g;
 for(const sx of[-1,1]){leg(sx*.14,.5,.32,.5,.055,f,dk);leg(sx*.14,.5,-.3,.5,.06,f,dk)}
 return out([0,.7,.35],[0,.62,-.36])}
function addAn(k,x,z){const o=mkAn(k),a={k,x,z,hp:AN[k].hp,dir:Math.random()*6.28,t:0,cd:0,fl:0,g:o.g,legs:o.legs,hd:o.hd,hv:o.hp,tl:o.tl,tv:o.tp};world.add(o.g);AL.push(a);return a}
function spawnAnimals(){AL=[];const R=rng(seed+99);
 for(let t=0,n=0;t<3000&&n<Math.round(34*WP.animals);t++){const x=(R()-.5)*180,z=(R()-.5)*180,y=hgt(x,z);if(y<1.2||y>7.5||Math.hypot(x,z)<14)continue;addAn(n%3?'rabbit':'deer',x,z);n++}
 for(let t=0,n=0;t<3000&&n<Math.round(36*Math.max(.5,WP.animals));t++){const x=(R()-.5)*180,z=(R()-.5)*180;if(hgt(x,z)>-.6)continue;addAn('fish',x,z);n++}}
function hitAn(a){const D=AN[a.k],pw=hasTool('spear')?3:hasTool('axe')?2:1;a.hp-=pw;a.fl=2.5;snd(200,.1,'sawtooth');
 if(a.hp<=0){D.drops.forEach(([id,lo,hi])=>{const q=lo+Math.floor(Math.random()*(hi-lo+1));if(q)add(id,q)});a.dying=.8;a.side=Math.random()<.5?1:-1;snd(600,.1,'sine')}else a.hurt=.3}
function updAnimals(dt){
 const dk=dark(),fireNear=F.some(f=>Math.hypot(f.x-P.x,f.z-P.z)<10),wolves=AL.filter(a=>a.k=='wolf').length;
 if(!dead&&!MENU&&WP.wolves&&dk>.5&&wolves<3&&Math.random()<dt*.15){const an=Math.random()*6.28,x=P.x+Math.cos(an)*34,z=P.z+Math.sin(an)*34;if(Math.abs(x)<92&&Math.abs(z)<92&&hgt(x,z)>.5)addAn('wolf',x,z)}
 for(let i=AL.length-1;i>=0;i--){const a=AL[i],D=AN[a.k],dx=P.x-a.x,dz=P.z-a.z,d=Math.hypot(dx,dz);
  if(a.dying>0){a.dying-=dt;const q=1-a.dying/.8;a.g.rotation.z=Math.min(1.5,q*2.2)*(a.side||1);a.g.position.y=Math.max(a.g.position.y-dt*.1,-.5);if(a.dying<=0){world.remove(a.g);AL.splice(i,1)}continue}
  if(a.k=='wolf'&&((dk<.15&&d>20)||d>70)){world.remove(a.g);AL.splice(i,1);continue}
  let sp=0;a.t-=dt;a.cd-=dt;a.fl=Math.max(0,a.fl-dt);
  if(a.k=='wolf'){if(!dead&&d<40){a.dir=Math.atan2(dx,dz);
    if(fireNear&&d<9){a.dir+=Math.PI;sp=D.spd*.6}else if(d>1.3)sp=D.spd;
    if(d<1.5&&a.cd<=0&&!MENU){S.hp-=D.dmg*WP.diff;a.cd=1.3;a.lunge=.35;snd(90,.25,'sawtooth',.08);log(ico('ui_wolf',18)+' '+L('Волк кусает!'))}}}
  else if(D.fear&&(d<D.fear||a.fl>0)){a.dir=Math.atan2(-dx,-dz);sp=D.spd}
  else{if(a.t<=0){a.t=2+Math.random()*4;a.dir=Math.random()*6.28;a.w=Math.random()<.55}sp=a.w?D.spd*.3:0}
  if(sp){const nx=a.x+Math.sin(a.dir)*sp*dt,nz=a.z+Math.cos(a.dir)*sp*dt,y=hgt(nx,nz),ok=a.k=='fish'?y<-.4:(y>.3&&Math.abs(nx)<95&&Math.abs(nz)<95);
   if(ok){a.x=nx;a.z=nz}else{a.dir+=1.6+Math.random()*1.5;a.t=0}}
  const y=hgt(a.x,a.z);a.g.position.set(a.x,a.k=='fish'?-.35+Math.sin(tm*2+i)*.04:Math.max(y,-.6),a.z);
  let df=a.dir-a.g.rotation.y;df=Math.atan2(Math.sin(df),Math.cos(df));a.g.rotation.y+=df*Math.min(1,dt*8);
  animAn(a,sp,dt,i)}}
// ===== Строительство (0.0.4) =====
const RKT=['rock','clay','iron','coal'],EK=['wall','window','door'],TINT={iron:new THREE.Color(1,.62,.5),coal:new THREE.Color(.35,.35,.4),clay:new THREE.Color(1,.78,.55)};
let PC=[],openC=null,cbT=0,CB=[];
Object.assign(ICON,{
plank:`<rect x="5" y="28" width="38" height="8" rx="1.500" fill="#b98852"/><rect x="7" y="19" width="38" height="8" rx="1.500" fill="#a8743f"/><rect x="5" y="10" width="38" height="8" rx="1.500" fill="#c99a62"/><path d="M12 14h8M24 23h9M14 32h10" stroke="#7a4e24" fill="none"/>`,
clay:`<path d="M6 36c0-9 6-18 14-20 8-2 18 2 22 12 1 6-4 10-12 10H14c-5 0-8-1-8-2z" fill="#c4783f"/><path d="M14 24c3-5 9-7 14-5" fill="none" stroke="#e29a63" stroke-width="3"/><circle cx="30" cy="31" r="1.400" fill="#8a4e24" stroke="none"/><circle cx="20" cy="33" r="1.100" fill="#8a4e24" stroke="none"/>`,
brick:`<rect x="5" y="24" width="26" height="13" rx="1.500" fill="#b5523a"/><rect x="17" y="10" width="26" height="13" rx="1.500" fill="#c4624a"/><path d="M10 28h6M22 30h6M23 14h6M34 16h6" stroke="#8a3a28" fill="none"/>`,
iron_ore:`<path d="M7 35l5-15 10-8 12 3 6 12-3 10z" fill="#7a7068"/><path d="M12 20l10-8 12 3-8 8z" fill="#a49a90" stroke="none"/><circle cx="17" cy="30" r="3" fill="#d2792e" stroke="none"/><circle cx="29" cy="25" r="2.600" fill="#e08a3a" stroke="none"/><circle cx="33" cy="33" r="2.200" fill="#c76a26" stroke="none"/><circle cx="22" cy="20" r="1.800" fill="#e08a3a" stroke="none"/>`,
coal:`<path d="M8 33l4-14 9-8 12 2 7 12-4 11z" fill="#2c2e33"/><path d="M12 19l9-8 12 2-8 7z" fill="#4a4d55" stroke="none"/><path d="M26 22l6 10" stroke="#6a6e78" fill="none"/><path d="M16 27l3-2" stroke="#6a6e78" stroke-width="2" fill="none"/>`,
iron_ingot:`<path d="M5 35l7-15h24l7 15z" fill="#9aa2ab"/><path d="M12 20h24l-3 7H15z" fill="#d6dbe0" stroke="none"/><path d="M16 31h16" stroke="#6f7780" fill="none"/>`,
floor:`<path d="M4 28L24 18l20 10-20 10z" fill="#c99a62"/><path d="M4 28v6l20 10 20-10v-6L24 38z" fill="#6b4423"/><path d="M14 23l20 10M24 18l20 10M9 25l20 10" stroke="#7a4e24" fill="none"/>`,
wall:`<rect x="5" y="7" width="38" height="34" fill="#b98852"/><path d="M13 7v34M21 7v34M29 7v34M37 7v34" stroke="#7a4e24" fill="none"/><rect x="3" y="5" width="42" height="5" fill="#6b4423"/><rect x="3" y="38" width="42" height="5" fill="#6b4423"/>`,
window:`<rect x="5" y="7" width="38" height="34" fill="#b98852"/><rect x="14" y="15" width="20" height="16" fill="#9ed0ee"/><path d="M24 15v16M14 23h20" stroke="#6b4423" stroke-width="2" fill="none"/><rect x="12" y="13" width="24" height="20" fill="none" stroke="#6b4423" stroke-width="3"/><path d="M17 18l5-1M16 28l7-6" stroke="#fff" opacity=".7" fill="none"/>`,
door:`<rect x="9" y="5" width="30" height="38" rx="2" fill="#a8743f"/><rect x="13" y="9" width="22" height="14" fill="#b98852"/><rect x="13" y="26" width="22" height="13" fill="#b98852"/><circle cx="32" cy="26" r="2" fill="#d9b34a"/><rect x="7" y="3" width="34" height="4" fill="#6b4423"/>`,
roof:`<rect x="8" y="30" width="32" height="11" fill="#b98852"/><path d="M3 31L24 9l21 22z" fill="#b5523a"/><path d="M3 31L24 9v8L9 33z" fill="#c4624a" stroke="none"/><path d="M10 27h28M15 20h18" stroke="#8a3a28" fill="none"/>`,
chest:`<rect x="5" y="22" width="38" height="19" rx="2" fill="#a8743f"/><path d="M5 22c0-8 8-13 19-13s19 5 19 13z" fill="#c4885a"/><rect x="10" y="10" width="4" height="31" fill="#70757c"/><rect x="34" y="10" width="4" height="31" fill="#70757c"/><rect x="21" y="24" width="6" height="8" rx="1" fill="#d9b34a"/>`,
bench:`<rect x="4" y="16" width="40" height="6" rx="1.500" fill="#c99a62"/><rect x="8" y="22" width="5" height="20" fill="#6b4423"/><rect x="35" y="22" width="5" height="20" fill="#6b4423"/><rect x="13" y="32" width="22" height="3" fill="#6b4423"/><rect x="30" y="8" width="8" height="8" fill="#70757c"/><path d="M11 12h10M16 12v4" stroke="#8a5a2b" stroke-width="3" fill="none"/>`,
furnace:`<rect x="8" y="14" width="32" height="28" rx="2" fill="#8a8a86"/><rect x="26" y="4" width="10" height="12" fill="#767c83"/><path d="M13 42V30a6 6 0 0 1 12 0v12z" fill="#1b1b1b"/><path d="M15 42v-7a4 4 0 0 1 8 0v7z" fill="#ff7a1f" stroke="none"/><path d="M8 24h32M8 33h32" stroke="#6a6f77" fill="none"/>`,
ui_demolish:`<path d="M10 38L34 14" stroke="#aeb3ba" stroke-width="5" fill="none"/><path d="M30 8c5-3 11 1 10 7l-6-1-3-5z" fill="#aeb3ba"/><path d="M8 40l-3 3" stroke="#aeb3ba" stroke-width="4" fill="none"/>`});
$('bDel').innerHTML='<span class="cb">'+ico('ui_demolish',18)+'</span>';
const MT=c=>new THREE.MeshStandardMaterial({color:c,roughness:.9,flatShading:true}),
MW={wood:MT(0xa8743f),lt:MT(0xc99a62),dk:MT(0x6b4423),st:MT(0x8a8a86),sd:MT(0x6e7076),br:MT(0xb5523a),fe:MT(0x70757c),bk:MT(0x151515),au:MT(0xd9b34a),glow:new THREE.MeshBasicMaterial({color:0xff5a10})};
const bx=(g,w,h,d,x,y,z,m)=>{const b=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);b.position.set(x,y,z);b.castShadow=b.receiveShadow=true;g.add(b);return b};
const BUILD={
 floor:()=>{const g=new THREE.Group();bx(g,2,1.65,2,0,-.825,0,MW.dk);for(let i=0;i<4;i++)bx(g,.48,.05,1.98,-.75+i*.5,-.02,0,i%2?MW.wood:MW.lt);return g},
 wall:()=>{const g=new THREE.Group();for(let i=0;i<5;i++)bx(g,.39,2.4,.18,-.8+i*.4,1.2,0,i%2?MW.wood:MW.lt);bx(g,2.05,.14,.24,0,.07,0,MW.dk);bx(g,2.05,.14,.24,0,2.33,0,MW.dk);return g},
 window:()=>{const g=new THREE.Group();bx(g,2,.9,.18,0,.45,0,MW.lt);bx(g,2,.6,.18,0,2.1,0,MW.lt);
  for(const s of[-1,1]){bx(g,.45,.9,.18,s*.775,1.35,0,MW.wood);bx(g,.07,.97,.22,s*.55,1.35,0,MW.dk)}
  bx(g,1.15,.07,.22,0,.9,0,MW.dk);bx(g,1.15,.07,.22,0,1.8,0,MW.dk);bx(g,.04,.9,.1,0,1.35,0,MW.dk);bx(g,1.1,.04,.1,0,1.35,0,MW.dk);
  bx(g,2.05,.14,.24,0,.07,0,MW.dk);bx(g,2.05,.14,.24,0,2.33,0,MW.dk);return g},
 door:()=>{const g=new THREE.Group();for(const s of[-1,1])bx(g,.3,2.4,.2,s*.85,1.2,0,MW.dk);bx(g,2,.5,.2,0,2.15,0,MW.wood);
  const p=new THREE.Group();p.position.set(-.55,0,0);p.rotation.y=0;bx(p,1.1,1.9,.08,.55,.95,0,MW.lt);bx(p,.06,1.9,.1,.1,.95,0,MW.dk);bx(p,.12,.12,.14,.95,.95,0,MW.au);g.add(p);g.userData.leaf=p;return g},
 roof:()=>{const g=new THREE.Group();for(const s of[-1,1]){const b=bx(g,2.3,.12,1.4,0,.5,s*.56,MW.br);b.rotation.x=s*.62}bx(g,2.35,.1,.14,0,.93,0,MW.dk);bx(g,2.1,.1,2.1,0,-.02,0,MW.dk);return g},
 bench:()=>{const g=new THREE.Group();bx(g,1.5,.1,.8,0,.9,0,MW.lt);for(const a of[-1,1])for(const b of[-1,1])bx(g,.1,.9,.1,a*.65,.45,b*.32,MW.dk);
  bx(g,1.3,.06,.6,0,.3,0,MW.dk);bx(g,.2,.2,.2,.7,1.05,0,MW.fe);bx(g,.35,.04,.04,-.3,.97,.1,MW.dk);bx(g,.1,.1,.18,-.14,1,.1,MW.fe);bx(g,.5,.04,.14,.1,.97,-.15,MW.wood);return g},
 furnace:()=>{const g=new THREE.Group();bx(g,1.2,.2,1.1,0,.1,0,MW.sd);bx(g,1.1,1.1,1,0,.75,0,MW.st);bx(g,.5,.45,.1,0,.5,.5,MW.bk);bx(g,.4,.28,.06,0,.45,.52,MW.glow);bx(g,.6,.1,.14,0,.78,.5,MW.fe);bx(g,.4,.7,.4,.25,1.65,-.2,MW.st);return g},
 chest:()=>{const g=new THREE.Group();bx(g,.9,.5,.6,0,.25,0,MW.wood);for(const s of[-1,1])bx(g,.08,.5,.64,s*.3,.25,0,MW.fe);
  const lid=new THREE.Group();lid.position.set(0,.5,-.3);bx(lid,.92,.18,.62,0,.09,.3,MW.lt);for(const s of[-1,1])bx(lid,.08,.2,.64,s*.3,.09,.3,MW.fe);bx(lid,.1,.14,.04,0,-.04,.62,MW.au);g.add(lid);g.userData.lid=lid;return g}};
const nearPc=(k,d=3.5)=>PC.some(p=>p.pk==k&&Math.hypot(p.x-P.x,p.z-P.z)<d);
const canCraft=r=>Object.entries(r.in).every(([k,v])=>count(k)>=v)&&(!r.at||nearPc('bench'));
const updCraft=()=>CB.forEach(([b,r])=>b.disabled=!canCraft(r));
function addTo(a,id,n){for(const s of a)if(n>0&&s&&s.id==id){const k=Math.min(99-s.n,n);s.n+=k;n-=k}for(let i=0;i<a.length&&n>0;i++)if(!a[i]){const k=Math.min(99,n);a[i]={id,n:k};n-=k}return n}
function gy(x,z){for(const p of PC)if(p.pk=='floor'&&Math.abs(x-p.x)<=1&&Math.abs(z-p.z)<=1)return p.y;return hgt(x,z)}
function pcBox(p){const k=p.pk;return k=='wall'||k=='window'?(p.rot?[.2,1.05]:[1.05,.2]):k=='bench'?[.8,.45]:k=='furnace'?[.6,.55]:k=='chest'?[.5,.35]:null}
function pcAt(k,x,z,e=1.01){return PC.find(p=>p.pk==k&&Math.abs(p.x-x)<=e&&Math.abs(p.z-z)<=e)}
function mkPiece(kd,x,z,y,rot,inv){const g=BUILD[kd]();g.position.set(x,y,z);g.rotation.y=rot||0;world.add(g);
 const pc={pk:kd,x,z,y,rot:rot||0,g,p:1,inv:kd=='chest'?(inv||new Array(16).fill(null)):null};PC.push(pc);return pc}
function placePiece(kd){
 const fx=Math.sin(P.f),fz=Math.cos(P.f),qx=P.x+fx*2.4,qz=P.z+fz*2.4,cx=Math.round(qx/2)*2,cz=Math.round(qz/2)*2;
 let x=cx,z=cz,rot=0,y;
 if(EK.includes(kd)){const dx=qx-cx,dz=qz-cz;if(Math.abs(dx)>Math.abs(dz)){x=cx+(dx<0?-1:1);rot=Math.PI/2}else z=cz+(dz<0?-1:1)}
 else if(kd=='bench'||kd=='furnace'||kd=='chest'){x=P.x+fx*1.8;z=P.z+fz*1.8}
 if(hgt(x,z)<.15&&!pcAt('floor',x,z))return log(L('Сюда нельзя поставить')),0;
 const fl=pcAt('floor',x,z);
 if(kd=='floor'){if(PC.some(p=>p.pk=='floor'&&p.x==cx&&p.z==cz))return log(L('Тут уже есть пол')),0;
  const nb=PC.find(p=>p.pk=='floor'&&Math.abs(p.x-cx)<=2.01&&Math.abs(p.z-cz)<=2.01);
  y=nb?nb.y:Math.max(hgt(cx,cz),hgt(cx-1,cz-1),hgt(cx+1,cz-1),hgt(cx-1,cz+1),hgt(cx+1,cz+1))+.12}
 else{y=fl?fl.y:hgt(x,z);if(kd=='roof')y+=2.4;
  if(PC.some(p=>(EK.includes(kd)?EK.includes(p.pk):p.pk==kd)&&Math.abs(p.x-x)<.1&&Math.abs(p.z-z)<.1&&(!EK.includes(kd)||p.rot==rot)))return log(L('Тут уже занято')),0}
 mkPiece(kd,x,z,y,rot);snd(120,.12,'triangle');playA('build');return 1}
function demolish(){let b=null,bd=3.4;for(const p of PC){const d=Math.hypot(p.x-P.x,p.z-P.z);if(d<bd){bd=d;b=p}}
 if(!b)return log(L('Рядом нет построек'));if(b.inv)b.inv.forEach(s=>s&&add(s.id,s.n));if(openC==b)openC=null;
 world.remove(b.g);PC.splice(PC.indexOf(b),1);add(b.pk,1);snd(180,.15,'sawtooth')}
function openChest(p){openC=p;refresh()}
function moveToChest(i){const s=inv[i];if(!s)return;const left=addTo(openC.inv,s.id,s.n);if(left)s.n=left;else inv[i]=null;refresh()}
function fromChest(j){const s=openC.inv[j];if(!s)return;const left=addTo(inv,s.id,s.n);if(left)s.n=left;else openC.inv[j]=null;refresh()}
function drawChest(){const c=$('chest');if(!openC){c.hidden=true;return}c.hidden=false;c.innerHTML='';
 const b=document.createElement('button');b.style.gridColumn='1/-1';b.innerHTML='<span class="cb">'+ico('chest',18)+''+L('Сундук: закрыть')+'</span>';b.onclick=()=>{openC=null;refresh()};c.appendChild(b);
 openC.inv.forEach((s,j)=>{const d=document.createElement('div');d.className='slot';if(s){d.title=G.items[s.id].n;d.innerHTML=ico(s.id,'80%')+(s.n>1?'<b>'+s.n+'</b>':'')}d.onclick=()=>fromChest(j);c.appendChild(d)})}
$('bDel').onclick=demolish;
// ===== Анимации (0.0.4.1) =====
let SPR=0,PA={n:'',t:0,d:1},swimK=0,deadT=0,lastHp=100,hurtT=0,shake=0,fovC=62,lookY=0,TG=null,LASTN=null;
const FL=new Set(),TV=new THREE.Vector3(),WT={value:0};
function playA(n){PA={n,t:0,d:{chop:.55,mine:.7,hit:.4,drink:1.2,eat:.9,build:1,pick:.6,hurt:.4}[n]||.5}}
function poseP(dt){
 const t=tm,mv=dead?0:mvAmt,spr=dead?0:SPR,w=walkT;
 swimK+=((!dead&&hgt(P.x,P.z)<-.5?1:0)-swimK)*Math.min(1,dt*6);const sw=swimK;
 if(dead)deadT+=dt;else deadT=0;
 if(PA.n){PA.t+=dt;if(PA.t>=PA.d)PA.n=''}
 const A=PA.n,u=A?PA.t/PA.d:0,bell=Math.sin(Math.min(1,u)*Math.PI),sg=Math.sin(w),amp=(.7+.3*spr)*mv,sa=(.6+.35*spr)*mv,idle=1-mv,br=Math.sin(t*1.8);
 let lx=sg*amp,rx=-sg*amp,alx=-sg*sa,arx=sg*sa,alz=-.03*idle*br,arz=.03*idle*br,lean=.04*mv+.22*spr*mv+.012*idle*br,twist=sg*.12*mv,hx=0,dy=Math.abs(sg)*(.05+.04*spr)*mv,fw=0;
 let hyT=Math.sin(t*.35)*.35*idle+Math.sin(t*.9)*.1*idle;
 if(TG&&mv<.2&&!A&&!MENU){let a=Math.atan2(TG.x-P.x,TG.z-P.z)-P.f;a=Math.atan2(Math.sin(a),Math.cos(a));hyT=clamp(a,-.9,.9)}
 lookY+=(hyT-lookY)*Math.min(1,dt*5);
 if(A=='chop'||A=='mine'){const wu=.45,k=A=='mine'?1.7:2.6,a=u<wu?-k*Math.pow(u/wu,.7):-k+(u-wu)/(1-wu)*(k-.1);arx=a;alx=a*.85;lean+=u>wu?.28*Math.sin((u-wu)/(1-wu)*Math.PI):-.12*(u/wu);lx=-.15;rx=.15;twist=-.2*(u<wu?u/wu:1-(u-wu)/(1-wu))}
 else if(A=='hit'){arx=-1.55+bell*.2;alx=.5;fw=.5*bell;lean+=.25*bell;lx=.4*bell;rx=-.4*bell}
 else if(A=='drink'){lean=.9*bell;hx=.5*bell;dy=-.3*bell;lx=rx=-.6*bell;arx=alx=-.9*bell}
 else if(A=='eat'){arx=-2*bell;hx=-.25*bell;lean=0}
 else if(A=='build'){arx=-1.2+Math.sin(u*Math.PI*4)*.7;alx=-.5;lean+=.12}
 else if(A=='pick'){lean+=.45*bell;arx=alx=-.8*bell;dy=-.1*bell}
 else if(A=='hurt'){lean=-.4*bell;hx=-.3*bell;arx=alx=1.1*bell}
 if(sw>.01){const ph=t*5;arx+=(-1.5+Math.sin(ph)*1.6-arx)*sw;alx+=(-1.5+Math.sin(ph+Math.PI)*1.6-alx)*sw;lx+=(Math.sin(ph*2)*.4-lx)*sw;rx+=(-Math.sin(ph*2)*.4-rx)*sw;lean*=1-sw;hx+=-1*sw;twist*=1-sw;dy*=1-sw}
 const kd=dead?Math.min(1,deadT*3):0;if(dead){alz=-.6*kd;arz=.6*kd;lx=rx=alx=arx=0;lean=0}
 pl.position.set(P.x+Math.sin(P.f)*fw,P.y-(P.y<0&&sw<.5?.2:0)+dy-(dead?.25*kd:0),P.z+Math.cos(P.f)*fw);
 pl.rotation.set(dead?-Math.min(1.45,deadT*2.4):1.2*sw,P.f,0);
 legL.rotation.x=lx;legR.rotation.x=rx;armL.rotation.set(alx,0,alz);armR.rotation.set(arx,0,arz);
 upB.rotation.set(lean,twist,0);upB.scale.y=1+br*.008;head.rotation.set(hx-lean*.5,lookY,0);
 $('hurt').style.opacity=Math.max(Math.max(0,hurtT)*.8,S.hp<30&&!dead?.25+.15*Math.sin(t*4):0);hurtT-=dt*1.6}
function pivRot(gp,pv,rx,ry){gp.rotation.set(rx,ry,0);TV.copy(pv).applyEuler(gp.rotation);gp.position.copy(pv).sub(TV)}
function animAn(a,sp,dt,i){const k=a.k,t=tm+i*1.7,g=a.g,mv=sp>.3;a.ph=(a.ph||0)+dt*(5+sp*1.6);
 let hx=0,hy=0,tx=0,ty=0,bob=0,pit=0,rol=0,lunge=0;
 if(a.legs.length){
  if(k=='rabbit'){if(mv){bob=Math.abs(Math.sin(a.ph*.9))*.18;pit=-Math.cos(a.ph*.9)*.3;a.legs.forEach((l,j)=>l.rotation.x=(j%2?-1:1)*Math.sin(a.ph*.9)*.9)}else a.legs.forEach(l=>l.rotation.x=0)}
  else{const amp=Math.min(1,sp/2)*.7;a.legs.forEach((l,j)=>l.rotation.x=Math.sin(a.ph*1.2+(j==1||j==2?Math.PI:0))*amp);if(mv){bob=Math.abs(Math.sin(a.ph*1.2))*.04;pit=Math.sin(a.ph*1.2)*.03}}}
 if(!mv){const dip=clamp((Math.sin(t*.45)-.45)*2,0,1);if(k=='rabbit'||k=='deer')hx=dip*(k=='deer'?1.05:.6);if(k=='wolf')hx=dip*.4;hy=Math.sin(t*.7)*.45*(1-dip)}
 else if(k=='deer'&&a.fl>0)hx=-.25;else if(k=='wolf')hx=.15;
 if(k=='rabbit')tx=Math.sin(t*10)*.2*(Math.sin(t*.7)>.8?1:0);
 if(k=='deer')tx=Math.sin(t*7)*.35*((Math.sin(t*.4+1)>.8||a.fl>0)?1:0);
 if(k=='wolf'){ty=Math.sin(t*2.3)*.45;tx=mv?-.3:0}
 if(k=='fish'){ty=Math.sin(t*(4+sp*4))*(.35+sp*.15);rol=Math.sin(t*2.2)*.06;bob=Math.sin(t*1.3)*.015}
 if(a.lunge>0){a.lunge-=dt;const q=Math.sin((1-a.lunge/.35)*Math.PI);lunge=q*.5;hx=.7*q}
 if(k=='wolf'&&!mv&&!a.howl&&Math.random()<dt*.02){a.howl=2.8;snd(320,1.2,'sine',.035);snd(480,1.2,'triangle',.015)}
 if(a.howl>0){a.howl-=dt;hx=-Math.min(1,Math.sin(Math.min(1,(2.8-a.howl)/2.8)*Math.PI)*2.2)}
 if(a.hurt>0){a.hurt-=dt;rol=Math.sin(a.hurt*45)*.3*(a.hurt/.3);pit-=.15}
 if(a.hd.children.length)pivRot(a.hd,a.hv,hx,hy);
 if(a.tl.children.length)pivRot(a.tl,a.tv,tx,ty);
 g.position.y+=bob;g.rotation.x=pit;g.rotation.z=rol;
 if(lunge){g.position.x+=Math.sin(g.rotation.y)*lunge;g.position.z+=Math.cos(g.rotation.y)*lunge}}
function animPC(dt){
 for(const p of PC){const lf=p.g.userData.leaf,ld=p.g.userData.lid;
  if(lf){const nr=Math.hypot(p.x-P.x,p.z-P.z)<2.6,prev=lf.rotation.y;lf.rotation.y+=((nr?-1.5:0)-prev)*Math.min(1,dt*6);if(nr&&prev>-.2&&lf.rotation.y<=-.2)snd(180,.2,'sawtooth',.03)}
  if(ld)ld.rotation.x+=((openC==p?-1.3:0)-ld.rotation.x)*Math.min(1,dt*8)}
 MW.glow.color.setHSL(.04+Math.sin(tm*9)*.01,1,.52+Math.sin(tm*13)*.1)}
function sway(m,a){m.onBeforeCompile=sh=>{sh.uniforms.uT=WT;sh.uniforms.uA={value:a};
 sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nuniform float uT;uniform float uA;').replace('#include <begin_vertex>','#include <begin_vertex>\nfloat ph=instanceMatrix[3].x*.7+instanceMatrix[3].z*.5;float hh=max(position.y,0.);transformed.x+=sin(uT*1.6+ph)*uA*hh*.035;transformed.z+=cos(uT*1.3+ph*1.3)*uA*hh*.025;')}}
function mkPts(g,cnt,size,col,op,add){const gm=new THREE.BufferGeometry();gm.setAttribute('position',new THREE.BufferAttribute(new Float32Array(cnt*3),3));
 const p=new THREE.Points(gm,new THREE.PointsMaterial({color:col,size,transparent:true,opacity:op,depthWrite:false,blending:add?THREE.AdditiveBlending:THREE.NormalBlending}));p.frustumCulled=false;g.add(p);
 return{p,st:Array.from({length:cnt},()=>({l:Math.random()*2,x:0,y:-9,z:0,vx:0,vy:0,vz:0}))}}
function updPts(o,dt,em){const ar=o.p.geometry.attributes.position.array;o.st.forEach((s,i)=>{s.l-=dt;if(s.l<=0)em(s);s.x+=s.vx*dt;s.y+=s.vy*dt;s.z+=s.vz*dt;ar[i*3]=s.x;ar[i*3+1]=s.y;ar[i*3+2]=s.z});o.p.geometry.attributes.position.needsUpdate=true}
const spk=s=>{s.l=.7+Math.random();s.x=(Math.random()-.5)*.3;s.y=.45;s.z=(Math.random()-.5)*.3;s.vx=(Math.random()-.5)*.5;s.vy=1+Math.random()*1.3;s.vz=(Math.random()-.5)*.5},
 smk=s=>{s.l=2+Math.random()*1.5;s.x=(Math.random()-.5)*.2;s.y=1;s.z=(Math.random()-.5)*.2;s.vx=.35+Math.random()*.2;s.vy=.6+Math.random()*.3;s.vz=(Math.random()-.5)*.1};
// ===== Главное меню, персонаж, мир, настройки (0.0.4.2) =====
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let MENU=true,HAVEWORLD=false,UI={page:'main',tab:'look'},MD=7.5,MP=.25,GR=null,GRN=0,ST={q:1,vol:.7,sens:1,fov:62,fps:0,lang:''};
const FPS={n:0,t:0},GQ=()=>ST.q==0?.3:ST.q==1?.65:1;
Object.assign(ICON,{
logo:`<circle cx="35" cy="13" r="8" fill="#f2c84a"/><path d="M3 38L15 14l12 24z" fill="#2f6b34"/><path d="M13 38L26 10l13 28z" fill="#3f8a40"/><rect x="24" y="36" width="4" height="6" fill="#6b4423"/><path d="M2 41h44v5H2z" fill="#3b8fd0"/>`,
ui_menu:`<path d="M8 13h32M8 24h32M8 35h32" stroke="#e8efe0" stroke-width="4.500" fill="none"/>`,
ui_play:`<path d="M15 8l25 16-25 16z" fill="#7bd36a"/>`,
ui_world:`<circle cx="24" cy="24" r="17" fill="#3b8fd0"/><path d="M12 17c5-5 9-2 10 2s-4 6-3 10 6 3 4 8c-8-1-14-8-11-20zM29 11c5 1 9 5 11 10-4-1-6 2-9 1s-3-8-2-11z" fill="#5fae4a" stroke="none"/>`,
ui_char:`<circle cx="24" cy="15" r="8" fill="#e0b48a"/><path d="M8 42c0-11 7-17 16-17s16 6 16 17z" fill="#5a6b3a"/>`,
ui_gear:`<g fill="#c9ced3" stroke="none"><rect x="21" y="3" width="6" height="9"/><rect x="21" y="36" width="6" height="9"/><rect x="3" y="21" width="9" height="6"/><rect x="36" y="21" width="9" height="6"/><rect x="21" y="3" width="6" height="9" transform="rotate(45 24 24)"/><rect x="21" y="3" width="6" height="9" transform="rotate(135 24 24)"/><rect x="21" y="3" width="6" height="9" transform="rotate(225 24 24)"/><rect x="21" y="3" width="6" height="9" transform="rotate(315 24 24)"/></g><circle cx="24" cy="24" r="12" fill="#c9ced3"/><circle cx="24" cy="24" r="5" fill="#2a2018"/>`,
ui_dice:`<rect x="7" y="7" width="34" height="34" rx="7" fill="#f2efe6"/><g fill="#2a2018" stroke="none"><circle cx="16" cy="16" r="3"/><circle cx="32" cy="16" r="3"/><circle cx="24" cy="24" r="3"/><circle cx="16" cy="32" r="3"/><circle cx="32" cy="32" r="3"/></g>`,
ui_back:`<path d="M30 8L14 24l16 16" stroke="#e8efe0" stroke-width="5" fill="none"/>`,
ui_head:`<circle cx="24" cy="24" r="13" fill="#e0b48a"/><path d="M11 22c0-10 6-15 13-15s13 5 13 15c-4-5-9-7-13-7s-9 2-13 7z" fill="#4a2f1a"/><circle cx="19" cy="25" r="1.800" fill="#222" stroke="none"/><circle cx="29" cy="25" r="1.800" fill="#222" stroke="none"/><path d="M20 31c2 2 6 2 8 0" fill="none"/>`,
ui_shirt:`<path d="M16 6l-11 8 5 8 5-3v22h18V19l5 3 5-8-11-8c-1 4-4 6-8 6s-7-2-8-6z" fill="#2f5fa8"/>`,
ui_hat:`<ellipse cx="24" cy="34" rx="20" ry="6" fill="#7a4a22"/><path d="M12 34c0-14 5-22 12-22s12 8 12 22z" fill="#8a5a2b"/><path d="M12 31h24" stroke="#2a2018" stroke-width="3" fill="none"/>`});
$('bMenu').innerHTML='<span class="cb">'+ico('ui_menu',18)+'</span>';$('bMenu').onclick=()=>{save();showMenu('main')};
// ----- Персонаж -----
const CH0={name:'Игрок',skin:1,hair:2,hc:1,eye:1,beard:0,shirt:0,sc:0,pants:0,pc:0,shoe:0,shc:0,hat:0,gl:0,scarf:0,pack:1,ac:0};
let CH=Object.assign({},CH0);
const PAL={skin:[0xf1c9a5,0xe0b48a,0xc68f60,0x9a6a43,0x6b4528,0xf7dcc4],hair:[0x15110e,0x4a2f1a,0x8a5a2b,0xd8b060,0xb83a22,0x9a9a9a,0xe8e8e8,0x3a5a8a],eye:[0x6b4a2a,0x2b5d8a,0x3f7a4a,0x666b70,0x2a2a2a,0x8a5aa0],
 cloth:[0x5a6b3a,0xb03a3a,0x2f5fa8,0xe0b030,0x3a3a3f,0xe8e4dc,0x7a4a8a,0x2f8a7a],pants:[0x2f3b57,0x4a3a2a,0x3a3a3f,0x6b6f45,0x1d2a44,0x8a7a5a,0x5a1f2a,0xd8d4c8],
 shoe:[0x3b2a1e,0x1d140d,0xe8e4dc,0x2f5fa8,0xb03a3a,0x6b6f45],acc:[0x7a4a22,0x1d1d1d,0xb03a3a,0x2f5fa8,0x3f7a4a,0xe0b030,0xe8e4dc,0x8a5aa0]};
const HAIR=['Лысый','Короткая','Хвост','Длинные','Пучок','Ирокез','Кудри'],BEARD=['Нет','Усы','Борода','Эспаньолка'],SHIRT=['Футболка','Длинный рукав','Худи'],PANTS=['Брюки','Шорты'],SHOE=['Кроссовки','Ботинки'],
 HAT=['Нет','Кепка','Шапка','Шляпа','Повязка'],GL=['Нет','Круглые','Солнечные','Квадратные'],SCARF=['Нет','Шарф'],PACK=['Нет','Маленький','Большой'];
const chM=(c,r=.8)=>new THREE.MeshStandardMaterial({color:c,roughness:r});
function clr(g,keep){for(let i=g.children.length-1;i>=0;i--){const c=g.children[i];if(keep&&keep.includes(c))continue;c.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material)o.material.dispose()});g.remove(c)}}
function applyChar(){
 const C=CH,sk=chM(PAL.skin[C.skin]),hr=chM(PAL.hair[C.hc],.95),sh=chM(PAL.cloth[C.sc]),pn=chM(PAL.pants[C.pc]),so=chM(PAL.shoe[C.shc]),ac=chM(PAL.acc[C.ac]),bk=chM(0x111111,.4);
 const sp=(g,r,x,y,z,sx,sy,sz,m,ws=12)=>{const b=new THREE.Mesh(new THREE.SphereGeometry(r,ws,ws-2),m);b.position.set(x,y,z);b.scale.set(sx,sy,sz);b.castShadow=true;g.add(b);return b};
 const cn=(g,r,hh,x,y,z,rx,rz,m)=>{const b=new THREE.Mesh(new THREE.ConeGeometry(r,hh,7),m);b.position.set(x,y,z);b.rotation.set(rx,0,rz);b.castShadow=true;g.add(b);return b};
 const cl=(g,r1,r2,hh,x,y,z,m,seg=14)=>{const b=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,hh,seg),m);b.position.set(x,y,z);b.castShadow=true;g.add(b);return b};
 const tr=(g,r,t,x,y,z,rx,m)=>{const b=new THREE.Mesh(new THREE.TorusGeometry(r,t,8,18),m);b.position.set(x,y,z);b.rotation.x=rx;b.castShadow=true;g.add(b);return b};
 const H=head;clr(H);
 sp(H,.22,0,0,0,.95,1.05,1,sk,16);sp(H,.15,0,-.1,.05,1,.75,.95,sk);cl(H,.08,.09,.14,0,-.24,0,sk,10);
 for(const s of[-1,1]){sp(H,.055,s*.205,-.005,-.01,.45,1,.8,sk);sp(H,.03,s*.2,-.005,0,.3,.7,.5,chM(0xc98f68));
  sp(H,.04,s*.085,.03,.19,1.2,.8,.4,chM(0xffffff));sp(H,.022,s*.085,.03,.2,1,1,.6,chM(PAL.eye[C.eye]));sp(H,.012,s*.085,.03,.21,1,1,.6,bk);sp(H,.006,s*.09,.04,.215,1,1,1,chM(0xffffff));
  const br=bx(H,.09,.016,.02,s*.085,.085,.205,hr);br.rotation.z=-s*.18;sp(H,.035,s*.12,-.07,.17,1,.8,.8,chM(0xe8a58a))}
 sp(H,.03,0,-.03,.215,.9,1.1,1,chM(0xd8a47c));bx(H,.075,.014,.02,0,-.1,C.beard==2?.236:.2,chM(0x8a3b3b));
 const cap=r=>{const c=new THREE.Mesh(new THREE.SphereGeometry(r,18,12,0,Math.PI*2,0,Math.PI*.5),hr);c.rotation.x=-.5;c.scale.set(1,1.05,1.05);c.castShadow=true;H.add(c)};
 const fr=()=>{for(let i=-2;i<=2;i++)sp(H,.06,i*.07,.125-Math.abs(i)*.012,.205-Math.abs(i)*.03,1,.7,.7,hr,8)};
 const hs=C.hair;
 if(hs==1){cap(.24);fr()}
 else if(hs==2){cap(.245);fr();sp(H,.2,0,-.03,-.1,1,1.05,.85,hr,14);sp(H,.08,0,.06,-.27,1,1,1,hr);sp(H,.045,0,-.07,-.33,.8,2.2,.8,hr)}
 else if(hs==3){cap(.245);fr();sp(H,.21,0,-.18,-.12,1,2.3,.75,hr,14);for(const s of[-1,1])sp(H,.07,s*.19,-.1,.03,.7,2.4,.8,hr)}
 else if(hs==4){cap(.245);fr();sp(H,.19,0,-.03,-.08,1,.95,.8,hr,14);sp(H,.1,0,.28,-.05,1,1,1,hr)}
 else if(hs==5){for(let i=0;i<7;i++){const z=.15-i*.05,y=Math.sqrt(Math.max(.002,.235*.235-z*z))*1.04;cn(H,.045,.17,0,y+.04,z,-z*2.2,0,hr)}}
 else if(hs==6){sp(H,.3,0,.09,-.1,1,.92,.95,hr,14);for(let i=0;i<7;i++){const a=i*.9;sp(H,.09,Math.cos(a)*.2,.1+Math.sin(i)*.08,Math.sin(a)*.2-.1,1,1,1,hr,8)}}
 if(C.beard>0)for(const s of[-1,1])sp(H,.04,s*.03,-.058,.208,1.4,.5,.5,hr);
 if(C.beard==2){sp(H,.15,0,-.12,.1,1,.85,.85,hr);for(const s of[-1,1])sp(H,.06,s*.15,-.05,.08,.7,1.8,.9,hr)}
 if(C.beard==3)sp(H,.06,0,-.14,.17,1,1.2,.7,hr);
 const hc=chM(PAL.acc[C.ac]);
 if(C.hat==1){const d=sp(H,.25,0,.02,0,1,.9,1.05,hc,16);d.rotation.x=-.12;bx(H,.3,.02,.2,0,.075,.27,hc).rotation.x=.12;sp(H,.02,0,.235,0,1,1,1,hc)}
 else if(C.hat==2){const d=new THREE.Mesh(new THREE.SphereGeometry(.26,16,10,0,Math.PI*2,0,Math.PI*.58),hc);d.position.set(0,.02,-.01);d.rotation.x=-.2;d.scale.y=1.1;d.castShadow=true;H.add(d);tr(H,.235,.03,0,.045,-.03,Math.PI/2-.2,chM(0xe8e4dc));sp(H,.07,0,.29,-.04,1,1,1,chM(0xe8e4dc),8)}
 else if(C.hat==3){cl(H,.43,.43,.025,0,.1,0,hc,24).rotation.x=-.04;cl(H,.18,.21,.2,0,.2,0,hc,16);cl(H,.215,.215,.04,0,.13,0,chM(0x2a1d14),16)}
 else if(C.hat==4){tr(H,.235,.025,0,.09,-.01,Math.PI/2-.25,hc)}
 if(C.gl==1){for(const s of[-1,1])tr(H,.047,.008,s*.085,.03,.216,0,bk);bx(H,.04,.01,.01,0,.04,.216,bk);for(const s of[-1,1])bx(H,.01,.01,.2,s*.14,.04,.12,bk)}
 else if(C.gl==2){for(const s of[-1,1])bx(H,.085,.055,.015,s*.085,.03,.217,bk);bx(H,.04,.012,.012,0,.04,.217,bk);for(const s of[-1,1])bx(H,.01,.012,.2,s*.13,.04,.12,bk)}
 else if(C.gl==3){const lens=chM(0x9ed0ee,.1);lens.transparent=true;lens.opacity=.35;for(const s of[-1,1]){bx(H,.09,.06,.008,s*.085,.03,.216,lens);bx(H,.1,.01,.012,s*.085,.062,.217,bk);bx(H,.1,.01,.012,s*.085,-.002,.217,bk);bx(H,.01,.07,.012,s*.04,.03,.217,bk);bx(H,.01,.07,.012,s*.13,.03,.217,bk)}bx(H,.04,.01,.01,0,.04,.217,bk);for(const s of[-1,1])bx(H,.01,.01,.2,s*.14,.04,.12,bk)}
 const U=upB;clr(U,[head,armL,armR]);
 bx(U,.6,.7,.34,0,.3,0,sh);bx(U,.62,.08,.36,0,.03,0,chM(0x3a2a1a));bx(U,.1,.1,.02,0,.03,.19,chM(0xd9b34a));
 if(C.shirt==2){bx(U,.36,.16,.04,0,.12,.19,sh);sp(U,.17,0,.66,-.16,1,.8,.8,sh)}
 if(C.pack==1)bx(U,.36,.38,.16,0,.32,-.27,ac);
 if(C.pack==2){bx(U,.46,.6,.22,0,.34,-.3,ac);cl(U,.09,.09,.5,0,.72,-.3,chM(0xe8e4dc),10).rotation.z=Math.PI/2;for(const s of[-1,1])bx(U,.06,.55,.02,s*.18,.3,.18,chM(0x1d1d1d))}
 if(C.scarf){tr(U,.17,.05,0,.68,0,Math.PI/2,ac);bx(U,.1,.3,.04,.1,.5,.18,ac)}
 for(const g of[armL,armR]){clr(g,g===armR?[axeG,pkG]:null);const L=C.shirt==0?.26:.6;bx(g,.22,L,.24,0,-L/2,0,sh);if(L<.6)bx(g,.19,.6-L,.21,0,-(L+.6)/2,0,sk);bx(g,.18,.16,.2,0,-.64,0,sk)}
 for(const g of[legL,legR]){clr(g);
  if(C.pants==0)bx(g,.24,.78,.26,0,-.39,0,pn);else{bx(g,.25,.4,.27,0,-.2,0,pn);bx(g,.2,.38,.22,0,-.59,0,sk)}
  if(C.shoe==0){bx(g,.27,.13,.36,0,-.74,.05,so);bx(g,.27,.04,.38,0,-.8,.05,chM(0xeeeeee))}
  else{bx(g,.27,.3,.3,0,-.66,0,so);bx(g,.27,.12,.38,0,-.75,.06,so);bx(g,.27,.04,.4,0,-.8,.06,chM(0x1d140d))}}
 $('pname').textContent=C.name}
function saveChar(){try{localStorage.setItem('vse-char',JSON.stringify(CH))}catch(e){}}
function loadChar(){try{Object.assign(CH,JSON.parse(localStorage.getItem('vse-char'))||{})}catch(e){}}
function randChar(){const r=n=>Math.floor(Math.random()*n),z=(n,p)=>Math.random()<p?0:r(n);
 Object.assign(CH,{skin:r(6),hair:r(7),hc:r(8),eye:r(6),beard:z(4,.6),shirt:r(3),sc:r(8),pants:r(2),pc:r(8),shoe:r(2),shc:r(6),hat:z(5,.55),gl:z(4,.6),scarf:z(2,.7),pack:r(3),ac:r(8)});applyChar();saveChar();render()}
// ----- Настройки -----
function saveSet(){try{localStorage.setItem('vse-set',JSON.stringify(ST))}catch(e){}}
function loadSet(){try{Object.assign(ST,JSON.parse(localStorage.getItem('vse-set'))||{})}catch(e){}}
function setSet(k,v){ST[k]=v;saveSet();applySet()}
function applySet(){ren.setPixelRatio(ST.q==0?1:Math.min(devicePixelRatio,ST.q==1?1.5:2));ren.setSize(innerWidth,innerHeight);
 const ms=[512,1024,2048][ST.q];if(sun.shadow.mapSize.x!=ms){sun.shadow.mapSize.set(ms,ms);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null}}
 if(GR)GR.count=Math.floor(GRN*GQ());$('fps').hidden=!ST.fps}
// ----- Параметры мира -----
const WOPT=[
 {k:'relief',n:'Рельеф',o:['Равнины','Холмы','Горы'],f:(i,w)=>w.amp=[14,26,40][i]},
 {k:'water',n:'Вода',o:['Мало','Средне','Много','Острова'],f:(i,w)=>w.wl=[.27,.4,.47,.54][i]},
 {k:'forest',n:'Лес',o:['Редкий','Обычный','Густой'],f:(i,w)=>{w.forest=[.62,.5,.38][i];w.ftree=[.35,.5,.62][i]}},
 {k:'res',n:'Ресурсы',o:['Мало','Обычно','Много'],f:(i,w)=>w.res=[.6,1,1.8][i]},
 {k:'animals',n:'Животные',o:['Нет','Мало','Обычно','Много'],f:(i,w)=>w.animals=[0,.5,1,1.8][i]},
 {k:'wolves',n:'Волки',o:['Выкл','Вкл'],f:(i,w)=>w.wolves=i},
 {k:'diff',n:'Сложность',o:['Лёгкая','Обычная','Сложная'],f:(i,w)=>w.diff=[.5,1,1.6][i]},
 {k:'day',n:'Длина суток',o:['Короткие','Обычные','Долгие'],f:(i,w)=>w.day=[120,240,480][i]},
 {k:'start',n:'Начало игры',o:['Утро','День','Вечер','Ночь'],f:(i,w)=>w.start=[.05,.22,.45,.65][i]}];
const WF0={name:'Новый мир',seed:'',relief:1,water:1,forest:1,res:1,animals:2,wolves:1,diff:1,day:1,start:0};
let WF=Object.assign({},WF0);
const PRESETS=[
 {n:'Озёрный край',s:'83076',d:'Озеро у самого старта, железо и уголь рядом',o:{water:2}},
 {n:'Горная долина',s:'59137',d:'Высокие горы, руда в двух шагах',o:{relief:2}},
 {n:'Дремучий лес',s:'50738',d:'Густой лес вокруг, ресурсы под боком',o:{forest:2}},
 {n:'Архипелаг',s:'71981',d:'Стартовый остров, вода и мелководье вокруг',o:{water:3}},
 {n:'Раздолье',s:'99467',d:'Открытые равнины и много дичи',o:{relief:0,animals:3}},
 {n:'Рудный край',s:'21949',d:'Много железа и угля, лесистые холмы',o:{res:2}}];
function seedFrom(t){if(/^-?\d+$/.test(t))return((parseInt(t,10)%1000000)+1000000)%1000000;let h=5381;for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))|0;return Math.abs(h)%1000000}
function newGame(txt,wp,nosave){WP=Object.assign({},WPD,wp||{});const st=String(txt||'').trim();SEEDTXT=st||String(Math.floor(Math.random()*1e6));seed=seedFrom(SEEDTXT);
 buildWorld();P={x:0,y:hgt(0,0),z:0,f:0};S={hp:100,food:90,water:90,warm:80};inv=new Array(16).fill(null);time=WP.start;day=1;dead=false;$('dead').hidden=true;openC=null;PA={n:'',t:0,d:1};lastHp=100;hurtT=0;deadT=0;refresh();if(!nosave)save()}
function createWorld(){if(HAVEWORLD&&!confirm(L('Текущий мир будет заменён новым. Продолжить?')))return;
 const w={name:(WF.name||'').trim()||L('Новый мир')};WOPT.forEach(r=>r.f(WF[r.k],w));const m=$('menu');m.classList.add('busy');
 setTimeout(()=>{newGame(WF.seed,w);HAVEWORLD=true;m.classList.remove('busy');hideMenu();log(L('Сид мира: {s}',{s:esc(SEEDTXT)}))},40)}
// ----- Экраны меню -----
const chips=(a,k,list,cur)=>'<div class="chips">'+list.map((t,i)=>'<button class="ch'+(i==cur?' on':'')+'" data-a="'+a+'" data-k="'+k+'" data-v="'+i+'">'+L(t)+'</button>').join('')+'</div>';
const sws=(k,cols,cur)=>'<div class="sws">'+cols.map((c,i)=>'<button class="swc'+(i==cur?' on':'')+'" data-a="c" data-k="'+k+'" data-v="'+i+'" style="background:#'+c.toString(16).padStart(6,'0')+'"></button>').join('')+'</div>';
const row=(t,x)=>'<div class="mr"><div class="ml">'+L(t)+'</div>'+x+'</div>';
const icb=(id,t,a,v)=>'<button class="mb" data-a="'+a+'"'+(v!==undefined?' data-v="'+v+'"':'')+'>'+ico(id,22)+(t?'<span>'+L(t)+'</span>':'')+'</button>';
const langRow=()=>'<div class="mr"><div class="ml">'+ico('ui_lang',16)+' '+L('Язык')+'</div><div class="chips">'+LANGS.map(([c,n])=>'<button class="ch'+(ST.lang==c?' on':'')+'" data-a="lang" data-v="'+c+'">'+n+'</button>').join('')+'</div></div>';
function pgMain(){const w=HAVEWORLD?L('Мир: {w} · сид {s} · день {d}',{w:'<b>'+esc(L(WP.name))+'</b>',s:'<b>'+esc(SEEDTXT)+'</b>',d:day}):L('Мира пока нет — создай новый');
 return '<div class="logo">'+ico('logo',72)+'<h1>'+GN()+'</h1><div class="sub">v0.0.4.3 '+L('Альфа')+' 3D</div></div><div class="info">'+w+'</div>'+
 (HAVEWORLD?icb('ui_play','Продолжить','resume'):'')+icb('ui_world','Новый мир','go','world')+icb('ui_char','Персонаж','go','char')+icb('ui_gear','Настройки','go','set')+langRow()}
function pgWorld(){return '<h2>'+L('Новый мир')+'</h2>'+row('Название','<input type="text" id="wname" maxlength="24" value="'+esc(WF.name)+'">')+
 row('Сид (пусто — случайный мир)','<div class="sd"><input type="text" id="wseed" maxlength="24" placeholder="'+L('случайный')+'" value="'+esc(WF.seed)+'">'+icb('ui_dice','','dice')+'</div>')+
 '<div class="ml">'+L('Готовые миры')+'</div><div class="presets">'+PRESETS.map((p,i)=>'<button class="pr" data-a="preset" data-v="'+i+'"><b>'+L(p.n)+'</b><small>'+L(p.d)+'</small><i>'+L('сид {s}',{s:p.s})+'</i></button>').join('')+'</div>'+
 WOPT.map(r=>row(r.n,chips('o',r.k,r.o,WF[r.k]))).join('')+'<div class="acts">'+icb('ui_play','Создать мир','create')+icb('ui_back','Назад','go','main')+'</div>'}
function pgChar(){const T=UI.tab,C=CH;let b='';
 if(T=='look')b=row('Кожа',sws('skin',PAL.skin,C.skin))+row('Причёска',chips('c','hair',HAIR,C.hair))+row('Цвет волос',sws('hc',PAL.hair,C.hc))+row('Цвет глаз',sws('eye',PAL.eye,C.eye))+row('Борода',chips('c','beard',BEARD,C.beard));
 else if(T=='cl')b=row('Верх',chips('c','shirt',SHIRT,C.shirt))+row('Цвет верха',sws('sc',PAL.cloth,C.sc))+row('Низ',chips('c','pants',PANTS,C.pants))+row('Цвет низа',sws('pc',PAL.pants,C.pc))+row('Обувь',chips('c','shoe',SHOE,C.shoe))+row('Цвет обуви',sws('shc',PAL.shoe,C.shc));
 else b=row('Головной убор',chips('c','hat',HAT,C.hat))+row('Очки',chips('c','gl',GL,C.gl))+row('Шарф',chips('c','scarf',SCARF,C.scarf))+row('Рюкзак',chips('c','pack',PACK,C.pack))+row('Цвет аксессуаров',sws('ac',PAL.acc,C.ac));
 const tb=(id,ic,t)=>'<button class="ch'+(T==id?' on':'')+'" data-a="tab" data-v="'+id+'">'+ico(ic,18)+L(t)+'</button>';
 return '<h2>'+L('Персонаж')+'</h2>'+row('Имя','<input type="text" id="cname" maxlength="16" value="'+esc(C.name)+'">')+'<div class="tabs">'+tb('look','ui_head','Внешность')+tb('cl','ui_shirt','Одежда')+tb('acc','ui_hat','Аксессуары')+'</div>'+b+
 '<div class="acts">'+icb('ui_dice','Случайный','rand')+icb('ui_back','Готово','go','main')+'</div>'}
function pgSet(){return '<h2>'+L('Настройки')+'</h2>'+langRow()+row('Качество графики',chips('s','q',['Низкое','Среднее','Высокое'],ST.q))+row('Громкость','<input type="range" id="svol" min="0" max="1" step=".05" value="'+ST.vol+'">')+
 row('Чувствительность камеры','<input type="range" id="ssens" min=".4" max="2.5" step=".1" value="'+ST.sens+'">')+row('Поле зрения','<input type="range" id="sfov" min="50" max="90" step="1" value="'+ST.fov+'">')+
 row('Показывать FPS',chips('s','fps',['Выкл','Вкл'],ST.fps?1:0))+'<div class="acts">'+icb('ui_back','Назад','go','main')+'</div>'}
function render(){const m=$('menu'),st=m.scrollTop,pg=UI.page;m.innerHTML=pg=='main'?pgMain():pg=='world'?pgWorld():pg=='char'?pgChar():pgSet();m.scrollTop=st}
const MPAGE={main:[7.5,.25],char:[3.5,.12],world:[11,.5],set:[7.5,.25]};
function showMenu(p){UI.page=p;MENU=true;document.body.classList.add('menu');MD=MPAGE[p][0];MP=MPAGE[p][1];render();$('menu').scrollTop=0}
function hideMenu(){MENU=false;document.body.classList.remove('menu');dist=9;pit=.45;lookY=0;refresh()}
function toggleMenu(){if(MENU){if(HAVEWORLD)hideMenu()}else{save();showMenu('main')}}
function menuCam(dt){mvAmt=0;SPR=0;if(!look){yaw+=dt*.3;pit+=(MP-pit)*Math.min(1,dt*3)}dist+=(MD-dist)*Math.min(1,dt*4);time+=dt/300;if(time>=1)time-=1}
$('menu').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const a=b.dataset.a,k=b.dataset.k,v=b.dataset.v;
 if(a=='go')showMenu(v);else if(a=='resume')hideMenu();else if(a=='dice'){WF.seed=String(Math.floor(Math.random()*1e6));render()}
 else if(a=='preset'){const p=PRESETS[+v];WF=Object.assign({},WF0,{name:WF.name},p.o,{seed:p.s});render()}
 else if(a=='o'){WF[k]=+v;render()}else if(a=='c'){CH[k]=+v;applyChar();saveChar();render()}
 else if(a=='s'){setSet(k,+v);render()}else if(a=='tab'){UI.tab=v;render()}else if(a=='rand')randChar();else if(a=='create')createWorld();else if(a=='lang')setLang(v)});
$('menu').addEventListener('input',e=>{const t=e.target;
 if(t.id=='wname')WF.name=t.value;else if(t.id=='wseed')WF.seed=t.value;
 else if(t.id=='cname'){CH.name=t.value.slice(0,16);saveChar();$('pname').textContent=CH.name}
 else if(t.id=='svol'){ST.vol=+t.value;saveSet()}else if(t.id=='ssens'){ST.sens=+t.value;saveSet()}else if(t.id=='sfov'){ST.fov=+t.value;fovC=ST.fov;saveSet()}});
// ===== Локализация (0.0.4.3) =====
const GAME={ru:'Чудоземье',en:'Miraculous Land',es:'Tierra Milagrosa'},GN=()=>GAME[ST.lang]||GAME.en;
const TRL=[
['Дерево','Wood','Madera'],['Камень','Stone','Piedra'],['Волокно','Fiber','Fibra'],['Ягоды','Berries','Bayas'],['Топор','Axe','Hacha'],['Кирка','Pickaxe','Pico'],['Костёр','Campfire','Hoguera'],['Бинт','Bandage','Venda'],
['Сырое мясо','Raw meat','Carne cruda'],['Жареное мясо','Cooked meat','Carne asada'],['Рыба','Fish','Pescado'],['Жареная рыба','Cooked fish','Pescado asado'],['Шкура','Hide','Piel'],['Кость','Bone','Hueso'],['Копьё','Spear','Lanza'],
['Доски','Planks','Tablones'],['Глина','Clay','Arcilla'],['Кирпич','Brick','Ladrillo'],['Железная руда','Iron ore','Mineral de hierro'],['Уголь','Coal','Carbón'],['Железный слиток','Iron ingot','Lingote de hierro'],
['Пол','Floor','Suelo'],['Стена','Wall','Pared'],['Стена с окном','Wall with window','Pared con ventana'],['Дверь','Door','Puerta'],['Крыша','Roof','Techo'],['Сундук','Chest','Cofre'],['Верстак','Workbench','Banco de trabajo'],['Печь','Furnace','Horno'],
['Рубить дерево','Chop the tree','Talar el árbol'],['Добывать камень','Mine the rock','Picar la roca'],['Собрать ягоды','Pick berries','Recoger bayas'],['Копать глину','Dig clay','Excavar arcilla'],
['Добывать железную руду','Mine iron ore','Extraer mineral de hierro'],['Добывать уголь','Mine coal','Extraer carbón'],['Поймать кролика','Catch the rabbit','Atrapar al conejo'],['Охотиться на оленя','Hunt the deer','Cazar al ciervo'],
['Атаковать волка','Attack the wolf','Atacar al lobo'],['Ловить рыбу','Catch the fish','Pescar'],['Пить воду','Drink water','Beber agua'],['Открыть сундук','Open the chest','Abrir el cofre'],
['Инвентарь полон!','Inventory full!','¡Inventario lleno!'],['Нужен уголь','Coal needed','Se necesita carbón'],['Переплавлено: {n}','Smelted: {n}','Fundido: {n}'],['Вы пожарили: {n}','You cooked: {n}','Has cocinado: {n}'],
['{n} использовано','{n} used','{n} usado'],[' (лучше пожарить на костре)',' (better cooked over a fire)',' (mejor cocinar en la hoguera)'],['Сюда нельзя поставить',"Can't place it here",'No se puede colocar aquí'],
['Нужна печь рядом','A furnace is needed nearby','Se necesita un horno cerca'],['{n} — материал или инструмент','{n} is a material or a tool','{n} es un material o una herramienta'],['Нужен верстак рядом','A workbench is needed nearby','Se necesita un banco de trabajo cerca'],
['Создано: {n}','Crafted: {n}','Creado: {n}'],['Нужна кирка','A pickaxe is needed','Se necesita un pico'],['Вы попили','You drank','Has bebido'],['Рядом ничего нет','Nothing nearby','No hay nada cerca'],
['Волк кусает!','The wolf bites!','¡El lobo muerde!'],['Тут уже есть пол','There is already a floor here','Ya hay suelo aquí'],['Тут уже занято','Already occupied','Ya está ocupado'],['Рядом нет построек','No buildings nearby','No hay construcciones cerca'],
['Сундук: закрыть','Chest: close','Cofre: cerrar'],['Сид мира: {s}','World seed: {s}','Semilla del mundo: {s}'],['Текущий мир будет заменён новым. Продолжить?','The current world will be replaced by a new one. Continue?','El mundo actual será reemplazado por uno nuevo. ¿Continuar?'],
['День','Day','Día'],['Вы погибли','You died','Has muerto'],['Начать заново','Start over','Empezar de nuevo'],['Генерация мира...','Generating world...','Generando mundo...'],['Меню (Esc)','Menu (Esc)','Menú (Esc)'],
['Разобрать постройку (X)','Demolish building (X)','Demoler construcción (X)'],['Новая игра','New game','Nueva partida'],['Действие (E)','Action (E)','Acción (E)'],['Крафт (C)','Craft (C)','Fabricar (C)'],['Альфа','Alpha','Alfa'],
['Игрок','Player','Jugador'],['Лысый','Bald','Calvo'],['Короткая','Short','Corto'],['Хвост','Ponytail','Coleta'],['Длинные','Long','Largo'],['Пучок','Bun','Moño'],['Ирокез','Mohawk','Cresta'],['Кудри','Curls','Rizos'],
['Нет','None','Ninguno'],['Усы','Moustache','Bigote'],['Борода','Beard','Barba'],['Эспаньолка','Goatee','Perilla'],['Футболка','T-shirt','Camiseta'],['Длинный рукав','Long sleeve','Manga larga'],['Худи','Hoodie','Sudadera'],
['Брюки','Trousers','Pantalón'],['Шорты','Shorts','Pantalón corto'],['Кроссовки','Sneakers','Zapatillas'],['Ботинки','Boots','Botas'],['Кепка','Cap','Gorra'],['Шапка','Beanie','Gorro'],['Шляпа','Hat','Sombrero'],['Повязка','Headband','Cinta'],
['Круглые','Round','Redondas'],['Солнечные','Sunglasses','De sol'],['Квадратные','Square','Cuadradas'],['Шарф','Scarf','Bufanda'],['Маленький','Small','Pequeña'],['Большой','Large','Grande'],
['Рельеф','Terrain','Relieve'],['Равнины','Plains','Llanuras'],['Холмы','Hills','Colinas'],['Горы','Mountains','Montañas'],['Вода','Water','Agua'],['Мало','Low','Poco'],['Средне','Medium','Medio'],['Много','Lots','Mucho'],['Острова','Islands','Islas'],
['Лес','Forest','Bosque'],['Редкий','Sparse','Escaso'],['Обычный','Normal','Normal'],['Густой','Dense','Denso'],['Ресурсы','Resources','Recursos'],['Обычно','Normal','Normal'],['Животные','Animals','Animales'],['Волки','Wolves','Lobos'],
['Выкл','Off','Apagado'],['Вкл','On','Activado'],['Сложность','Difficulty','Dificultad'],['Лёгкая','Easy','Fácil'],['Обычная','Normal','Normal'],['Сложная','Hard','Difícil'],['Длина суток','Day length','Duración del día'],
['Короткие','Short','Cortos'],['Обычные','Normal','Normales'],['Долгие','Long','Largos'],['Начало игры','Start time','Hora de inicio'],['Утро','Morning','Mañana'],['Вечер','Evening','Tarde'],['Ночь','Night','Noche'],['Новый мир','New world','Nuevo mundo'],
['Озёрный край','Lake District','Tierra de lagos'],['Озеро у самого старта, железо и уголь рядом','A lake right at the start, iron and coal nearby','Un lago junto al inicio, hierro y carbón cerca'],
['Горная долина','Mountain valley','Valle de montaña'],['Высокие горы, руда в двух шагах','Tall mountains, ore a few steps away','Montañas altas, mineral a pocos pasos'],
['Дремучий лес','Deep forest','Bosque profundo'],['Густой лес вокруг, ресурсы под боком','Dense forest all around, resources close by','Bosque denso alrededor, recursos cerca'],
['Архипелаг','Archipelago','Archipiélago'],['Стартовый остров, вода и мелководье вокруг','A starting island with water and shallows around','Isla inicial con agua y aguas poco profundas alrededor'],
['Раздолье','Open plains','Llanuras abiertas'],['Открытые равнины и много дичи','Open plains and plenty of game','Llanuras abiertas y mucha caza'],
['Рудный край','Ore country','Tierra de minerales'],['Много железа и угля, лесистые холмы','Lots of iron and coal, wooded hills','Mucho hierro y carbón, colinas boscosas'],
['Мир: {w} · сид {s} · день {d}','World: {w} · seed {s} · day {d}','Mundo: {w} · semilla {s} · día {d}'],['Мира пока нет — создай новый','No world yet — create a new one','Aún no hay mundo: crea uno nuevo'],
['Продолжить','Continue','Continuar'],['Персонаж','Character','Personaje'],['Настройки','Settings','Ajustes'],['Название','Name','Nombre'],['Сид (пусто — случайный мир)','Seed (empty = random world)','Semilla (vacía = mundo aleatorio)'],
['случайный','random','aleatorio'],['Готовые миры','Ready-made worlds','Mundos listos'],['сид {s}','seed {s}','semilla {s}'],['Создать мир','Create world','Crear mundo'],['Назад','Back','Atrás'],
['Кожа','Skin','Piel'],['Причёска','Hairstyle','Peinado'],['Цвет волос','Hair color','Color de pelo'],['Цвет глаз','Eye color','Color de ojos'],['Верх','Top','Parte superior'],['Цвет верха','Top color','Color de la parte superior'],
['Низ','Bottom','Parte inferior'],['Цвет низа','Bottom color','Color de la parte inferior'],['Обувь','Footwear','Calzado'],['Цвет обуви','Footwear color','Color del calzado'],['Головной убор','Headwear','Tocado'],
['Очки','Glasses','Gafas'],['Рюкзак','Backpack','Mochila'],['Цвет аксессуаров','Accessory color','Color de accesorios'],['Имя','Name','Nombre'],['Внешность','Appearance','Aspecto'],['Одежда','Clothes','Ropa'],
['Аксессуары','Accessories','Accesorios'],['Случайный','Random','Aleatorio'],['Готово','Done','Hecho'],['Качество графики','Graphics quality','Calidad gráfica'],['Низкое','Low','Baja'],['Среднее','Medium','Media'],['Высокое','High','Alta'],
['Громкость','Volume','Volumen'],['Чувствительность камеры','Camera sensitivity','Sensibilidad de la cámara'],['Поле зрения','Field of view','Campo de visión'],['Показывать FPS','Show FPS','Mostrar FPS'],['Язык','Language','Idioma'],['Мир','World','Mundo']];
const DICT={en:{},es:{}};TRL.forEach(([k,e,s])=>{DICT.en[k]=e;DICT.es[k]=s});
function L(s,v){let r=s;if(ST.lang&&ST.lang!='ru'){const d=DICT[ST.lang];if(d&&d[s]!==undefined)r=d[s]}if(v)for(const k in v)r=r.split('{'+k+'}').join(v[k]);return r}
Object.assign(ICON,{ui_lang:`<path d="M5 6h24a3 3 0 0 1 3 3v14a3 3 0 0 1-3 3H17l-7 6v-6H5a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3z" fill="#3b8fd0"/><path d="M20 20h20a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3h-3v5l-6-5H23a3 3 0 0 1-3-3z" fill="#f2efe6"/><path d="M10 20l4-10 4 10M11.500 17h5" stroke="#f2efe6" fill="none"/>`});
const LANGS=[['ru','Русский'],['en','English'],['es','Español']];
function initLang(){if(!ST.lang){const n=(navigator.language||'en').slice(0,2);ST.lang=n=='ru'?'ru':n=='es'?'es':'en'}}
function setLang(l){ST.lang=l;saveSet();applyLang();render()}
function applyLang(){const sb=(id,ic,t)=>$(id).innerHTML='<span class="cb">'+ico(ic,18)+(t?L(t):'')+'</span>';
 if(['Игрок','Player','Jugador'].includes(CH.name)){CH.name=L('Игрок');saveChar()}
 if(['Новый мир','New world','Nuevo mundo'].includes(WF.name))WF.name=L('Новый мир');
 sb('bAct','ui_act','Действие (E)');sb('bCraft','ui_craft','Крафт (C)');sb('bNew','ui_redo','');
 $('bNew').title=L('Новая игра');$('bMenu').title=L('Меню (Esc)');$('bDel').title=L('Разобрать постройку (X)');
 $('dtxt').textContent=L('Вы погибли');$('bRe').textContent=L('Начать заново');$('menu').dataset.busy=L('Генерация мира...');
 $('gname').textContent=GN();$('gver').textContent='v0.0.4.3 '+L('Альфа')+' 3D';document.title=GN();document.documentElement.lang=ST.lang;$('pname').textContent=CH.name;
 if(inv)refresh()}
// ===== Симуляция =====
const dark=()=>clamp(.35-Math.sin(time*6.2832)*.6,0,.8);
function move(dx,dz){let nx=clamp(P.x+dx,-95,95),nz=clamp(P.z+dz,-95,95);
 for(const n of near(nx,nz)){const d=G.nodes[n.t];if(!d.solid||n.gone||n.fall>0)continue;const rr=d.r*n.s+.4,ex=nx-n.x,ez=nz-n.z,dd=Math.hypot(ex,ez);if(dd<rr&&dd>0){nx=n.x+ex/dd*rr;nz=n.z+ez/dd*rr}}
 for(const p of PC){const b=pcBox(p);if(!b)continue;const hx=b[0]+.35,hz=b[1]+.35,ex=nx-p.x,ez=nz-p.z;
  if(Math.abs(ex)<hx&&Math.abs(ez)<hz){if(hx-Math.abs(ex)<hz-Math.abs(ez))nx=p.x+(ex<0?-1:1)*hx;else nz=p.z+(ez<0?-1:1)*hz}}
 if(hgt(nx,nz)<-1.3)return;P.x=nx;P.z=nz}
const KEYS={};let yaw=0,pit=.45,dist=9,joy=null,look=null;
function step(dt){
 tm+=dt;cool=Math.max(0,cool-dt);swing=Math.max(0,swing-dt);
 if(!dead&&!MENU){
  let ix=(KEYS.KeyD||KEYS.ArrowRight?1:0)-(KEYS.KeyA||KEYS.ArrowLeft?1:0),iy=(KEYS.KeyW||KEYS.ArrowUp?1:0)-(KEYS.KeyS||KEYS.ArrowDown?1:0);
  if(joy){const l=Math.hypot(joy.dx,joy.dy);if(l>8){const k=Math.min(1,l/50);ix=joy.dx/l*k;iy=-joy.dy/l*k}}
  const l=Math.hypot(ix,iy);mvAmt=Math.min(1,l);SPR=((KEYS.ShiftLeft||KEYS.ShiftRight||(joy&&Math.hypot(joy.dx,joy.dy)>70))&&l>.5)?1:0;
  if(l>.01){if(l>1){ix/=l;iy/=l}
   const mx=ix*Math.cos(yaw)-iy*Math.sin(yaw),mz=-ix*Math.sin(yaw)-iy*Math.cos(yaw),spd=(hgt(P.x,P.z)<-.1?2.6:5.2)*mvAmt*(SPR?1.6:1);
   move(mx/Math.max(.01,mvAmt)*spd*dt,mz/Math.max(.01,mvAmt)*spd*dt);
   let d=Math.atan2(mx,mz)-P.f;d=Math.atan2(Math.sin(d),Math.cos(d));P.f+=d*Math.min(1,dt*12);walkT+=dt*spd*1.7;const st=Math.floor(walkT/Math.PI);if(st!=lastSt){lastSt=st;snd(70+Math.random()*40,.06,'triangle',.04)}}
  time+=dt/WP.day;if(time>=1){time-=1;day++}
  acc+=dt;if(acc>=1){acc-=1;nodes.forEach(n=>{if(n.dead&&--n.rt<=0){n.dead=false;put(n)}})}
  const dk=dark(),fire=F.some(f=>Math.hypot(f.x-P.x,f.z-P.z)<9),shel=PC.some(p=>p.pk=='roof'&&Math.abs(p.x-P.x)<=1.1&&Math.abs(p.z-P.z)<=1.1);
  S.food-=(.25+SPR*.25)*dt*WP.diff;S.water-=(.35+SPR*.35)*dt*WP.diff;S.warm+=fire?10*dt:shel?(dk>.45?.4:1.5)*dt:dk>.45?-1.2*dt:1.5*dt;
  for(const k of['food','water','warm'])S[k]=clamp(S[k],0,100);
  let dm=0;if(S.food<=0)dm+=1.2;if(S.water<=0)dm+=1.5;if(S.warm<=0)dm+=1;
  if(dm)S.hp-=dm*dt;else if(S.food>30&&S.water>30&&S.warm>30)S.hp=Math.min(100,S.hp+.6*dt);
  if(lastHp-S.hp>3){playA('hurt');hurtT=1;shake=.3}lastHp=S.hp;
  if(S.hp<=0){dead=true;$('dead').hidden=false}
  saveT+=dt;if(saveT>8){saveT=0;save()}}
 P.y+=(Math.max(gy(P.x,P.z),-.6)-P.y)*Math.min(1,dt*15);
 poseP(dt);
 shk.forEach(n=>{n.sh-=dt;if(n.sh<=0){n.sh=0;shk.delete(n);put(n)}else put(n,Math.sin(n.sh*50)*n.sh*.5)});
 FL.forEach(n=>{n.fall-=dt;if(n.fall<=0){n.fall=0;n.gone=true;FL.delete(n);put(n);snd(70,.35,'sine',.12)}else{const u=1-n.fall/1.1;put(n,n.fs*u*u*1.5)}});
 F.forEach(f=>{const q=1+Math.sin(tm*18+f.x)*.12+Math.random()*.08;f.f1.scale.set(q,q*1.1,q);f.f2.scale.set(q,q*1.2,q);f.L.intensity=1.4+Math.sin(tm*17+f.x)*.25+Math.random()*.2;if(Math.random()<dt*2&&Math.hypot(f.x-P.x,f.z-P.z)<12)snd(900+Math.random()*900,.03,'square',.012);updPts(f.sk,dt,spk);updPts(f.sm,dt,smk)});
 updAnimals(dt);animPC(dt);WT.value=tm;if(openC&&Math.hypot(openC.x-P.x,openC.z-P.z)>5){openC=null;refresh()}if((cbT-=dt)<0){cbT=.4;updCraft()}const wp=water.geometry.attributes.position,b=water.userData.b;
 for(let i=0;i<wp.count;i++)wp.setY(i,Math.sin(b[i*3]*.3+tm)*.07+Math.cos(b[i*3+2]*.25+tm*1.3)*.06);wp.needsUpdate=true;water.geometry.computeVertexNormals();
 if(MENU)menuCam(dt);const mo=MENU&&innerWidth>760?1.3:0,tx=P.x-Math.cos(yaw)*mo,ty=P.y+(MENU?(innerWidth>760?1.25:.5):1.5),tz=P.z+Math.sin(yaw)*mo,cp=Math.cos(pit);let cx=tx+Math.sin(yaw)*cp*dist,cz=tz+Math.cos(yaw)*cp*dist,cy=ty+Math.sin(pit)*dist;
 cy=Math.max(cy,hgt(cx,cz)+.9);shake=Math.max(0,shake-dt);const sk=shake*(Math.random()-.5)*.5;cam.position.set(cx+sk,cy+sk*.6,cz+sk);cam.lookAt(tx,ty,tz);
 const tf=ST.fov+SPR*mvAmt*10;fovC+=(tf-fovC)*Math.min(1,dt*5);if(Math.abs(cam.fov-fovC)>.05){cam.fov=fovC;cam.updateProjectionMatrix()}
 const tg=TG=target(),ht=tg?(tg.p?L('Открыть сундук'):tg.k?L(AN[tg.k].hint):G.nodes[tg.t].hint):waterAhead()?L('Пить воду'):'';$('hint').hidden=!ht||dead||MENU;$('hint').textContent='E — '+ht;
}
// ===== Сохранение =====
function save(){try{const gone=[],dd=[];nodes.forEach((n,i)=>{if(n.t=='campfire')return;if(n.gone)gone.push(i);if(n.dead)dd.push([i,n.rt])});
 localStorage.setItem('vse3d4',JSON.stringify({seed,P,S,inv,time,day,gone,dd,fires:F.map(f=>[f.x,f.z]),pcs:PC.map(p=>({k:p.pk,x:p.x,z:p.z,y:p.y,r:p.rot,i:p.inv})),wp:WP,st:SEEDTXT}))}catch(e){}}
function load(){try{const s=JSON.parse(localStorage.getItem('vse3d4'));if(!s)return false;
 WP=Object.assign({},WPD,s.wp||{});SEEDTXT=s.st||String(s.seed);seed=s.seed;buildWorld();s.gone.forEach(i=>{nodes[i].gone=true;put(nodes[i])});s.dd.forEach(([i,rt])=>{nodes[i].dead=true;nodes[i].rt=rt;put(nodes[i])});s.fires.forEach(([x,z])=>mkFire(x,z));(s.pcs||[]).forEach(q=>mkPiece(q.k,q.x,q.z,q.y,q.r,q.i));
 P=s.P;S=s.S;inv=s.inv;time=s.time;day=s.day;refresh();return true}catch(e){return false}}
// ===== Интерфейс и ввод =====
const bars=[['hp','ui_hp','#d64545'],['food','ui_food','#d98b2b'],['water','ui_water','#3b9be0'],['warm','ui_warm','#c9a82a']];
$('hud').innerHTML=bars.map(b=>'<div class="bar"><i id="i-'+b[0]+'" style="background:'+b[2]+'"></i><span>'+ico(b[1],14)+'</span></div>').join('');
function hud(){bars.forEach(b=>$('i-'+b[0]).style.width=Math.max(0,S[b[0]])+'%');
 const hr=(6+time*24)%24;$('clock').textContent=L('День')+' '+day+' · '+String(Math.floor(hr)).padStart(2,'0')+':'+String(Math.floor(hr%1*60)).padStart(2,'0')}
addEventListener('keydown',e=>{if(e.target.tagName=='INPUT'&&e.code!='Escape')return;KEYS[e.code]=1;if(e.code=='KeyE'||e.code=='Space'){act();e.preventDefault()}if(e.code=='KeyC')$('craft').hidden=!$('craft').hidden;if(e.code=='KeyX'&&!MENU)demolish();if(e.code=='Escape')toggleMenu()});
addEventListener('keyup',e=>KEYS[e.code]=0);
const cv=ren.domElement;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);
 if(e.pointerType=='touch'&&e.clientX<innerWidth*.45&&!joy)joy={id:e.pointerId,x:e.clientX,y:e.clientY,dx:0,dy:0};
 else if(!look)look={id:e.pointerId,x:e.clientX,y:e.clientY}});
cv.addEventListener('pointermove',e=>{
 if(joy&&joy.id==e.pointerId){joy.dx=e.clientX-joy.x;joy.dy=e.clientY-joy.y}
 else if(look&&look.id==e.pointerId){yaw-=(e.clientX-look.x)*.005*ST.sens;pit=clamp(pit+(e.clientY-look.y)*.004*ST.sens,.12,1.3);look.x=e.clientX;look.y=e.clientY}});
const up=e=>{if(joy&&joy.id==e.pointerId)joy=null;if(look&&look.id==e.pointerId)look=null};
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{dist=clamp(dist+e.deltaY*.01,4,18)});
$('bAct').onclick=act;$('bCraft').onclick=()=>$('craft').hidden=!$('craft').hidden;
$('bNew').onclick=()=>{save();showMenu('world')};$('bRe').onclick=()=>newGame(SEEDTXT,WP);
function resize(){ren.setSize(innerWidth,innerHeight);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
loadSet();loadChar();initLang();applyChar();applySet();applyLang();
HAVEWORLD=load();if(!HAVEWORLD)newGame('',{},1);
showMenu('main');
let last=performance.now();
(function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;FPS.n++;if(now-FPS.t>500){if(ST.fps)$('fps').textContent=Math.round(FPS.n*1000/(now-FPS.t))+' FPS';FPS.n=0;FPS.t=now}step(dt);env();hud();ren.render(scene,cam);requestAnimationFrame(loop)})(last);
