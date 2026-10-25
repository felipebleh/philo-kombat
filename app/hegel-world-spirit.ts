export const HEGEL_HORSE = "/game/hegel-world-spirit-horse.webp";
export const HEGEL_WORLD_TIMING = { duration:1850, emerge:180, charge:640, impact:1480, fade:1740 } as const;
const smooth=(t:number)=>{const v=Math.max(0,Math.min(1,t));return v*v*(3-2*v);};
export function worldSpiritPose(elapsed:number,origin:number,target:number,facing:1|-1) {
  const t=Math.max(0,elapsed), timing=HEGEL_WORLD_TIMING;
  const progress=smooth((t-timing.charge)/(timing.impact-timing.charge));
  const start=origin-facing*6, end=target-facing*7;
  const position=t<=timing.impact ? start+(end-start)*progress : end+facing*14*smooth((t-timing.impact)/(timing.duration-timing.impact));
  const frame=t<timing.charge ? 0 : t<timing.impact ? 1+Math.floor((t-timing.charge)/85)%2 : 3;
  const opacity=.78*smooth((t-timing.emerge)/200)*(1-smooth((t-timing.fade)/(timing.duration-timing.fade)));
  return {position,frame,opacity,progress,impact:t>=timing.impact&&t<timing.impact+190};
}
// The generated art has breathing room between rows rather than a perfect grid.
export const HEGEL_HORSE_RECTS = [[0,0,627,695],[628,60,626,632],[0,697,627,557],[628,680,626,574]];
