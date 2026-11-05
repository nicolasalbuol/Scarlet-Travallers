import React from "react";
import { Textarea } from "@/components/ui/textarea";

export default function InventoryTab({ inventory, editMode, onUpdate }) {
  return (
    <div className="mt-4">
      <h3 className="text-xs font-semibold text-muted-foreground mb-2">INVENTÁRIO</h3>
      <Textarea
        value={inventory || ""}
        onChange={(e) => onUpdate(e.target.value)}
        placeholder="Liste seus itens, equipamentos e anotações..."
        className="bg-background min-h-[200px] text-sm"
      />
    </div>
  );
}