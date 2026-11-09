import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link2, Copy, Trash2, Loader2, CheckCheck, Eye, Pencil } from "lucide-react";
import { toast } from "sonner";
import { base44 } from "@/api/base44Client";

function generateToken() {
  return Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 10);
}

export default function ShareModal({ open, onClose, character, onUpdate }) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState("");

  const viewToken = character?.share_token;
  const editToken = character?.edit_token;
  const hasLinks = !!viewToken && !!editToken;

  const viewUrl = viewToken ? `${window.location.origin}/shared/${viewToken}` : "";
  const editUrl = editToken
    ? `${window.location.origin}/character/${character.id}?share=${editToken}`
    : "";

  const handleEnable = async () => {
    setLoading(true);
    const patch = {};
    if (!viewToken) patch.share_token = generateToken();
    if (!editToken) patch.edit_token = generateToken();
    await base44.entities.Character.update(character.id, patch);
    if (patch.share_token) onUpdate("share_token", patch.share_token);
    if (patch.edit_token) onUpdate("edit_token", patch.edit_token);
    setLoading(false);
    toast.success("Links gerados!");
  };

  const handleDisable = async () => {
    setLoading(true);
    await base44.entities.Character.update(character.id, { share_token: "", edit_token: "" });
    onUpdate("share_token", "");
    onUpdate("edit_token", "");
    setLoading(false);
    toast.success("Compartilhamento desativado.");
  };

  const handleCopy = (url, key, message) => {
    if (!url) return;
    navigator.clipboard.writeText(url);
    setCopied(key);
    toast.success(message);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-cinzel flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" />
            Compartilhar Ficha
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {!hasLinks ? (
            <div className="text-center space-y-3 py-4">
              <p className="text-sm text-muted-foreground">
                Gere os links para compartilhar: um de visualização (somente leitura) e um de edição.
              </p>
              <Button onClick={handleEnable} disabled={loading} className="bg-primary text-primary-foreground">
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2 className="w-4 h-4 mr-2" />}
                Gerar Links
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-primary" /> Visualizar (somente leitura)
                </p>
                <div className="flex gap-2">
                  <Input value={viewUrl} readOnly className="bg-background text-xs" />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopy(viewUrl, "view", "Link de visualização copiado!")}
                    className="flex-shrink-0"
                  >
                    {copied === "view" ? <CheckCheck className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="text-xs font-medium text-foreground flex items-center gap-1">
                  <Pencil className="w-3.5 h-3.5 text-primary" /> Editar
                </p>
                <div className="flex gap-2">
                  <Input value={editUrl} readOnly className="bg-background text-xs" />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => handleCopy(editUrl, "edit", "Link de edição copiado!")}
                    className="flex-shrink-0"
                  >
                    {copied === "edit" ? <CheckCheck className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  Quem abrir o link de edição (com login no app) pode alterar esta ficha.
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleDisable}
                disabled={loading}
                className="text-destructive hover:text-destructive w-full"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Trash2 className="w-3 h-3 mr-2" />}
                Desativar compartilhamento
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}