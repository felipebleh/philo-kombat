import { FELIPE_TIMING, FELIPE_WALK_DURATION } from "./felipe-animation";
export const SIDARTA_TIMING = FELIPE_TIMING;
export const SIDARTA_WALK_DURATION = FELIPE_WALK_DURATION;
export const sidartaDensity = (dpr: number) => Math.max(2, Math.min(4, Math.ceil(dpr || 1)));
export function sidartaFrame(action: string, elapsed: number) {
 const t=Math.max(0,elapsed),step=(duration:number,count=6)=>Math.min(count-1,Math.floor(t/duration*count));
 if(action==="victory")return {row:5,column:0};
 if(action==="guard"||action==="guard-hit")return {row:4,column:2};
 if(action==="knocked-out")return {row:4,column:5};
 if(action==="hit")return {row:4,column:step(440)};
 if(action==="jump")return {row:0,column:2};
 if(action==="advance"||action==="retreat") {const column=Math.floor(t%SIDARTA_WALK_DURATION/SIDARTA_WALK_DURATION*6);return {row:1,column:action==="retreat"?5-column:column};}
 if(action==="attack-punch"&&t<SIDARTA_TIMING.dialetica.duration)return {row:2,column:step(SIDARTA_TIMING.dialetica.duration)};
 if(action==="attack-kick"&&t<SIDARTA_TIMING.caverna.duration)return {row:3,column:step(SIDARTA_TIMING.caverna.duration)};
 if(action==="attack-combo"&&t<SIDARTA_TIMING.ideias.duration){const i=step(SIDARTA_TIMING.ideias.duration,12);return {row:i<6?2:3,column:i%6};}
 if(action==="special-awakening"&&t<SIDARTA_TIMING.especial.duration)return {row:5,column:step(SIDARTA_TIMING.especial.duration,3)};
 if(action==="special-dharma"&&t<SIDARTA_TIMING.transcender.duration)return {row:5,column:3+step(SIDARTA_TIMING.transcender.duration,3)};
 return {row:0,column:Math.floor(t%900/150)};
}
/** Select native-resolution artwork before considering any legacy atlas cell. */
export function sidartaHighResFrame(action:string,elapsed:number):"standing"|"guard"|"lotus"|number|null{
 if(action==="guard"||action==="guard-hit")return "guard";
 const {row,column}=sidartaFrame(action,elapsed);
 if(row===5&&column===0)return "lotus";
 // The continuous walk mesh and its static fallback share one stable HD pose.
 if(row===1)return 3;
 if(row===0)return "standing";
 return null;
}
export function sidartaDrawRect(width:number,height:number,artWidth:number,artHeight:number,row:number,column:number,anchorX=artWidth/2){
 const ratio=row===5&&column===0?.48:row===4?.82:row===2?.88:row===3?.85:.92;
 let scale=height*ratio/artHeight;
 scale=Math.min(scale,(width/2-20*width/1800)/Math.max(anchorX,artWidth-anchorX));
 const groundY=height*(1-15/1536);
 return {x:width/2-anchorX*scale,y:groundY-artHeight*scale,width:artWidth*scale,height:artHeight*scale,groundY};
}
export function sidartaEffectPosition(origin:number,target:number,progress:number,maxRange=Infinity){
 const direction=target>=origin?1:-1;
 return origin+direction*Math.min(Math.abs(target-origin),maxRange)*Math.max(0,Math.min(1,progress));
}
