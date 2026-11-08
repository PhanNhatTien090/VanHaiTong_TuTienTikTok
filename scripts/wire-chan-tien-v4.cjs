// Nối Chân Tiên v4 vào audio.js (lớp nổ chung + truyền event), scene.js (preload), package.json (check). Chạy một lần.
const fs=require('fs');
const edit=(f,pairs)=>{let s=fs.readFileSync(f,'utf8');for(const [a,b] of pairs){if(s.includes(b))continue;if(!s.includes(a))throw Error(f+' missing '+a.slice(0,60));s=s.replace(a,b);}fs.writeFileSync(f,s);};
edit('public/audio.js',[["7:[19,22.8,87.31]};","7:[19,22.8,87.31],8:[27.35,31.6,82.41]};"],["||schedule===scheduleDaiThuaAudio)","||schedule===scheduleDaiThuaAudio||schedule===scheduleChanTienAudio)"]]);
edit('public/scene.js',[["import {prepareDaiThuaWorld} from './dai-thua-formation.js';","import {prepareDaiThuaWorld} from './dai-thua-formation.js';\r\nimport {prepareChanTienArt} from './chan-tien-formation.js';"],["if(breakthroughRealm(e)===7)prepareDaiThuaWorld(this);","if(breakthroughRealm(e)===7)prepareDaiThuaWorld(this);if(breakthroughRealm(e)===8)prepareChanTienArt(this);"]]);
const p=JSON.parse(fs.readFileSync('package.json','utf8'));if(!p.scripts.check.includes('chan-tien-formation'))p.scripts.check+=' && node --check public/chan-tien-formation.js && node --check public/chan-tien-awakening.js && node --check public/chan-tien-audio.js';fs.writeFileSync('package.json',JSON.stringify(p,null,2)+'\n');
console.log('wired');
