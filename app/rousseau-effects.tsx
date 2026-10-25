import { memo, useId, type CSSProperties } from "react";

// All figures are original vectors; the native fighter art is untouched.
export const RousseauAssembly = memo(function RousseauAssembly({ position }: { position: number }) {
  const id = useId().replace(/:/g, "");
  return <div className="rousseau-assembly" style={{ left: `${position}%` }} aria-hidden="true">
    <svg viewBox="0 0 900 500" className="rousseau-assembly-art">
      <defs>
        <linearGradient id={`${id}-citizen`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fff2ac" stopOpacity=".8"/><stop offset=".4" stopColor="#83d9ef" stopOpacity=".58"/><stop offset="1" stopColor="#57b7d8" stopOpacity=".05"/></linearGradient>
        <radialGradient id={`${id}-union`}><stop stopColor="#8edcf1" stopOpacity=".24"/><stop offset=".65" stopColor="#e7ce74" stopOpacity=".1"/><stop offset="1" stopColor="#6dc4ef" stopOpacity="0"/></radialGradient>
        <g id={`${id}-person`} fill={`url(#${id}-citizen)`} stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round">
          <circle cy="-205" r="17"/>
          <path d="M-18-180Q0-190 18-180L27-103 19-40 19 35 4 35 0-43-5 35-21 35-21-40-27-103Z"/>
          <path d="M-17-168-39-211-45-257M17-168 39-211 45-257" fill="none" strokeWidth="13" strokeLinecap="round"/>
          <circle cx="-45" cy="-257" r="7"/><circle cx="45" cy="-257" r="7"/>
        </g>
      </defs>
      <ellipse cx="450" cy="270" rx="445" ry="210" fill={`url(#${id}-union)`}/>
      {/* Raised hands meet their neighbours: no single sovereign above the citizens. */}
      {Array.from({ length: 11 }, (_, i) => <g key={i} className="rousseau-citizen" style={{ "--citizen-delay": `${i * 22}ms`, color: i % 2 ? "#f1da8b" : "#86def4" } as CSSProperties}>
        <use href={`#${id}-person`} transform={`translate(${45+i*81} ${400-Math.sin(i/10*Math.PI)*44}) scale(${.86+Math.sin(i/10*Math.PI)*.12})`} opacity={i===5 ? .35 : .66}/>
      </g>)}
      <path d="M30 426Q450 365 870 426M70 446Q450 401 830 446" fill="none" stroke="#97dfee" strokeOpacity=".38" strokeWidth="3"/>
      <path d="M110 465Q450 424 790 465" fill="none" stroke="#f6db85" strokeOpacity=".5" strokeWidth="2"/>
    </svg>
  </div>;
});

export function RousseauBrokenChains({ position }: { position: number }) {
  return <div className="rousseau-broken-chains" style={{ left: `${position}%` }} aria-hidden="true">
    <svg viewBox="0 0 280 240" className="rousseau-chain-art">
      <g className="rousseau-chain-flash" fill="none"><circle cx="140" cy="120" r="28" stroke="#9bffaf" strokeWidth="6"/><circle cx="140" cy="120" r="41" stroke="#fbe6a1" strokeWidth="2"/><path d="M140 60v25m0 70v25M80 120h25m70 0h25m-103-43 19 19m48 48 19 19m0-86-19 19m-48 48-19 19" stroke="#f7de85" strokeWidth="3"/></g>
      {Array.from({ length: 8 }, (_, i) => <g key={i} className="rousseau-chain-fragment" style={{ "--link-x": `${(i%2 ? 1 : -1)*(28+Math.floor(i/2)*14)}px`, "--link-y": `${-62+(i%4)*43}px`, "--link-spin": `${(i%2 ? 1 : -1)*(65+i*21)}deg` } as CSSProperties}>
        <g transform={`translate(${123+i%2*34} ${96+Math.floor(i/2)*14}) rotate(${i%2 ? 25 : -25})`} fill="none" strokeLinecap="butt">
          <path d="M6-12H-4a10 10 0 0 0-10 10V6a10 10 0 0 0 10 10H6" stroke="#273b41" strokeWidth="8"/>
          <path d="M6-12H-4a10 10 0 0 0-10 10V6a10 10 0 0 0 10 10H6" stroke="#bdced1" strokeWidth="4"/>
          <path d="M-8-10Q-12-8-12-2" stroke="#f4fbef" strokeWidth="1.5"/>
          <path d="M5-15 8-12 4-9M5 13 9 16 4 19" stroke="#e0d599" strokeWidth="2"/>
        </g>
      </g>)}
      {Array.from({ length: 8 },(_,i)=><circle key={i} className="rousseau-chain-spark" cx="140" cy="120" r={i%2 ? 2 : 3} fill={i%2 ? "#fff0a0" : "#91ffd0"} style={{ "--link-x": `${Math.cos(i*Math.PI/4)*95}px`, "--link-y": `${Math.sin(i*Math.PI/4)*85}px` } as CSSProperties}/>)}
    </svg>
  </div>;
}
