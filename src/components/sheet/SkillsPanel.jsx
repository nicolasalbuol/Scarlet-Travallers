import React from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dices } from "lucide-react";
import { motion } from "framer-motion";

export default function SkillsPanel({ skills, attributes, editMode, onUpdate, onRoll }) {
  const handleChange = (index, field, value) => {
    const updated = [...skills];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  // Group skills by attribute
  const grouped = {};
  (skills || []).forEach((skill, idx) => {
    if (!grouped[skill.attribute]) grouped[skill.attribute] = [];
    grouped[skill.attribute].push({ ...skill, _index: idx });
  });

  return (
    <div className="space-y-4 mt-4">
      {Object.entries(grouped).map(([attr, groupSkills]) => (
        <div key={attr}>
          <h3 className="text-[10px] font-bold text-muted-foreground tracking-wider mb-2 flex items-center gap-2">
            {attr}
            <Badge variant="outline" className="text-[9px] px-1.5 py-0">{(attributes[attr] || 0)}d20</Badge>
          </h3>
          <div className="space-y-1">
            {groupSkills.map((skill) => (
              <motion.div
                key={skill._index}
                whileTap={!editMode ? { scale: 0.98 } : {}}
                onClick={() => !editMode && onRoll(skill)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
                  editMode
                    ? "bg-card border border-primary/20"
                    : "bg-card border border-border hover:border-primary/40 cursor-pointer active:bg-primary/5"
                }`}
              >
                {!editMode && <Dices className="w-3.5 h-3.5 text-primary/50 flex-shrink-0" />}
                <span className="text-sm flex-1 text-foreground">{skill.name}</span>

                {editMode ? (
                  <div className="flex items-center gap-1">
                    <div className="text-center">
                      <label className="text-[8px] text-muted-foreground block">Treino</label>
                      <Input
                        type="number"
                        value={skill.training || 0}
                        onChange={(e) => handleChange(skill._index, "training", Number(e.target.value))}
                        className="h-7 w-14 text-xs text-center bg-background"
                        min={0}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="text-center">
                      <label className="text-[8px] text-muted-foreground block">Bônus</label>
                      <Input
                        type="number"
                        value={skill.bonus || 0}
                        onChange={(e) => handleChange(skill._index, "bonus", Number(e.target.value))}
                        className="h-7 w-14 text-xs text-center bg-background"
                        min={0}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {skill.training > 0 && <span className="text-primary font-medium">T:{skill.training}</span>}
                    {skill.bonus > 0 && <span className="text-accent font-medium">B:{skill.bonus}</span>}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}