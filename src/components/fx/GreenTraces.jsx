import React, { useEffect, useMemo, useState } from "react";

/**
 * Traços verdes de fundo: linhas em ângulo (como circuitos/runas) com um
 * pulso de luz correndo por cada uma e um nó que pisca na ponta.
 * As coordenadas são em pixels da tela, para o pulso ficar contínuo.
 */
function useViewport() {
  const get = () => ({ w: window.innerWidth || 1280, h: window.innerHeight || 800 });
  const [size, setSize] = useState(get);
  useEffect(() => {
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => setSize(get()), 250);
    };
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", onResize);
    };
  }, []);
  return size;
}

export default function GreenTraces({ count: wanted = 9 }) {
  const { w, h } = useViewport();
  const mobile = w < 768;
  const count = mobile ? Math.min(5, wanted) : wanted;
  const paths = useMemo(() => {
    const rnd = (a, b) => a + Math.random() * (b - a);
    const unit = Math.min(w, h);
    return Array.from({ length: count }, (_, i) => {
      let x = rnd(0, w);
      let y = rnd(0, h);
      let d = `M${x.toFixed(0)} ${y.toFixed(0)}`;
      for (let k = 0; k < 5; k++) {
        const step = rnd(0.08, 0.22) * unit * (Math.random() < 0.5 ? -1 : 1);
        if ((k + i) % 2 === 0) x = Math.max(0, Math.min(w, x + step));
        else y = Math.max(0, Math.min(h, y + step));
        d += ` L${x.toFixed(0)} ${y.toFixed(0)}`;
      }
      return { d, end: { x, y }, dur: rnd(6, 12), delay: -rnd(0, 12) };
    });
  }, [w, h, count]);

  return (
    <svg aria-hidden="true" className="fixed inset-0 w-full h-full pointer-events-none z-0" viewBox={`0 0 ${w} ${h}`}>
      <defs>
        <filter id="st-trace-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.2" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      {paths.map((p, i) => (
        <g key={i}>
          <path d={p.d} fill="none" stroke="hsl(var(--trace-faint))" strokeWidth="1" />
          <path
            d={p.d}
            fill="none"
            stroke="hsl(var(--trace))"
            strokeWidth="2"
            strokeLinecap="round"
            pathLength="100"
            filter={mobile ? undefined : "url(#st-trace-glow)"}
            style={{ strokeDasharray: "5 95", animation: `st-trace-run ${p.dur}s linear ${p.delay}s infinite` }}
          />
          <circle
            cx={p.end.x}
            cy={p.end.y}
            r="2.5"
            fill="hsl(var(--trace))"
            style={{ animation: `st-trace-blink ${p.dur / 2}s ease-in-out ${p.delay}s infinite` }}
          />
        </g>
      ))}
      <style>{`
        @keyframes st-trace-run { from { stroke-dashoffset: 100; } to { stroke-dashoffset: 0; } }
        @keyframes st-trace-blink { 0%,100% { opacity: .15; } 50% { opacity: .9; } }
      `}</style>
    </svg>
  );
}
