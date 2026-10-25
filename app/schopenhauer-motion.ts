export const SCHOPENHAUER_PENDULUM_TIMING={duration:1850,impact:1480} as const;
export const SCHOPENHAUER_FLASH_ALPHA=.24;
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const mix=(a:number,b:number,t:number)=>a+(b-a)*clamp(t);
export function caneTrailPose(action:string,elapsed:number){
  const combo=action==='attack-combo';
  const sweeps=combo?[[110,220,-1.15,-.04],[390,620,-1.85,.78]]:[[105,220,-1.15,-.04]];
  const sweep=sweeps.find(([start,end])=>elapsed>=start&&elapsed<=end+115);
  if(!sweep||(!combo&&action!=='attack-punch'))return null;
  const [start,end,a,b]=sweep,progress=clamp((elapsed-start)/(end-start));
  return {angle:mix(a,b,progress),tail:.8,alpha:.68*Math.min(1,(elapsed-start)/35)*clamp((end+115-elapsed)/115),
    x:combo&&start>300?.46:.50,y:combo&&start>300?.33:.31,radius:combo&&start>300?.31:.43};
}
// Final swing deliberately meets the live opponent at the controller's1480ms
// damage beat. Earlier oscillations traverse both sides of the clock.
export function sufferingPendulumPose(elapsed:number,target:number,width:number,height:number){
  const length=Math.max(height*.61,width*.36),pivotX=width*.5,pivotY=height*.075;
  const contactAngle=Math.asin(Math.max(-.92,Math.min(.92,(target/100*width-pivotX)/length)));
  let angle:number;
  if(elapsed<380)angle=mix(-.87,.87,elapsed/380);
  else if(elapsed<800)angle=mix(.87,-.87,(elapsed-380)/420);
  else if(elapsed<1120)angle=mix(-.87,.87,(elapsed-800)/320);
  else if(elapsed<1480)angle=mix(.87,contactAngle,(elapsed-1120)/360);
  else angle=mix(contactAngle,contactAngle*.72,(elapsed-1480)/370);
  const opacity=clamp(elapsed/140)*clamp((1850-elapsed)/150);
  return {angle,opacity,length,pivotX,pivotY,x:pivotX+Math.sin(angle)*length,y:pivotY+Math.cos(angle)*length};
}
