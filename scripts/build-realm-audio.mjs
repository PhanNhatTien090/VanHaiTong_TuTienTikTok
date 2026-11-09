// Sinh public/<slug>-audio.js = bản nhạc scripts/<slug>-score.txt + bộ máy cue dùng chung lấy từ public/tien-de-audio.js.
// Chạy: node scripts/build-realm-audio.mjs thien-ma   (hoặc diet-the). Ma Thần vẫn dùng scripts/build-ma-than-audio.mjs.
import fs from 'node:fs';
const NAMES={'thien-ma':['THIEN_MA','ThienMa','thienMa'],'diet-the':['DIET_THE','DietThe','dietThe']};
const slug=process.argv[2],names=NAMES[slug];if(!names)throw new Error('slug: '+Object.keys(NAMES).join(' | '));
const [UP,Pascal,camel]=names,root=new URL('../',import.meta.url);
const score=fs.readFileSync(new URL(`scripts/${slug}-score.txt`,root),'utf8').replace(/\r\n/g,'\n').trimEnd();
const engine=fs.readFileSync(new URL('public/tien-de-audio.js',root),'utf8').replace(/\r\n/g,'\n');
const from=engine.indexOf('export const TIEN_DE_SCORE=');if(from<0)throw new Error('engine marker missing');
const tail=engine.slice(from)
 .replace('export const TIEN_DE_SCORE=',`export const ${UP}_SCORE=`)
 .replace('for(const cue of TIEN_DE_SCORE)',`for(const cue of ${UP}_SCORE)`)
 .replace(/export function tienDeMusicDuck\(ms\)\{[^\n]*\}/,`export function ${camel}MusicDuck(ms){const t=ms/1000;return t<T.impact?.08:t<T.impact+2.2?.12:Math.min(1,.12+(t-T.impact-2.2)/1.6*.88);}`)
 .replace('export function scheduleTienDeAudio(',`export function schedule${Pascal}Audio(`);
for(const bad of ['TIEN_DE','tienDe','TienDe'])if(tail.includes(bad))throw new Error('leftover name '+bad);
fs.writeFileSync(new URL(`public/${slug}-audio.js`,root),score+'\n'+tail);
console.log(`public/${slug}-audio.js written`);
