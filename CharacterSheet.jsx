import React, { useState, useEffect, useCallback, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Pencil, Loader2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import debounce from "lodash/debounce";

import CharacterHeader from "@/components/sheet/CharacterHeader";
import AttributesPanel from "@/components/sheet/AttributesPanel";
import VitalPoints from "@/components/sheet/VitalPoints";
import DefensePanel from "@/components/sheet/DefensePanel";
import SkillsPanel from "@/components/sheet/SkillsPanel";
import MentalStateTab from "@/components/sheet/MentalStateTab";
import RaceTab from "@/components/sheet/RaceTab";
import ListTab from "@/components/sheet/ListTab";
import LoreTab from "@/components/sheet/LoreTab";
import InventoryTab from "@/components/sheet/InventoryTab";
import InvocationsTab from "@/components/sheet/InvocationsTab";
import WeaponsTab from "@/components/sheet/WeaponsTab";
import RollingsTab from "@/components/sheet/RollingsTab";
import DiceRollModal from "@/components/dice/DiceRollModal";
import ShareModal from "@/components/sheet/ShareModal";
import { useAuth } from "@/lib/AuthContext";
import { classAbilityCatalog, traitAbilities } from "@/lib/autoBuild";

const TAB_CLS =
  "flex-shrink-0 text-xs px-3 py-2.5 rounded-none rounded-t-lg border-b-2 border-transparent text-muted-foreground transition-all hover:text-foreground data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:border-primary data-[state=active]:shadow-[0_8px_20px_-10px_hsl(161_38%_50%/0.9)]";

const PANE_CLS = "data-[state=active]:animate-in data-[state=active]:fade-in-0 data-[state=active]:slide-in-from-bottom-3 duration-500";

// "Shadows (SHADOW's) (Principal) / Divinus" → { casa, entidade, casa2 }
function parseCasaField(origin, value) {
  const [main = "", second = ""] = String(value || "").split("/").map((x) => x.trim());
  const groups = [...main.matchAll(/\(([^)]+)\)/g)].map((m) => m[1]).filter((g) => g !== "Principal");
  return {
    origin,
    casa: main.replace(/\s*\([^)]*\)/g, "").trim(),
    entidade: groups[0] || "",
    casa2: second.replace(/\s*\([^)]*\)/g, "").trim(),
  };
}

