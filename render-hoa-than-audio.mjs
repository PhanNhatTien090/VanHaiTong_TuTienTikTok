import fs from 'node:fs/promises';
import {pathToFileURL} from 'node:url';
import {scheduleHoaThanAudio as currentSchedule} from './public/hoa-than-audio.js';
import {scheduleImpactLayers} from './public/impact-audio.js';
import {qiVariant} from './public/qi-impact.js';
import {setPriority} from 'node:os';try{setPriority(10);}catch{}
const tools=process.env.WAE_MODULE;if(!tools)throw Error('Set WAE_MODULE to the local web-audio-engine lib/index.js.');
const {default:wae}=await import(pathToFileURL(tools));
const dir=process.argv[2]||'output/hoa-than-v2',c=new wae.RenderingAudioContext({sampleRate:44100,numberOfChannels:2});await fs.mkdir(dir,{recursive:true});
const master=c.createGain();master.gain.value=.8;master.connect(c.destination);
const scheduleHoaThanAudio=process.argv.includes('--before')?(await import('./data/backups/hoa-than-v2-20261105/hoa-than-audio.js')).scheduleHoaThanAudio:currentSchedule;
const e={id:'hoa-review-02',user:'p1'},main=scheduleHoaThanAudio(c,master,0,17.6,1,e),extra=scheduleImpactLayers(c,master,{elapsed:0,at:14.4,duration:17.6,pitch:qiVariant(e).pitch,root:110});c.processTo(19.2);
const data=c.exportAsAudioData();let peak=0,sum=0,nonfinite=0;const segments=[];
for(let sec=0;sec<19.2;sec+=.5){let max=0;for(let i=Math.floor(sec*data.sampleRate);i<Math.min(data.length,(sec+.5)*data.sampleRate);i++)for(const ch of data.channelData){const v=ch[i];if(!Number.isFinite(v))nonfinite++;max=Math.max(max,Math.abs(v));sum+=v*v;}segments.push({at:sec,peak:max});peak=Math.max(peak,max);}
await fs.writeFile(dir+'/score.wav',Buffer.from(await c.encodeAudioData(data,{bitDepth:16})));main.stop();extra.stop();
const report={seconds:data.length/data.sampleRate,peak,rms:Math.sqrt(sum/(data.length*2)),nonfinite,segments,source:'actual game scheduler + shared impact through Node Web Audio; browser processing may differ; not an auditory review'};await fs.writeFile(dir+'/audio-qa.json',JSON.stringify(report,null,2));console.log(JSON.stringify({peak,rms:report.rms,nonfinite,segments}));
