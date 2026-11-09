import React, { useState } from "react";
import { Lock, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/api/supabase";
import { useAuth } from "@/lib/AuthContext";

/** Aparece quando a pessoa abre o link de "Esqueci minha senha". */
export default function NewPassword() {
  const { finishRecovery } = useAuth();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("Senha alterada!");
    finishRecovery();
    window.location.replace("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form onSubmit={submit} className="st-panel w-full max-w-sm p-7 space-y-4">
        <h1 className="font-cinzel text-xl font-bold text-foreground text-center">Nova senha</h1>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nova senha" className="pl-10 h-11 bg-background" autoFocus />
        </div>
        <Button type="submit" disabled={busy} className="w-full h-11 bg-primary">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Salvar senha"}
        </Button>
      </form>
    </div>
  );
}
