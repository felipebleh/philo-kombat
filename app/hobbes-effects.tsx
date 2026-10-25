import { memo, useId, useEffect, useRef } from "react";

// Original vector art: the reference frontispiece is never bundled or loaded.
export const HobbesSovereign = memo(function HobbesSovereign({ origin, target, enemy = false }: { origin: number; target: number; enemy?: boolean }) {
  const id = useId().replace(/:/g, "");
  const ref = (name: string) => `url(#${id}-${name})`;
  const body = "M325 205 Q288 208 250 255 L153 307 121 294 106 324 Q147 369 192 350 L294 305 292 489 Q400 530 508 489 L506 305 608 350 Q653 369 694 324 L679 294 647 307 550 255 Q512 208 475 205Z";
  return <>
    <div className={`hobbes-sovereign ${enemy ? "sovereign-enemy" : ""}`} style={{ left: `${origin}%` }} aria-hidden="true">
      <svg viewBox="0 0 800 620" fill="none" className="hobbes-sovereign-art">
        <defs>
          <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#fff0ac"/><stop offset=".3" stopColor="#d4a33c"/><stop offset=".5" stopColor="#fff4c1"/><stop offset=".76" stopColor="#986318"/><stop offset="1" stopColor="#e8c577"/></linearGradient>
          <linearGradient id={`${id}-steel`} x1="0" y1="0" x2="1" y2="0"><stop stopColor="#353c42"/><stop offset=".5" stopColor="#c5c6b0"/><stop offset="1" stopColor="#485050"/></linearGradient>
          <linearGradient id={`${id}-skin`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#eed4a3"/><stop offset=".6" stopColor="#bc9369"/><stop offset="1" stopColor="#75543e"/></linearGradient>
          <linearGradient id={`${id}-robe`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#b29a62"/><stop offset=".52" stopColor="#695d45"/><stop offset="1" stopColor="#202b2d" stopOpacity=".2"/></linearGradient>
          <linearGradient id={`${id}-land`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#7d9476" stopOpacity=".75"/><stop offset="1" stopColor="#14282c" stopOpacity="0"/></linearGradient>
          <radialGradient id={`${id}-aura`}><stop stopColor="#ffe59e" stopOpacity=".4"/><stop offset=".6" stopColor="#d5aa4e" stopOpacity=".12"/><stop offset="1" stopColor="#e3c268" stopOpacity="0"/></radialGradient>
          <clipPath id={`${id}-people`}><path d={body}/></clipPath>
          <g id={`${id}-citizen`}><circle cy="-8" r="3.2"/><path d="M-3-4Q0-6 3-4L5 7 2 7 2 15 0 16-2 15-2 7-5 7Z"/></g>
        </defs>
        <ellipse cx="400" cy="280" rx="350" ry="280" fill={ref("aura")}/>
        <g stroke={ref("gold")} strokeWidth="1" opacity=".3">{Array.from({length: 24}, (_, i) => <path key={i} d="M400 195V16" transform={`rotate(${i * 15} 400 235)`}/>)}</g>
        <path d={body} fill={ref("robe")} stroke={ref("gold")} strokeWidth="4"/>
        <g clipPath={ref("people")}>
          {Array.from({length: 15}, (_, row) => Array.from({length: 33}, (_, col) => <use key={`${row}-${col}`} href={`#${id}-citizen`} transform={`translate(${100 + col * 19 + row % 2 * 8} ${213 + row * 20}) scale(${.78 + (col % 3) * .08})`} fill={["#e0be76", "#293939", "#b88b56", "#714634", "#d6c89b"][ (row + col) % 5 ]} stroke="#332d25" strokeWidth=".6"/>))}
        </g>
        <path d="M325 210Q350 240 400 251 450 240 475 210M294 306Q312 281 318 250M506 306Q488 281 482 250M326 251L319 457M474 251L481 457" stroke={ref("gold")} strokeWidth="3" opacity=".8"/>
        <path d="M363 171 358 215Q400 249 442 215L437 171" fill={ref("skin")} stroke="#70513a" strokeWidth="3"/>
        <path d="M347 87Q321 116 327 153 313 174 329 207L354 216 369 178 432 179 447 217 473 206Q488 178 471 151 480 112 451 87Z" fill="#352b28" stroke="#aa8851" strokeWidth="3"/>
        <path d="M350 104Q351 77 400 80 450 77 451 104L444 158Q438 187 400 199 363 187 356 158Z" fill={ref("skin")} stroke="#62432e" strokeWidth="3"/>
        <path d="M349 110Q364 104 379 88 410 105 451 105L446 83 359 82Z" fill="#3e3029"/>
        <path d="M363 125Q375 119 387 125M414 125Q426 119 437 126" stroke="#503c2c" strokeWidth="5" strokeLinecap="round"/>
        <path d="M365 131Q375 136 385 130M416 130Q426 136 435 131" stroke="#302b26" strokeWidth="2.7"/><circle cx="377" cy="131" r="2.4" fill="#201e1b"/><circle cx="425" cy="131" r="2.4" fill="#201e1b"/>
        <path d="M400 129 391 153 407 155" stroke="#886545" strokeWidth="2.5"/><path d="M400 158Q386 151 375 164L369 171Q389 174 400 164 411 174 432 171L425 164Q414 152 400 158Z" fill="#392b25"/>
        <path d="M386 178Q400 185 416 177L406 195 393 194Z" fill="#392b25"/><path d="M392 176H409" stroke="#aa7258" strokeWidth="2"/>
        <g fill="none" stroke="#876b4b" strokeWidth="1.4" opacity=".8">{[0,1,2,3,4].map(i=><path key={i} d={`M${338+i*4} 122q-12 30 0 66m${108-i*8} -65q16 31 0 66`}/>)}</g>
        <g stroke="#6d491b" strokeWidth="3" fill={ref("gold")}>
          <path d="M350 81 340 42 366 59 380 25 400 53 421 25 435 59 461 42 450 81Z"/>
          <path d="M351 81Q400 65 449 81L449 94Q400 81 351 94Z"/>
          <path d="M354 45Q361 5 400 14 439 5 448 45M378 34Q379 9 400 14 421 9 422 34"/>
          <path d="M394 6H406M400 0V17" strokeWidth="5"/>
        </g>
        <g fill="#932f29" stroke="#ffdc8c" strokeWidth="1.5"><ellipse cx="400" cy="76" rx="5" ry="6"/><circle cx="365" cy="81" r="3"/><circle cx="435" cy="81" r="3"/></g>
        <path d="M125 303Q107 284 95 297L91 318Q105 340 130 327Z M675 303Q693 284 705 297L709 318Q695 340 670 327Z" fill={ref("skin")} stroke="#775a41" strokeWidth="3"/>
        <g className="hobbes-sovereign-blade" stroke="#7c561e" strokeWidth="2" fill={ref("gold")}>
          <path d="M112 321 249 22 270 1 266 34 128 328Z"/><path d="M122 319 264 12" stroke="#fff5ca" strokeWidth="2"/>
          <path d="M88 318 144 344 140 353 84 327Z"/><path d="M106 335 119 341 101 378 89 372Z"/><circle cx="93" cy="378" r="9"/>
        </g>
        <g stroke={ref("gold")} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
          <path d="M753 465 651 108M651 108C628 75 615 39 649 21 687 4 731 32 707 64 695 80 674 67 680 53 685 43 699 48 694 57"/>
          <path d="M646 85Q678 97 701 76M650 109 672 101" strokeWidth="5"/>
          <path d="M633 38Q647 50 663 41M655 22 665 7 680 21M717 38 728 44 717 53" strokeWidth="4"/>
        </g>
        <path d="M50 515Q135 429 242 476 320 409 400 462 470 406 555 474 674 419 761 515L761 615H50Z" fill={ref("land")}/>
        <path d="M60 530Q220 494 400 532T750 528M90 551Q270 519 420 549T721 546M140 572Q400 548 679 573" stroke="#b7c5a0" opacity=".35" strokeWidth="2"/>
        <path d="M84 507 84 484 94 484 94 477 103 477 103 484 113 484 113 507M575 487V464H592V487M583 465V451M226 482V462H243V482" stroke="#c3b078" opacity=".6" strokeWidth="3"/>
      </svg>
    </div>
    <svg className={`hobbes-sovereign-cut ${enemy ? "cut-enemy" : ""}`} viewBox="0 0 1000 500" preserveAspectRatio="none" style={{ left: `${Math.min(origin, target)}%`, width: `${Math.max(12, Math.abs(target-origin))}%` }} aria-hidden="true"><path d="M20 10Q510 90 980 465" stroke="#b67d20" strokeWidth="80"/><path d="M20 10Q510 90 980 465" stroke="#ffe38b" strokeWidth="35"/><path d="M20 10Q510 90 980 465" stroke="#fffcea" strokeWidth="8"/></svg>
  </>;
});

export function HobbesShield() {
  return <svg className="hobbes-guard-shield" viewBox="0 0 120 160" aria-hidden="true"><path d="M8 13Q60-5 112 13L105 96Q97 130 60 151 23 130 15 96Z" fill="#70818b" fillOpacity=".48" stroke="#d9ba68" strokeWidth="5"/><path d="M17 22Q60 7 103 22L97 94Q87 123 60 141 33 123 23 94Z" fill="#d2ac4e" fillOpacity=".13" stroke="#f7dc91" strokeWidth="1.5"/><path d="M34 55 29 31 47 43 60 22 73 43 91 31 86 55Z" fill="#d8b965" stroke="#fff1b4" strokeWidth="2"/><path d="M42 113 77 68 84 60 84 73 49 120Z" fill="#ecdeae"/><path d="M39 109 54 121M44 118 37 128" stroke="#e8bd62" strokeWidth="5"/><path d="M60 61V133" stroke="#d8b965" strokeWidth="1" opacity=".5"/></svg>;
}

export function HobbesChains() {
  return <svg className="hobbes-pact-chains" viewBox="0 0 200 90" aria-hidden="true">{Array.from({length: 13},(_,i)=><ellipse key={i} cx={18+i*14} cy={47+Math.sin(i*.7)*15} rx="13" ry="7" transform={`rotate(${i%2?40:-35} ${18+i*14} ${47+Math.sin(i*.7)*15})`} fill="none" stroke={i%2?"#d6dde1":"#798991"} strokeWidth="4"/>)}<path d="M93 48h20v25H93Z" fill="#46535b" stroke="#d8c38a" strokeWidth="2"/><path d="M97 49V39a6 6 0 0 1 12 0v10" fill="none" stroke="#aebcc2" strokeWidth="4"/></svg>;
}

export function HobbesWolfAura() {
  return <svg className="hobbes-wolf-aura" viewBox="0 0 500 260" aria-hidden="true"><path d="M15 185 85 142 160 148 224 92 296 78 322 34 336 82 379 61 374 104 440 113 481 135 447 158 399 152 351 183 319 236 288 239 300 182 249 174 183 229 143 230 163 177 90 194Z" fill="#290a1e" fillOpacity=".68" stroke="#c23851" strokeWidth="5"/><path d="m395 118 20-1" stroke="#ffb7a1" strokeWidth="5"/><path d="M70 77Q216 18 350 106M54 103Q200 38 340 123M30 130Q180 64 328 141" stroke="#bc2449" strokeWidth="9" fill="none"/><path d="M39 119 147 151M35 146 133 170M28 173 115 192" stroke="#ec6079" strokeWidth="4"/></svg>;
}


// Keep the animation's current time when the 600ms restraint expires mid-jump.
export function HobbesPactJump({ active, bound }: { active: boolean; bound: boolean }) {
  const marker = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (!active) return;
    const root = marker.current?.parentElement;
    for (const animation of root?.getAnimations() ?? []) {
      if ((animation as CSSAnimation).animationName === "jump") animation.playbackRate = bound ? .5 : 1;
    }
  }, [active, bound]);
  return <span hidden ref={marker} aria-hidden="true" />;
}
