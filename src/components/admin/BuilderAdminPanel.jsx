import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import AutoTextarea from "@/components/ui/AutoTextarea";
import { toast } from "sonner";
import {
  Wand2, Plus, Trash2, Pencil, ChevronDown, Check, Sparkles, Loader2,
} from "lucide-react";
import { BUILDER_STEPS, DEFAULT_STEP_OPTIONS } from "@/lib/builderContent";
import { optionCaracteristicas } from "@/lib/optionContent";
import BuilderOptionEditor from "./BuilderOptionEditor";
import PassadoAdminPanel from "./PassadoAdminPanel";

export default function BuilderAdminPanel() {
  const queryClient = useQueryClient();
  const [selectedStepId, setSelectedStepId] = useState("origem");
  const [editingOption, setEditingOption] = useState(null);
  const [addingOption, setAddingOption] = useState(false);
  const [descDraft, setDescDraft] = useState(null);

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["builderContent"],
    queryFn: () => base44.entities.BuilderContent.list("order", 50),
  });

  const recordForStep = (stepId) => records.find((r) => r.step_id === stepId);

  const selectedRecord = recordForStep(selectedStepId);
  const hasOptions = !!DEFAULT_STEP_OPTIONS[selectedStepId];

  const currentDescription =
    descDraft !== null ? descDraft : (selectedRecord?.description ?? BUILDER_STEPS.find((s) => s.id === selectedStepId)?.description ?? "");
  const currentOptions = selectedRecord?.options ?? DEFAULT_STEP_OPTIONS[selectedStepId] ?? [];

  const saveStepMutation = useMutation({
    mutationFn: async ({ stepId, data }) => {
      const existing = recordForStep(stepId);
      const stepMeta = BUILDER_STEPS.find((s) => s.id === stepId);
      const payload = {
        step_id: stepId,
        label: stepMeta.label,
        description: data.description,
        options: data.options,
        order: stepMeta.order ?? BUILDER_STEPS.findIndex((s) => s.id === stepId),
      };
      if (existing) return base44.entities.BuilderContent.update(existing.id, payload);
      return base44.entities.BuilderContent.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builderContent"] });
      toast.success("Conteúdo salvo!");
      setDescDraft(null);
    },
    onError: () => toast.error("Erro ao salvar"),
  });

  const deleteOptionMutation = useMutation({
    mutationFn: async ({ stepId, optionIndex }) => {
      const rec = recordForStep(stepId);
      const options = [...(rec?.options ?? DEFAULT_STEP_OPTIONS[stepId] ?? [])];
      options.splice(optionIndex, 1);
      const stepMeta = BUILDER_STEPS.find((s) => s.id === stepId);
      const payload = {
        step_id: stepId,
        label: stepMeta.label,
        description: rec?.description ?? stepMeta.description,
        options,
        order: BUILDER_STEPS.findIndex((s) => s.id === stepId),
      };
      if (rec) return base44.entities.BuilderContent.update(rec.id, payload);
      return base44.entities.BuilderContent.create(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["builderContent"] });
      toast.success("Opção removida.");
    },
  });

  const handleSaveOption = (optionData) => {
    const options = [...currentOptions];
    if (editingOption !== null) {
      options[editingOption] = optionData;
    } else {
      options.push(optionData);
    }
    saveStepMutation.mutate({
      stepId: selectedStepId,
      data: { description: currentDescription, options },
    });
    setEditingOption(null);
    setAddingOption(false);
  };

  const handleSaveDescription = () => {
    saveStepMutation.mutate({
      stepId: selectedStepId,
      data: { description: currentDescription, options: currentOptions },
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Wand2 className="w-5 h-5 text-primary" />
        <h2 className="font-cinzel text-lg font-semibold">Construção de Ficha</h2>
      </div>

      {/* Step selector */}
      <div className="flex gap-2 flex-wrap">
        {BUILDER_STEPS.map((step) => {
          const rec = recordForStep(step.id);
          const isCustomized = !!rec;
          return (
            <button
              key={step.id}
              onClick={() => { setSelectedStepId(step.id); setDescDraft(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                selectedStepId === step.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {step.label}
              {isCustomized && (
                <span className={`w-1.5 h-1.5 rounded-full ${selectedStepId === step.id ? "bg-primary-foreground" : "bg-primary"}`} />
              )}
            </button>
          );
        })}
      </div>

      {/* Editor for selected step */}
      <div className="bg-card border border-border rounded-xl p-4 space-y-4">
        {/* Description */}
        <div className="space-y-1">
          <Label className="text-xs font-semibold text-primary">Descrição da aba</Label>
          <AutoTextarea
            value={currentDescription}
            onChange={(e) => setDescDraft(e.target.value)}
            placeholder="Texto que aparece para o usuário nesta etapa..."
            className="bg-background"
          />
          {descDraft !== null && descDraft !== (selectedRecord?.description ?? "") && (
            <Button size="sm" onClick={handleSaveDescription} disabled={saveStepMutation.isPending} className="mt-1 h-7 text-xs bg-primary text-primary-foreground">
              <Check className="w-3 h-3 mr-1" /> Salvar descrição
            </Button>
          )}
        </div>

        {/* Passado: gestão de antecedentes dentro da Construção */}
        {selectedStepId === "passado" && (
          <div className="border-t border-border pt-4">
            <PassadoAdminPanel />
          </div>
        )}

        {/* Options list (only for steps that have options) */}
        {hasOptions && selectedStepId !== "passado" && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-primary">Opções ({currentOptions.length})</Label>
              <Button size="sm" variant="outline" onClick={() => setAddingOption(true)} className="h-7 text-xs border-primary/30 text-primary">
                <Plus className="w-3 h-3 mr-1" /> Nova opção
              </Button>
            </div>

            {currentOptions.length === 0 ? (
              <div className="border-2 border-dashed border-border rounded-xl py-8 text-center">
                <p className="text-sm text-muted-foreground">Nenhuma opção. Adicione a primeira.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {currentOptions.map((opt, idx) => (
                  <div key={idx} className="bg-background border border-border rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="w-4 h-4 text-primary flex-shrink-0" />
                      <span className="font-cinzel font-semibold text-sm flex-1 truncate">{opt.name}</span>
                      <Button size="icon" variant="ghost" onClick={() => setEditingOption(idx)} className="h-7 w-7 text-muted-foreground hover:text-foreground">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteOptionMutation.mutate({ stepId: selectedStepId, optionIndex: idx })}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{opt.description}</p>
                    {optionCaracteristicas(opt).length > 0 && (
                      <div className="flex gap-3 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-primary/70 flex items-center gap-0.5">
                          <Sparkles className="w-2.5 h-2.5" /> {optionCaracteristicas(opt).length} características
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {!hasOptions && selectedStepId !== "passado" && (
          <p className="text-xs text-muted-foreground italic">
            Esta etapa não possui opções de seleção — apenas a descrição é editável.
          </p>
        )}
      </div>

      <AnimatePresence>
        {(addingOption || editingOption !== null) && (
          <BuilderOptionEditor
            option={editingOption !== null ? currentOptions[editingOption] : null}
            onSave={handleSaveOption}
            onClose={() => { setEditingOption(null); setAddingOption(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}