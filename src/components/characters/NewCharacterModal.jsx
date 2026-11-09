import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ORIGINS } from "@/lib/gameConstants";

export default function NewCharacterModal({ open, onClose, onCreate, isLoading }) {
  const [form, setForm] = useState({ name: "", race: "", char_class: "", origin: "", level: 1 });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onCreate(form);
    setForm({ name: "", race: "", char_class: "", origin: "", level: 1 });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-cinzel text-xl text-primary">Nova Ficha</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Personagem *</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Ex: Kaelith"
              className="bg-background"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Raça</Label>
              <Input
                value={form.race}
                onChange={(e) => setForm({ ...form, race: e.target.value })}
                placeholder="Ex: Elfo"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label>Classe</Label>
              <Input
                value={form.char_class}
                onChange={(e) => setForm({ ...form, char_class: e.target.value })}
                placeholder="Ex: Guerreiro"
                className="bg-background"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Origem</Label>
              <Select value={form.origin} onValueChange={(v) => setForm({ ...form, origin: v })}>
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Selecionar" />
                </SelectTrigger>
                <SelectContent>
                  {ORIGINS.map((o) => (
                    <SelectItem key={o} value={o}>{o}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nível</Label>
              <Input
                type="number"
                min={1}
                value={form.level}
                onChange={(e) => setForm({ ...form, level: Number(e.target.value) })}
                className="bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" disabled={isLoading || !form.name.trim()} className="bg-primary text-primary-foreground">
              {isLoading ? "Criando..." : "Criar Ficha"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}