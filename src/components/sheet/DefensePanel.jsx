import React from "react";
import { Input } from "@/components/ui/input";
import { Shield, ShieldHalf } from "lucide-react";

function DefenseCard({ icon: Icon, label, value, editMode, onChange, hue }) {
  return (
    <div className="group relative st-panel p-4 overflow-hidden">
      <svg viewBox="0 0 100 100" className="absolute -right-6 -top-6 w-28 h-28 opacity-20 group-hover:opacity-40 transition-opacity" aria-hidden="true" style={{ animation: "st-spin 30s linear infinite" }}>
        <polygon points="50,4 93,27 93,73 50,96 7,73 7,27" fill="none" stroke={`hsl(${hue} 70% 60%)`} strokeWidth="1.2" />
        <polygon points="50,18 80,34 80,66 50,82 20,66 20,34" fill="none" stroke={`hsl(${hue} 70% 60%)`} strokeWidth="0.8" strokeDasharray="3 3" />
      </svg>
      <div className="relative flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" style={{ color: `hsl(${hue} 75% 62%)` }} />
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      </div>
      {editMode ? (
        <Input type="number" value={value || 0} onChange={(e) => onChange(Number(e.target.value))} className="relative h-9 text-lg font-bold bg-background" min={0} />
      ) : (
        <div className="relative text-3xl font-cinzel font-bold text-foreground">{value || 0}</div>
      )}
    </div>
  );
}

export default function DefensePanel({ character, editMode, updateField }) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-5">
      <DefenseCard icon={Shield} label="CA Físico" value={character.ca_physical} editMode={editMode} onChange={(v) => updateField("ca_physical", v)} hue={352} />
      <DefenseCard icon={ShieldHalf} label="CA Mágico" value={character.ca_magical} editMode={editMode} onChange={(v) => updateField("ca_magical", v)} hue={40} />
    </div>
  );
}
