import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { User, LogOut, ScrollText, Moon, Sun, Globe, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState("pt-BR");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const { data: characters } = useQuery({
    queryKey: ["characters"],
    queryFn: () => base44.entities.Character.list(),
    initialData: [],
  });

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
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="font-cinzel text-xl font-semibold text-foreground">
              {user?.full_name || "Viajante"}
            </h2>
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