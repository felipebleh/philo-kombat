import { SIDARTA_WALK_DURATION } from "./sidarta-motion";

function smoothstep(a:number,b:number,value:number){const t=Math.max(0,Math.min(1,(value-a)/(b-a)));return t*t*(3-2*t);}

/** One native HD torso; only the arms and the robe sway gently. */
export function sidartaWalkVertex(x:number,y:number,elapsed:number,retreat:boolean):[number,number]{
 const phase=(Math.max(0,elapsed)%SIDARTA_WALK_DURATION)/SIDARTA_WALK_DURATION*Math.PI*2;
 const stride=Math.sin(phase)*(retreat?-1:1),right=smoothstep(.26,.76,x),left=1-right;
 const hem=smoothstep(.56,.90,y),arms=smoothstep(.25,.34,y)*(1-smoothstep(.56,.69,y));
 const outside=smoothstep(.08,.26,Math.abs(x-.50));
 return [x+hem*stride*(left-right)*.014-arms*outside*stride*(left-right)*.012,
         y-hem*(1-Math.cos(phase*2))*.0015];
}

/** Two opposite strides: the grounded foot moves back while the other lifts. */
export function sidartaWalkFeet(elapsed:number,retreat:boolean){
 const phase=(Math.max(0,elapsed)%SIDARTA_WALK_DURATION)/SIDARTA_WALK_DURATION*Math.PI*2*(retreat?-1:1);
 const swing=Math.sin(phase),forward=Math.cos(phase);
 return {
  near:{ankleX:360+140*forward,lift:55*Math.max(0,-swing),scale:1},
  far:{ankleX:360-140*forward,lift:55*Math.max(0,swing),scale:.91},
 };
}
