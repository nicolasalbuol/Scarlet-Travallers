import React, { useEffect, useRef } from "react";

/**
 * Fundo vivo: brasas escarlates sobem devagar, "viajantes" (nós dourados)
 * se ligam por fios vermelhos quando se aproximam, e o cursor solta faíscas
 * e puxa os fios para perto — como se cada visitante abrisse uma rota.
 */
export default function ScarletField() {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    let w = 0, h = 0, dpr = 1, raf = 0, running = true;

    const mouse = { x: -9999, y: -9999, active: false };
    let embers = [];
    let nodes = [];
    let sparks = [];

    const rand = (a, b) => a + Math.random() * (b - a);

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const area = (w * h) / 1e6;
      embers = Array.from({ length: Math.round(40 * area + 20) }, () => newEmber(true));
      nodes = Array.from({ length: Math.round(18 * area + 10) }, () => ({
        x: rand(0, w), y: rand(0, h), vx: rand(-0.15, 0.15), vy: rand(-0.15, 0.15), r: rand(0.8, 1.8),
      }));
    };

    const newEmber = (anywhere) => ({
      x: rand(0, w),
      y: anywhere ? rand(0, h) : h + 10,
      vy: rand(0.15, 0.55),
      drift: rand(0, Math.PI * 2),
      r: rand(0.6, 2.2),
      life: rand(0.4, 1),
    });

    const onMove = (e) => {
      mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
      if (finePointer && !reduce && Math.random() < 0.55) {
        sparks.push({ x: e.clientX, y: e.clientY, vx: rand(-0.6, 0.6), vy: rand(-1.1, -0.2), life: 1, r: rand(0.8, 2) });
        if (sparks.length > 90) sparks.shift();
      }
    };
    const onLeave = () => { mouse.active = false; mouse.x = mouse.y = -9999; };
    const onVis = () => {
      running = !document.hidden;
      if (running) { cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
    };

    let t = 0;
    const tick = () => {
      if (!running) return;
      t += 0.016;
      ctx.clearRect(0, 0, w, h);

      // Fios entre viajantes
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (mouse.active) {
          const dx = mouse.x - n.x, dy = mouse.y - n.y, d = Math.hypot(dx, dy);
          if (d < 220) { n.x += dx * 0.0025; n.y += dy * 0.0025; }
        }
        if (n.x < -20) n.x = w + 20; if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20; if (n.y > h + 20) n.y = -20;
      }
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 160) {
            ctx.strokeStyle = `hsla(352, 80%, 55%, ${(1 - d / 160) * 0.22})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        if (mouse.active) {
          const d = Math.hypot(a.x - mouse.x, a.y - mouse.y);
          if (d < 200) {
            ctx.strokeStyle = `hsla(40, 70%, 62%, ${(1 - d / 200) * 0.35})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
          }
        }
        ctx.fillStyle = "hsla(40, 70%, 66%, 0.7)";
        ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, Math.PI * 2); ctx.fill();
      }

      // Brasas subindo
      for (let i = 0; i < embers.length; i++) {
        const e = embers[i];
        e.y -= e.vy;
        e.drift += 0.01;
        e.x += Math.sin(e.drift + t) * 0.25;
        const flicker = 0.55 + Math.sin(t * 3 + i) * 0.25;
        const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, e.r * 4);
        g.addColorStop(0, `hsla(355, 90%, 62%, ${0.75 * e.life * flicker})`);
        g.addColorStop(1, "hsla(352, 90%, 40%, 0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(e.x, e.y, e.r * 4, 0, Math.PI * 2); ctx.fill();
        if (e.y < -20) embers[i] = newEmber(false);
      }

      // Faíscas do cursor
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx; s.y += s.vy; s.vy += 0.015; s.life -= 0.022;
        if (s.life <= 0) { sparks.splice(i, 1); continue; }
        ctx.fillStyle = `hsla(${30 + s.life * 20}, 90%, 65%, ${s.life})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r * s.life, 0, Math.PI * 2); ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVis);

    if (reduce) {
      // Um único quadro estático
      running = true; tick(); running = false; cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas ref={ref} aria-hidden="true" className="fixed inset-0 pointer-events-none z-0" />;
}
