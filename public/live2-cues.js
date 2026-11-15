// Bounded LIVE2 sound cues. Never schedule or synthesize sound in a render frame.
// The app's existing CinematicAudio mixer owns volume, browser unlock, ducking and overlap.
const THEME=Object.freeze({
 sword:'jade',demon:'void',body:'gold',beast:'resonance',
 alchemy:'dawn',alchemyFx:'dawn',boss:'void',guild:'dusk',
 mentor:'resonance',relic:'void',bond:'gold',tribulation:'void'
});
export function live2CueForEvent(e){
 if(e?.effect!=='daoPath')return null;
 const milestone=!!(e.daoChoose||e.daoSkill||e.daoUltimate||e.daoBrew||e.daoPill||
  e.daoRelic||e.daoForge||e.guildWarStart||e.guildWarEnd||e.guildFounded||
  e.guildBuild||e.mentorJoined||e.mentorGraduated||e.bondSkill||
  e.bossPhase==='seal-break'||e.tribulationComplete);
 if(!milestone)return null;
 const focus=e.bossPhase==='seal-break'||e.tribulationComplete||e.daoUltimate||e.guildWarStart;
 return Object.freeze({
  theme:THEME[e.live2Kind||e.daoPath]||'jade',
  at:focus?.13:.10,gain:focus?.34:.25,priority:focus?2:1,
  charge:false
 });
}
