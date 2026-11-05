import React from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Zap, Brain, Shield, Sword } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SkillsPanel from "@/components/sheet/SkillsPanel";

export default function SharedCharacter() {
  const token = window.location.pathname.split("/shared/")[1];

  const { data: character, isLoading } = useQuery({
    queryKey: ["shared-character", token],
    queryFn: async () => {
      const results = await base44.entities.Character.filter({ share_token: token });
      return results[0] || null;
    },
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-full max-w-2xl p-4 space-y-4">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center p-8">
        <div>
          <p className="text-2xl font-cinzel text-muted-foreground mb-2">Ficha não encontrada</p>
          <p className="text-sm text-muted-foreground">Este link pode ter sido desativado ou é inválido.</p>
        </div>
      </div>
    );
  }

  const vitals = [
    { key: "pv", label: "PV", icon: Heart, color: "text-red-400" },
    { key: "pe", label: "PE", icon: Zap, color: "text-blue-400" },
    { key: "ps", label: "PS", icon: Brain, color: "text-purple-400" },
  ];

  return (
    <div className="min-h-screen bg-background p-4 lg:p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <img
          src="https://media.base44.com/images/public/user_69fca651120099459e840753/01436fc46_WhatsAppImage2026-05-05at183524.jpeg"
          alt="Scarlet Travellers"
          className="w-10 h-10 rounded-lg object-cover mx-auto mb-3 opacity-60"
        />
        <h1 className="font-cinzel text-2xl font-bold text-foreground">{character.name}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {character.race} • {character.char_class} • Nível {character.level}
        </p>
        {character.origin && (
          <Badge variant="outline" className="mt-2 border-primary/30 text-primary">{character.origin}</Badge>
        )}
      </div>

      {/* Attributes */}
      {character.attributes && (
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-6">
          {Object.entries(character.attributes).map(([attr, val]) => (
            <div key={attr} className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="text-[10px] text-muted-foreground font-bold tracking-wider">{attr}</div>
              <div className="text-xl font-cinzel font-bold text-primary">{val}</div>
            </div>
          ))}
        </div>
      )}

      {/* Vitals */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        {vitals.map(({ key, label, icon: Icon, color }) => {
          const v = character[key] || { total: 0, current: 0 };
          const pct = v.total > 0 ? (v.current / v.total) * 100 : 0;
          return (
            <div key={key} className="bg-card border border-border rounded-xl p-3">
              <div className="flex items-center gap-1 mb-1">
                <Icon className={`w-3 h-3 ${color}`} />
                <span className="text-[10px] font-bold text-muted-foreground">{label}</span>
              </div>
              <Progress value={pct} className="h-1.5 mb-1" />
              <p className="text-xs text-center text-muted-foreground">{v.current}/{v.total}</p>
            </div>
          );
        })}
      </div>

      {/* Defense */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <div>
            <p className="text-[9px] text-muted-foreground">CA Física</p>
            <p className="text-lg font-cinzel font-bold text-foreground">{character.ca_physical || 0}</p>
          </div>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-2">
          <Sword className="w-4 h-4 text-primary" />
          <div>
            <p className="text-[9px] text-muted-foreground">CA Mágica</p>
            <p className="text-lg font-cinzel font-bold text-foreground">{character.ca_magical || 0}</p>
          </div>
        </div>
      </div>

      {/* Tabs (read-only) */}
      <Tabs defaultValue="skills" className="mt-4">
        <div className="overflow-x-auto -mx-4 px-4">
          <TabsList className="flex w-max min-w-full bg-muted">
            <TabsTrigger value="skills" className="flex-shrink-0 text-xs px-3">Perícias</TabsTrigger>
            <TabsTrigger value="rituals" className="flex-shrink-0 text-xs px-3">Rituais</TabsTrigger>
            <TabsTrigger value="abilities" className="flex-shrink-0 text-xs px-3">Habilidades</TabsTrigger>
            <TabsTrigger value="spells" className="flex-shrink-0 text-xs px-3">Magias</TabsTrigger>
            <TabsTrigger value="inventory" className="flex-shrink-0 text-xs px-3">Inventário</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="skills">
          <SkillsPanel
            skills={character.skills || []}
            attributes={character.attributes || {}}
            editMode={false}
            onUpdate={() => {}}
            onRoll={() => {}}
          />
        </TabsContent>

        {["rituals", "abilities", "spells"].map((key) => (
          <TabsContent key={key} value={key}>
            <div className="mt-4 space-y-2">
              {(character[key] || []).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhum item.</p>
              ) : (
                (character[key] || []).map((item, idx) => (
                  <div key={idx} className="bg-card border border-border rounded-lg p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm text-foreground">{item.name}</span>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        {item.cost > 0 && <span className="text-blue-400">PE: {item.cost}</span>}
                        {item.ed && <span>{item.ed}</span>}
                        {item.damage && <span className="text-red-400">{item.damage}</span>}
                      </div>
                    </div>
                    {(item.description || item.effect) && (
                      <p className="text-xs text-muted-foreground">{item.description || item.effect}</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        ))}

        <TabsContent value="inventory">
          <div className="mt-4 bg-card border border-border rounded-xl p-4">
            <p className="text-sm text-foreground whitespace-pre-wrap">
              {character.inventory || <span className="text-muted-foreground">Inventário vazio.</span>}
            </p>
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-center mt-12 pb-8 text-xs text-muted-foreground/40">
        Scarlet Travellers • Apenas visualização
      </div>
    </div>
  );
}