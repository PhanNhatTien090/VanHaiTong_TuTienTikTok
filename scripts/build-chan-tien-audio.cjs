// Sinh public/chan-tien-audio.js: bản nhạc Chân Tiên v4 + bộ máy cue dùng chung (lấy từ dai-thua-audio.js, đã có lớp ×2).
const fs=require('fs');
const src=fs.readFileSync('public/dai-thua-audio.js','utf8');
const engine=src.slice(src.indexOf('// Độ lớn ×1,9'))
 .replace('let seed=77213','let seed=31337').replace(/DAI_THUA_SCORE/g,'CHAN_TIEN_SCORE')
 .replace(/export function daiThuaMusicDuck\(ms\)\{[^\n]*\}/,'export function chanTienMusicDuck(ms){const t=ms/1000;return t<T.gate?.18:t<T.impact?.08:t<29.6?.12:Math.min(1,.12+(t-29.6)/1.6*.88);}')
 .replace('export function scheduleDaiThuaAudio(','export function scheduleChanTienAudio(')
 .replace('echo.delayTime.value=.31','echo.delayTime.value=.34');
if(!engine.includes('scheduleChanTienAudio')||!engine.includes('chanTienMusicDuck'))throw Error('engine patch');
const head=fs.readFileSync('scripts/chan-tien-score.txt','utf8');
fs.writeFileSync('public/chan-tien-audio.js',head+engine);console.log('ok');
