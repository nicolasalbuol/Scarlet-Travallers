import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Shield, BookOpen, ArrowLeft, ScrollText, Search, User, Wand2, Loader2, Flag, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import BookAdminPanel from "@/components/books/BookAdminPanel";
import BuilderAdminPanel from "@/components/admin/BuilderAdminPanel";
import CampanhaAdminPanel from "@/components/admin/CampanhaAdminPanel";

export default function Admin() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("book");
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isLoadingAuth } = useAuth();
  const isAdmin = user?.role === "admin";

  // Usuário comum não acessa o ADM: volta para a área pública com aviso
  React.useEffect(() => {
    if (!isLoadingAuth && user && !isAdmin) {
      toast.error("Acesso restrito");
      const timer = setTimeout(() => navigate("/", { replace: true }), 1600);
      return () => clearTimeout(timer);
    }
  }, [isLoadingAuth, user, isAdmin, navigate]);

  const { data: books = [] } = useQuery({
    queryKey: ["books"],
    queryFn: () => base44.entities.Book.list("order", 100),
    enabled: isAdmin,
  });

  const { data: allCharacters, isLoading: loadingChars } = useQuery({
    queryKey: ["allCharacters"],
    queryFn: () => base44.entities.Character.list("-updated_date", 200),
    initialData: [],
    enabled: isAdmin,
  });

  const { data: campaigns = [] } = useQuery({
    queryKey: ["campaigns"],
    queryFn: () => base44.entities.Campanha.list("order", 100),
    initialData: [],
    enabled: isAdmin,
  });

  const filteredCharacters = allCharacters.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.created_by?.toLowerCase().includes(q) ||
      c.race?.toLowerCase().includes(q) ||
      c.char_class?.toLowerCase().includes(q)
    );
  });

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm text-center">
          <Lock className="w-12 h-12 text-primary mx-auto mb-3" />
          <h1 className="font-cinzel text-xl font-bold text-foreground mb-1">Acesso restrito</h1>
          <p className="text-sm text-muted-foreground mb-5">
            Esta área é exclusiva dos administradores. Redirecionando para a área pública...
          </p>
          <Button
            className="w-full bg-primary text-primary-foreground"
            onClick={() => navigate("/", { replace: true })}
          >
            Ir para o início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary" />
          <h1 className="font-cinzel text-2xl font-bold text-foreground">Painel Admin</h1>
        </div>
        <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="text-muted-foreground">
          <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <Button
          variant={activeTab === "book" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("book")}
          className={activeTab === "book" ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"}
        >
          <BookOpen className="w-4 h-4 mr-1" /> Biblioteca ({books.length})
        </Button>
        <Button
          variant={activeTab === "characters" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("characters")}
          className={activeTab === "characters" ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"}
        >
          <ScrollText className="w-4 h-4 mr-1" /> Fichas ({allCharacters.length})
        </Button>
        <Button
          variant={activeTab === "builder" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("builder")}
          className={activeTab === "builder" ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"}
        >
          <Wand2 className="w-4 h-4 mr-1" /> Construção
        </Button>
        <Button
          variant={activeTab === "campanha" ? "default" : "outline"}
          size="sm"
          onClick={() => setActiveTab("campanha")}
          className={activeTab === "campanha" ? "bg-primary text-primary-foreground" : "border-border text-muted-foreground"}
        >
          <Flag className="w-4 h-4 mr-1" /> Campanhas ({campaigns.length})
        </Button>
      </div>

      {/* Books admin */}
      {activeTab === "book" && (
        <div className="bg-card border border-border rounded-xl p-6">
          <BookAdminPanel books={books} />
        </div>
      )}

      {/* Builder content editor */}
      {activeTab === "builder" && (
        <div className="bg-card border border-border rounded-xl p-6">
          <BuilderAdminPanel />
        </div>
      )}

      {/* Campanhas */}
      {activeTab === "campanha" && (
        <div className="bg-card border border-border rounded-xl p-6">
          <CampanhaAdminPanel campaigns={campaigns} />
        </div>
      )}

      {/* All Characters */}
      {activeTab === "characters" && (
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nome, usuário, raça, classe..."
              className="pl-10 bg-background"
            />
          </div>

          {loadingChars ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-16 rounded-xl" />)}
            </div>
          ) : filteredCharacters.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ScrollText className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>Nenhuma ficha encontrada.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredCharacters.map((char) => (
                <Link
                  key={char.id}
                  to={`/character/${char.id}`}
                  className="flex items-center gap-4 bg-card border border-border rounded-xl p-4 hover:border-primary/40 transition-colors"
                >
                  {char.lore_image ? (
                    <img src={char.lore_image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                      <ScrollText className="w-5 h-5 text-muted-foreground" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-cinzel font-semibold text-foreground truncate">{char.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {[char.race, char.char_class, char.origin].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                      <User className="w-3 h-3" />
                      {char.created_by?.split("@")[0]}
                    </p>
                    <p className="text-xs text-primary font-medium">Nível {char.level || 1}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}