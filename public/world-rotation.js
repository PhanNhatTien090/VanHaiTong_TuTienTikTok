import {ABYSS_BOSS,drawAbyssBoss} from './abyss-boss.js';
import {CELESTIAL_BOSSES,drawCelestialBoss} from './celestial-bosses.js';
import {ELITE_BOSSES,drawEliteBoss} from './boss-encounters.js';
export const SCENE_INTERVAL=5*60*1000;
export const SCENES=Object.freeze([
 {id:'dungeon',name:'Huyền Thạch Cổ Ngục',image:'/assets/worlds-v2/dungeon.png',ambience:'dungeon',floorY:.64,layout:'ground'},
 {id:'jade-palace',name:'Vân Thượng Ngọc Cung',image:'/assets/worlds-v2/jade-palace.png',ambience:'jade',floorY:.64,layout:'ground'},
 {id:'underwater',name:'Thâm Hải Long Cung',image:'/assets/worlds-v2/underwater.png',ambience:'underwater',floorY:.67,layout:'seabed'},
 {id:'cosmos',name:'Vô Tận Tinh Vực',image:'/assets/worlds-v2/cosmos.png',ambience:'cosmos',floorY:.62,layout:'float'},
 // v78: 4 cảnh tông môn cũ quay lại để chọn
 {id:'jade-lake',name:'Thanh Ngọc Hồ',image:'/assets/sect-jade-lake.png',ambience:'jade',floorY:.54,ground:{cx:.5,cy:.54,rx:.46,ry:.11},layout:'ground'},
 {id:'autumn-peak',name:'Thu Phong Lĩnh',image:'/assets/sect-autumn-peak.png',ambience:'jade',floorY:.54,ground:{cx:.5,cy:.54,rx:.46,ry:.11},layout:'ground'},
 {id:'morning',name:'Vân Hải Bình Minh',image:'/assets/sect-morning-v20.png',ambience:'jade',floorY:.54,ground:{cx:.5,cy:.54,rx:.46,ry:.11},layout:'ground'},
 {id:'twilight',name:'Hoàng Hôn Tụ Linh',image:'/assets/sect-twilight-v2.png',ambience:'jade',floorY:.54,ground:{cx:.5,cy:.54,rx:.46,ry:.11},layout:'ground'},
 {id:'sect-hall',name:'Vân Hải Nguyệt Cung',image:'/assets/realm-skins-v2/moon-jade/background-v1.png',ambience:'sect',floorY:.65,layout:'sect'}
]);
export const BOSSES=Object.freeze([
 {species:'thunder-tiger',name:'Lôi Hổ',cell:0},
 {species:'jade-tortoise',name:'Huyền Vũ Ngọc Giáp',cell:1},
 {species:'crimson-phoenix',name:'Xích Diễm Phượng Hoàng',cell:2},
 ...ELITE_BOSSES,...CELESTIAL_BOSSES,ABYSS_BOSS
]);
export function environmentAt(epoch,now,mode='auto'){
 const turn=Math.max(0,Math.floor((now-epoch)/SCENE_INTERVAL));
 const selected=mode!=='auto'&&SCENES.find(s=>s.id===mode);return {...(selected||SCENES[turn%SCENES.length]),mode:selected?mode:'auto',changesAt:selected?null:epoch+(turn+1)*SCENE_INTERVAL};
}
export function drawBossSprite(c,boss,now,x,y,sprites,celestialSprites=null,abyssArt=null,motion=true){
 if(boss.species===ABYSS_BOSS.species)return drawAbyssBoss(c,boss,now,x,y,abyssArt,motion);
 if(CELESTIAL_BOSSES.some(d=>d.species===boss.species)){drawCelestialBoss(c,boss,now,x,y,celestialSprites);return true;}
 if(drawEliteBoss(c,boss,now,x,y,sprites))return true;
 const index=BOSSES.find(b=>b.species===(boss.species||boss.kind))?.cell??0,art=sprites?.[index];if(!art)return false;
 const age=Math.max(0,now-(boss.startedAt??now-1500)),u=Math.min(1,age/1400),a=now*.002;
 const lift=-((1-u)**2)*360+Math.sin(a)*4,lunge=Math.max(0,Math.sin(age*.0012))**8*13;
 c.save();c.translate(x,y);c.fillStyle='#07172755';c.beginPath();c.ellipse(0,87,85,15,0,0,Math.PI*2);c.fill();
 if(age>1000&&age<2600){const k=(age-1000)/1600;c.globalAlpha=1-k;c.strokeStyle=index===2?'#ffd48b':'#a5e6ff';c.lineWidth=2;c.beginPath();c.ellipse(0,87,40+k*170,10+k*35,0,0,Math.PI*2);c.stroke();c.globalAlpha=1;}
 c.translate(0,lift+lunge);const breath=1+Math.sin(a)*.013;c.scale(breath,1+Math.sin(a+.4)*.018);
 if(index===2){
  // Wing strips sway around the body, without deforming faces or running a mesh.
  const sw=art.width/3;c.save();c.translate(-42,0);c.rotate(Math.sin(a)*.035);c.drawImage(art,0,0,sw,art.height,-108,-146,100,270);c.restore();
  c.drawImage(art,sw,0,sw,art.height,-50,-146,100,270);
  c.save();c.translate(42,0);c.rotate(-Math.sin(a)*.035);c.drawImage(art,sw*2,0,sw,art.height,8,-146,100,270);c.restore();
 }else c.drawImage(art,-145,-150,290,290);
 c.restore();return true;
}
