import React from "react";
import { motion } from "framer-motion";
import { Minus, Plus } from "lucide-react";
import { ATTRIBUTE_MAX } from "@/lib/attributeBonuses";
import { cn } from "@/lib/utils";

export default function AttributeNode({
  label,
  name,
  total,
  casa,
  canAdd,
  canRemove,
  onAdd,
  onRemove,
  position,
}) {
  const atMax = total >= ATTRIBUTE_MAX;

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2" style={position}>
      <div className="relative">
        <div
          title={name}
          className={cn(
            "w-16 h-16 sm:w-24 sm:h-24 rounded-full border-2 flex flex-col items-center justify-center gap-0.5 bg-card/90 backdrop-blur-sm transition-colors",
            casa > 0
              ? "border-primary shadow-[0_0_25px_-8px_hsl(var(--primary))]"
              : "border-border"
          )}
        >
          {casa > 0 && (
            <span className="text-[7px] sm:text-[9px] font-semibold uppercase tracking-wide text-primary-foreground bg-primary rounded-full px-1 sm:px-1.5 leading-tight">
              C.A.S.A. +{casa}
            </span>
          )}
          <motion.span
            key={total}
            initial={{ scale: 1.4, opacity: 0.35 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "font-cinzel font-bold leading-none text-xl sm:text-3xl",
              atMax ? "text-primary" : "text-foreground"
            )}
          >
            {total}
          </motion.span>
          <span className="font-cinzel text-[8px] sm:text-[11px] tracking-[0.15em] text-muted-foreground">
            {label}
          </span>
        </div>

        <button
          type="button"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={`Diminuir ${name}`}
          className="absolute -left-4 sm:-left-5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-border bg-card shadow flex items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition touch-manipulation"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onAdd}
          disabled={!canAdd}
          aria-label={`Aumentar ${name}`}
          className={cn(
            "absolute -right-4 sm:-right-5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full border shadow flex items-center justify-center transition touch-manipulation",
            canAdd
              ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20"
              : "border-border bg-card text-muted-foreground opacity-30 cursor-not-allowed"
          )}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}