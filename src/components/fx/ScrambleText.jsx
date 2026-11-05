import React, { useEffect, useRef, useState } from "react";

const GLYPHS = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ✶✦◈⟁⌬";

/**
 * Texto que "se decifra": cada letra passa por runas até assentar.
 * Reexecuta quando `text` muda ou ao passar o mouse (hover=true).
 */
export default function ScrambleText({ text = "", className = "", as: Tag = "span", duration = 900, delay = 0, hover = false }) {
  const [out, setOut] = useState(text);
  const frame = useRef(0);
  const timer = useRef(0);

  const run = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !text) { setOut(text); return; }
    cancelAnimationFrame(frame.current);
    const start = performance.now();
    const chars = [...text];
    const step = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const settled = Math.floor(p * chars.length);
      setOut(
        chars
          .map((c, i) => (i < settled || c === " " ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join("")
      );
      if (p < 1) frame.current = requestAnimationFrame(step);
    };
    frame.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    timer.current = setTimeout(run, delay);
    return () => { clearTimeout(timer.current); cancelAnimationFrame(frame.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <Tag className={className} aria-label={text} onMouseEnter={hover ? run : undefined}>
      <span aria-hidden="true">{out}</span>
    </Tag>
  );
}
