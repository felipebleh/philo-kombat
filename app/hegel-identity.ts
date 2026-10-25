// Grounded shadow and jump trajectory shared by every native Hegel pose.
export function hegelPosture(action: string, elapsed: number, jumpMs=650) {
  const jump=action==="jump" ? Math.sin(Math.PI*Math.min(1,Math.max(0,elapsed/jumpMs))) : 0;
  const attack=action.startsWith("attack-");
  return { lift: jump*.32, shadowWidth:(attack?1.15:1)*(1-jump*.45), shadowHeight:1-jump*.35, shadowOpacity:1-jump*.55 };
}
