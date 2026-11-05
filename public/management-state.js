import {RenderBudget} from './performance.js';
// Control-page state only. No renderer, images, RAF loop or event/audio presentation.
export class ManagementState{
 constructor(canvas){this.canvas=canvas;canvas.width=canvas.height=0;this.players=[];this.playerIndex=new Map();this.targets=[];this.effects=[];this.worldLife={};this.budget=new RenderBudget();this.characterFrames={frames:new Map(),clear(){}};this.fps=0;this.frameMs=0;this.frameP95=0;this.cacheMiB=0;this.motion=false;this.zoom=1;}
 setQuality(mode){this.budget.set(mode);}
 update(state,selected){this.players=state.players||[];this.playerIndex=new Map(this.players.map(p=>[p.id,p]));this.selected=selected;this.boss=state.boss;this.raceStatus=state.raceStatus;}
 resize(){} focus(){} addEffect(){} noteEvent(){}
}
