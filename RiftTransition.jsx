import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Transição "Fenda": a cada troca de página um corte escarlate rasga a tela
 * na vertical e as duas metades se abrem, revelando o novo universo.
 */
export default function RiftTransition({ routeKey }) {
  const first = useRef(true);
  const [play, setPlay] = useState(0);
  const count = useRef(0);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    count.current += 1;
    setPlay(count.current);
  }, [routeKey]);

  useEffect(() => {
    if (!play) return;
    const t = setTimeout(() => setPlay(0), 700);
    return () => clearTimeout(t);
  }, [play]);

  return (
    <AnimatePresence>
      {play > 0 && (
        <motion.div
          key={play}
          className="fixed inset-0 z-[70] pointer-events-none overflow-hidden"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 bg-background"
            initial={{ x: 0 }}
            animate={{ x: "-101%" }}
            transition={{ delay: 0.18, duration: 0.45, ease: [0.7, 0, 0.2, 1] }}
          />
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 bg-background"
            initial={{ x: 0 }}
            animate={{ x: "101%" }}
            transition={{ delay: 0.18, duration: 0.45, ease: [0.7, 0, 0.2, 1] }}
          />
          <motion.div
            className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2"
            style={{
              background: "linear-gradient(180deg, transparent, hsl(161 38% 60%), hsl(40 80% 70%), hsl(161 38% 60%), transparent)",
              boxShadow: "0 0 24px 6px hsl(161 38% 50% / 0.6)",
            }}
            initial={{ scaleY: 0, opacity: 1 }}
            animate={{ scaleY: [0, 1, 1], opacity: [1, 1, 0], scaleX: [1, 1, 30] }}
            transition={{ duration: 0.6, times: [0, 0.3, 1], ease: "easeOut" }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
