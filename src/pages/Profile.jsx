import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { User, LogOut, ScrollText, Moon, Sun, Globe, Shield, Camera, Loader2, Trash2, Pencil, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { useTheme, setTheme } from "@/lib/theme";

export default function Profile() {
  const [user, setUser] = useState(null);
  const darkMode = useTheme() === "dark";
  const setDarkMode = (on) => setTheme(on ? "dark" : "light");
  const [language, setLanguage] = useState("pt-BR");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: characters } = useQuery({
    queryKey: ["characters"],
    queryFn: () => base44.entities.Character.list(),
    initialData: [],
  });

  const [uploading, setUploading] = useState(false);
  const changeAvatar = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Escolha uma imagem.");
    if (file.size > 5 * 1024 * 1024) return toast.error("A imagem precisa ter até 5 MB.");
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      await base44.auth.setAvatar(file_url);
      setUser((u) => ({ ...u, avatar_url: file_url }));
      toast.success("Foto de perfil atualizada!");
    } catch (err) {
      toast.error(err.message || "Não foi possível enviar a foto.");
    }
    setUploading(false);
  };
  const removeAvatar = async () => {
    await base44.auth.setAvatar("");
    setUser(await base44.auth.me());
  };

  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const saveName = async () => {
    const name = nameDraft.trim().slice(0, 40);
    if (!name) return toast.error("Digite um nome.");
    try {
      await base44.auth.setDisplayName(name);
      setUser((u) => ({ ...u, full_name: name }));
      setEditingName(false);
      toast.success("Nome atualizado!");
    } catch (err) {
      toast.error(err.message || "Não foi possível salvar o nome.");
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  return (
    <div className="p-4 lg:p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <User className="w-6 h-6 text-primary" />
        <h1 className="font-cinzel text-2xl font-bold text-foreground">Perfil</h1>
      </div>

      {/* User info */}
      <div className="bg-card border border-border rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <label className="relative w-20 h-20 rounded-full bg-primary/10 ring-2 ring-primary/40 flex items-center justify-center overflow-hidden cursor-pointer group" title="Trocar foto">
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="Foto de perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="w-9 h-9 text-primary" />
              )}
              <span className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {uploading ? <Loader2 className="w-5 h-5 text-white animate-spin" /> : <Camera className="w-5 h-5 text-white" />}
              </span>
              <input type="file" accept="image/*" className="sr-only" onChange={changeAvatar} disabled={uploading} />
            </label>
            <span className="text-[10px] text-muted-foreground">{uploading ? "Enviando..." : "Toque para trocar"}</span>
            {user?.avatar_url && !uploading && (
              <button onClick={removeAvatar} className="text-[10px] text-muted-foreground hover:text-destructive flex items-center gap-1">
                <Trash2 className="w-3 h-3" /> remover
              </button>
            )}
          </div>
          <div>
            {editingName ? (
              <div className="flex items-center gap-1">
                <input
                  autoFocus
                  value={nameDraft}
                  maxLength={40}
                  onChange={(e) => setNameDraft(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setEditingName(false); }}
                  className="h-9 w-full max-w-[220px] rounded-md border border-input bg-background px-2 text-sm"
                  aria-label="Nome de exibição"
                />
                <button onClick={saveName} className="p-2 text-primary" aria-label="Salvar nome"><Check className="w-4 h-4" /></button>
                <button onClick={() => setEditingName(false)} className="p-2 text-muted-foreground" aria-label="Cancelar"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <button
                onClick={() => { setNameDraft(user?.full_name || ""); setEditingName(true); }}
                className="group flex items-center gap-2 text-left"
                title="Mudar nome de exibição"
              >
                <h2 className="font-cinzel text-xl font-semibold text-foreground">{user?.full_name || "Viajante"}</h2>
                <Pencil className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
              </button>
            )}
            <p className="text-sm text-muted-foreground">{user?.email || ""}</p>
            <div className="flex gap-2 mt-2">
              <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                <ScrollText className="w-3 h-3 mr-1" />
                {characters.length} fichas
              </Badge>
              {user?.role === "admin" && (
                <Badge className="bg-primary/10 text-primary text-xs">Admin</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Settings */}
      <div className="bg-card border border-border rounded-xl divide-y divide-border">
        {/* Dark mode */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-primary" /> : <Sun className="w-5 h-5 text-yellow-500" />}
            <div>
              <Label className="text-sm font-medium">Modo Escuro</Label>
              <p className="text-xs text-muted-foreground">Alternar entre claro e escuro</p>
            </div>
          </div>
          <Switch checked={darkMode} onCheckedChange={setDarkMode} />
        </div>

        {/* Language */}
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-primary" />
            <div>
              <Label className="text-sm font-medium">Idioma</Label>
              <p className="text-xs text-muted-foreground">Língua do sistema</p>
            </div>
          </div>
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-40 bg-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
              <SelectItem value="en">English</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Admin */}
        <Link to="/admin" className="block">
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-primary" />
              <div>
                <Label className="text-sm font-medium">Área Administrativa</Label>
                <p className="text-xs text-muted-foreground">Gerenciar livro e configurações</p>
              </div>
            </div>
          </div>
        </Link>

        <Separator />

        {/* Logout */}
        <div className="p-4">
          <Button variant="outline" onClick={handleLogout} className="w-full text-destructive border-destructive/30 hover:bg-destructive/5">
            <LogOut className="w-4 h-4 mr-2" />
            Sair da Conta
          </Button>
        </div>
      </div>

      {/* Credits */}
      <div className="text-center mt-8 text-xs text-muted-foreground/50">
        <p>Scarlet Travellers</p>
        <p>Sistema criado por Izumi Yoshikawa</p>
      </div>
    </div>
  );
}