export default function CharacterSheet() {
  const urlParams = new URLSearchParams(window.location.search);
  const charId = window.location.pathname.split("/character/")[1];
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rollHistory, setRollHistory] = useState([]);
  const [shareOpen, setShareOpen] = useState(false);
  const { user } = useAuth();

  // Dice modal state
  const [diceModal, setDiceModal] = useState({ open: false, label: "", attributeValue: 1, training: 0, bonus: 0 });

  // Quem pode editar: dono, administrador, mestre da campanha que contém a ficha,
  // ou quem abriu pelo link de edição compartilhado.
  const shareToken = urlParams.get("share");

  const { data: character, isLoading } = useQuery({
    queryKey: ["character", charId, shareToken],
    queryFn: async () => {
      const own = await base44.entities.Character.filter({ id: charId });
      if (own[0]) return own[0];
      // Sem acesso direto: tenta pelo link de edição.
      return shareToken ? base44.shared.getForEdit(charId, shareToken) : null;
    },
    enabled: !!charId && !!user?.email,
  });
  const isOwner = !!user?.email && character?.created_by === user.email;

  const { data: isCampaignMaster = false } = useQuery({
    queryKey: ["campaign-master-of", charId, user?.email],
    queryFn: async () => {
      const campaigns = await base44.entities.Campanha.list("-created_date", 200);
      return campaigns.some(
        (c) =>
          c.master_email === user.email &&
          (c.members || []).some((m) => m.character_id === charId)
      );
    },
    enabled: !!charId && !!user?.email && !!character,
  });

  const canEdit =
    isOwner ||
    user?.role === "admin" ||
    isCampaignMaster ||
    (!!shareToken && shareToken === character?.edit_token);

  const [localChar, setLocalChar] = useState(null);

  useEffect(() => {
    if (character) setLocalChar({ ...character });
  }, [character]);

  useEffect(() => {
    if (!canEdit) setEditMode(false);
  }, [canEdit]);

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const { id, created_date, updated_date, created_by, ...rest } = data;
      const viaToken = !!shareToken && created_by !== user?.email && user?.role !== "admin" && !isCampaignMaster;
      return viaToken
        ? base44.shared.updateWithToken(id, shareToken, rest)
        : base44.entities.Character.update(id, rest);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["character", charId] });
      queryClient.invalidateQueries({ queryKey: ["characters"] });
    },
  });

  const debouncedSave = useCallback(
    debounce((data) => {
      setSaving(true);
      saveMutation.mutate(data, { onSettled: () => setSaving(false) });
    }, 2000),
    []
  );

  const updateField = (field, value) => {
    const updated = { ...localChar, [field]: value };
    setLocalChar(updated);
    debouncedSave(updated);
  };

  const updateNested = (path, value) => {
    const keys = path.split(".");
    const updated = { ...localChar };
    let ref = updated;
    for (let i = 0; i < keys.length - 1; i++) {
      ref[keys[i]] = { ...ref[keys[i]] };
      ref = ref[keys[i]];
    }
    ref[keys[keys.length - 1]] = value;
    setLocalChar(updated);
    debouncedSave(updated);
  };

  const openDiceRoll = (label, attributeValue, training = 0, bonus = 0) => {
    setDiceModal({ open: true, label, attributeValue, training, bonus });
  };

  const handleRollResult = (result) => {
    setRollHistory((prev) => [{ ...result, timestamp: Date.now() }, ...prev].slice(0, 10));
  };

  if (!isLoading && !character) {
    return (
      <div className="px-4 py-20 max-w-md mx-auto text-center">
        <p className="font-cinzel text-2xl text-foreground mb-2">Ficha não encontrada</p>
        <p className="text-sm text-muted-foreground mb-6">Ela não existe ou você não tem acesso a ela.</p>
        <Button variant="outline" onClick={() => navigate("/characters")}>Voltar para as fichas</Button>
      </div>
    );
  }

  if (isLoading || !localChar) {
    return (
      <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-5xl mx-auto space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="px-4 lg:px-10 py-6 lg:py-10 max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/characters")} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div className="flex items-center gap-2">
          {saving ? (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> Salvando...
            </span>
          ) : (
            <span className="text-xs text-accent flex items-center gap-1">
              <Check className="w-3 h-3" /> Salvo
            </span>
          )}
          {(isOwner || user?.role === "admin") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShareOpen(true)}
              className={localChar?.share_token ? "text-primary" : "text-muted-foreground"}
            >
              <Share2 className="w-4 h-4" />
            </Button>
          )}
          {canEdit && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditMode(!editMode)}
              className={editMode ? "text-primary" : "text-muted-foreground"}
            >
              {editMode ? <Check className="w-4 h-4" /> : <Pencil className="w-4 h-4" />}
            </Button>
          )}
        </div>
      </div>

      <CharacterHeader character={localChar} editMode={editMode} updateField={updateField} />

      <AttributesPanel
        attributes={localChar.attributes || {}}
        editMode={editMode}
        onUpdate={(attr, val) => updateNested(`attributes.${attr}`, val)}
        onRoll={(attrName, attrValue) => openDiceRoll(attrName, attrValue)}
      />

      <VitalPoints character={localChar} editMode={editMode} updateNested={updateNested} />
      <DefensePanel character={localChar} editMode={editMode} updateField={updateField} />

      {/* Tabs */}
      <Tabs defaultValue="skills" className="mt-6 st-panel p-3 sm:p-4">
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="flex w-max min-w-full bg-transparent h-auto p-0 gap-1 border-b border-border rounded-none">
            <TabsTrigger value="skills" className={TAB_CLS}>Perícias</TabsTrigger>
            <TabsTrigger value="mental" className={TAB_CLS}>Mental</TabsTrigger>
            <TabsTrigger value="race" className={TAB_CLS}>Raça</TabsTrigger>
            <TabsTrigger value="invocations" className={TAB_CLS}>Invocações</TabsTrigger>
            <TabsTrigger value="rituals" className={TAB_CLS}>Rituais</TabsTrigger>
            <TabsTrigger value="abilities" className={TAB_CLS}>Habilidades</TabsTrigger>
            <TabsTrigger value="spells" className={TAB_CLS}>Magias</TabsTrigger>
            <TabsTrigger value="weapons" className={TAB_CLS}>Armas</TabsTrigger>
            <TabsTrigger value="inventory" className={TAB_CLS}>Inventário</TabsTrigger>
            <TabsTrigger value="lore" className={TAB_CLS}>Lore</TabsTrigger>
            <TabsTrigger value="rollings" className={TAB_CLS}>Rolagens</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent className={PANE_CLS} value="skills">
          <SkillsPanel
            skills={localChar.skills || []}
            attributes={localChar.attributes || {}}
            editMode={editMode}
            onUpdate={(skills) => updateField("skills", skills)}
            onRoll={(skill) => {
              const attrVal = (localChar.attributes || {})[skill.attribute] || 0;
              openDiceRoll(`${skill.name} (${skill.attribute})`, attrVal, skill.training, skill.bonus);
            }}
          />
        </TabsContent>
        <TabsContent className={PANE_CLS} value="mental">
          <MentalStateTab character={localChar} editMode={editMode} updateField={updateField} updateNested={updateNested} />
        </TabsContent>
        <TabsContent className={PANE_CLS} value="race">
          <RaceTab character={localChar} editMode={editMode} updateField={updateField} />
        </TabsContent>
        <TabsContent className={PANE_CLS} value="invocations">
          <InvocationsTab
            invocations={localChar.invocations || []}
            editMode={editMode}
            onUpdate={(v) => updateField("invocations", v)}
          />
        </TabsContent>
        <TabsContent className={PANE_CLS} value="rituals">
          <ListTab items={localChar.rituals || []} editMode={editMode} onUpdate={(v) => updateField("rituals", v)} title="Rituais" />
        </TabsContent>
        <TabsContent className={PANE_CLS} value="abilities">
          <ListTab
            items={localChar.abilities || []}
            editMode={editMode}
            onUpdate={(v) => updateField("abilities", v)}
            title="Habilidades"
            canAdd={canEdit}
            suggestions={[
              ...traitAbilities(parseCasaField(localChar.origin, localChar.power_technique)),
              ...classAbilityCatalog(localChar.char_class),
            ]}
          />
        </TabsContent>
        <TabsContent className={PANE_CLS} value="spells">
          <ListTab items={localChar.spells || []} editMode={editMode} onUpdate={(v) => updateField("spells", v)} title="Magias" />
        </TabsContent>
        <TabsContent className={PANE_CLS} value="weapons">
          <WeaponsTab weapons={localChar.weapons || []} editMode={editMode} onUpdate={(v) => updateField("weapons", v)} />
        </TabsContent>
        <TabsContent className={PANE_CLS} value="inventory">
          <InventoryTab inventory={localChar.inventory || ""} editMode={editMode} onUpdate={(v) => updateField("inventory", v)} />
        </TabsContent>
        <TabsContent className={PANE_CLS} value="lore">
          <LoreTab character={localChar} editMode={editMode} updateField={updateField} />
        </TabsContent>
        <TabsContent className={PANE_CLS} value="rollings">
          <RollingsTab />
        </TabsContent>
      </Tabs>

      {/* Roll History */}
      {rollHistory.length > 0 && (
        <div className="mt-6 st-panel p-4">
          <h3 className="font-cinzel text-xs tracking-[0.25em] font-semibold mb-3 text-muted-foreground">HISTÓRICO DE ROLAGENS</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {rollHistory.map((r, i) => (
              <div key={i} className={`text-xs flex items-center justify-between p-2 rounded-lg ${
                r.isCritical ? "bg-accent/10 text-accent" : r.isCriticalFail ? "bg-destructive/10 text-destructive" : "bg-muted"
              }`}>
                <span className="font-medium">{r.label}</span>
                <span className="font-mono">
                  [{r.rolls.join(",")}] → <strong>{r.total}</strong>
                  {r.isCritical && " ★"}
                  {r.isCriticalFail && " ✗"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <ShareModal
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        character={localChar}
        onUpdate={updateField}
      />

      <DiceRollModal
        open={diceModal.open}
        onClose={() => setDiceModal({ ...diceModal, open: false })}
        label={diceModal.label}
        attributeValue={diceModal.attributeValue}
        training={diceModal.training}
        bonus={diceModal.bonus}
        onRollResult={handleRollResult}
      />
    </div>
  );
}