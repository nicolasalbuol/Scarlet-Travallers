import React, { useRef } from "react";

/**
 * Cartão com inclinação 3D e um "lampião" que segue o cursor
 * (brilho escarlate + reflexo dourado na borda).
 */
export default function TiltCard({ children, className = "", max = 8, glare = true, ...rest }) {
  const ref = useRef(null);
  const raf = useRef(0);

  const onMove = (e) => {
    const el = ref.current;
    if (!el || e.pointerType === "touch") return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--mx", `${x * 100}%`);
      el.style.setProperty("--my", `${y * 100}%`);
      el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * max}deg) rotateY(${(x - 0.5) * max}deg) translateZ(0)`;
    });
  };
  const onLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(raf.current);
    el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "-20%");
  };

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group/tilt relative transition-transform duration-300 ease-out will-change-transform [transform-style:preserve-3d] ${className}`}
      style={{ "--mx": "50%", "--my": "-20%" }}
      {...rest}
    >
      {children}
      {glare && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 group-hover/tilt:opacity-100 transition-opacity duration-300"
          style={{
            background:
              "radial-gradient(420px circle at var(--mx) var(--my), hsl(161 38% 55% / 0.16), transparent 45%)",
          }}
        />
      )}
      {glare && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 group-hover/tilt:opacity-100 transition-opacity duration-300"
          style={{
            padding: 1,
            background:
              "radial-gradient(260px circle at var(--mx) var(--my), hsl(152 50% 62% / 0.85), transparent 60%)",
            WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
      )}
    </div>
  );
}
