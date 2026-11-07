import fs from 'node:fs/promises';
import wae from './output/huyen-tien-v1/audio-tools/node_modules/web-audio-engine/lib/index.js';
import {scheduleKimTienAudio} from './public/kim-tien-audio.js';
const c=new wae.RenderingAudioContext({sampleRate:44100,numberOfChannels:2});
const master=c.createGain();master.gain.value=.8;master.connect(c.destination);
const cue=scheduleKimTienAudio(c,master,0,28,1,{id:'kim-review-v1',user:'p1'});c.processTo(28);
const data=c.exportAsAudioData();let peak=0,sum=0,nonfinite=0;for(const ch of data.channelData)for(const n of ch){if(!Number.isFinite(n))nonfinite++;peak=Math.max(peak,Math.abs(n));sum+=n*n;}
const wav=await c.encodeAudioData(data,{bitDepth:16});await fs.writeFile('output/kim-tien-v1/score.wav',Buffer.from(wav));cue.stop();
const report={seconds:data.length/data.sampleRate,peak,rms:Math.sqrt(sum/(data.length*2)),nonfinite,source:'actual scheduleKimTienAudio via offline Web Audio implementation; browser compressor/render may differ'};await fs.writeFile('output/kim-tien-v1/audio-qa.json',JSON.stringify(report,null,2));console.log(report);
