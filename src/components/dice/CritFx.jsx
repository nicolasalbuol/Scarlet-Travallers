import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

// Rachaduras saindo do centro (coordenadas em % da tela).
const CRACKS = [
  "M50 50 L44 38 L47 30 L40 18 L42 6",
  "M50 50 L60 43 L66 45 L78 36 L94 33",
  "M50 50 L57 60 L55 70 L63 82 L60 96",
  "M50 50 L39 56 L31 54 L20 63 L4 66",
  "M50 50 L58 52 L70 58 L84 70",
  "M50 50 L46 62 L38 74 L33 90",
];

/**
 * Efeito de tela cheia para crítico ("crit") e falha crítica ("fail").
 * As cores vêm do tema (--h, --h2, --fail), então mudam com a paleta escolhida.
 */
export default function CritFx({ kind, onDone }) {
  const [alive, setAlive] = useState(true);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => {
      setAlive(false);
      done.current?.();
    }, 1700);
    return () => clearTimeout(t);
  }, []);
  if (!alive || !kind) return null;

  return createPortal(
    <div aria-hidden="true" className={`st-fx st-fx-${kind}`}>
      {kind === "crit" ? (
        <>
          <div className="st-fx-flash" />
          <div className="st-fx-rays" />
          <div className="st-fx-ring" style={{ animationDelay: "0s" }} />
          <div className="st-fx-ring" style={{ animationDelay: "0.15s" }} />
          <div className="st-fx-ring" style={{ animationDelay: "0.3s" }} />
          <div className="st-fx-word st-fx-word-crit">CRÍTICO!</div>
        </>
      ) : (
        <>
          <div className="st-fx-vignette" />
          <svg className="st-fx-cracks" viewBox="0 0 100 100" preserveAspectRatio="none">
            {CRACKS.map((d, i) => (
              <path key={i} d={d} pathLength="100" style={{ animationDelay: `${i * 0.04}s` }} />
            ))}
          </svg>
          <div className="st-fx-word st-fx-word-fail" data-text="FALHA CRÍTICA">FALHA CRÍTICA</div>
        </>
      )}
    </div>,
    document.body
  );
}

// Cor do tema em hex para o confete (canvas-confetti não entende variáveis CSS).
export function paletteHex() {
  const cs = getComputedStyle(document.documentElement);
  const h = parseFloat(cs.getPropertyValue("--h")) || 161;
  const h2 = parseFloat(cs.getPropertyValue("--h2")) || 152;
  const hex = (H, S, L) => {
    const s = S / 100, l = L / 100;
    const f = (n) => {
      const k = (n + H / 30) % 12;
      const c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1));
      return Math.round(c * 255).toString(16).padStart(2, "0");
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };
  return [hex(h, 19, 46), hex(h2, 45, 66), hex(h2, 60, 85), "#ffffff"];
}
