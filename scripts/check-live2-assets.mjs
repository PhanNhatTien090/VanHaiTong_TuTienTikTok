// CI asset gate: five Tao paths plus Heaven Tribulation must remain bundled, legible and safe.
// SVGs are rasterized by the browser once on demand. No per-frame CPU-heavy SVG filters.
import assert from 'node:assert/strict';
import {readFile,stat} from 'node:fs/promises';
const names=['sword','demon','body','beast','alchemy','tribulation'];
for(const name of names){
 const file='public/assets/live2-paths/'+name+'.svg';
 const [markup,info]=await Promise.all([readFile(file,'utf8'),stat(file)]);
 assert.ok(info.size>5000&&info.size<20000,name+': unexpected size');
 assert.match(markup,/^<svg[^>]*xmlns="http:\/\/www\.w3\.org\/2000\/svg"/,name+': invalid XML SVG root');
 assert.match(markup,/viewBox="0 0 384 384"/,name+': must be same aspect/scale');
 assert.ok(markup.includes('radialGradient')&&markup.includes('linearGradient'),name+': lost iconic depth');
 assert.ok(markup.includes('</svg>'),name+': truncated SVG');
 assert.doesNotMatch(markup,/<(?:script|foreignObject|image|filter|animate)\b/i,name+': forbidden active or costly content');
 assert.doesNotMatch(markup,/(?:href|src)="https?:/i,name+': external resources forbidden');
 console.log(name+': '+info.size+' bytes, optimized local SVG');
}
console.log('LIVE 2.0: all 6 major illustrated Dao emblems are valid standalone assets');
