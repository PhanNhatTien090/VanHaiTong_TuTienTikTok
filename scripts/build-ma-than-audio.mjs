// Sinh public/ma-than-audio.js = bản nhạc scripts/ma-than-score.txt + bộ máy cue dùng chung lấy từ public/tien-de-audio.js.
// Chạy: node scripts/build-ma-than-audio.mjs
import fs from 'node:fs';
const root=new URL('../',import.meta.url);
const score=fs.readFileSync(new URL('scripts/ma-than-score.txt',root),'utf8').replace(/\r\n/g,'\n').trimEnd();
const engine=fs.readFileSync(new URL('public/tien-de-audio.js',root),'utf8').replace(/\r\n/g,'\n');
const from=engine.indexOf('export const TIEN_DE_SCORE=');if(from<0)throw new Error('engine marker missing');
let tail=engine.slice(from)
 .replace('export const TIEN_DE_SCORE=','export const MA_THAN_SCORE=')
 .replace('for(const cue of TIEN_DE_SCORE)','for(const cue of MA_THAN_SCORE)')
 .replace(/export function tienDeMusicDuck\(ms\)\{[^\n]*\}/,'export function maThanMusicDuck(ms){const t=ms/1000;return t<T.impact?.08:t<42.2?.12:Math.min(1,.12+(t-42.2)/1.6*.88);}')
 .replace('export function scheduleTienDeAudio(','export function scheduleMaThanAudio(');
for(const bad of ['TIEN_DE','tienDe','TienDe'])if(tail.includes(bad))throw new Error('leftover name '+bad);
fs.writeFileSync(new URL('public/ma-than-audio.js',root),score+'\n'+tail);
console.log('public/ma-than-audio.js written');
