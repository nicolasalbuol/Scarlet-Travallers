import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/api/supabase";
import Sigil from "@/components/fx/Sigil";
import ScarletField from "@/components/fx/ScarletField";
import ScrambleText from "@/components/fx/ScrambleText";

const MSG = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Confirme seu e-mail pelo link que enviamos antes de entrar.",
  "User already registered": "Esse e-mail já tem conta. Use Entrar.",
};

export default function Login() {
  const [mode, setMode] = useState("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name }, emailRedirectTo: window.location.origin },
        });
        if (error) throw error;
        if (!data.session) toast.success("Conta criada! Confira seu e-mail para confirmar o cadastro.");
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + "/profile" });
        if (error) throw error;
        toast.success("Enviamos um link para redefinir a senha.");
        setMode("signin");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = "/";
      }
    } catch (err) {
      toast.error(MSG[err.message] || err.message || "Algo deu errado.");
    } finally {
      setBusy(false);
    }
  };

  const titles = { signin: "Entrar", signup: "Criar conta", reset: "Recuperar senha" };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 py-10 st-grain">
      <ScarletField />
      <div className="relative z-10 w-full max-w-sm">
        <div className="flex justify-center -mb-16">
          <Sigil size={170} />
        </div>
        <div className="st-panel st-live-border pt-20 pb-7 px-7">
          <div className="text-center">
            <ScrambleText text="SCARLET" className="block font-cinzel font-black tracking-[0.18em] text-3xl text-scarlet-gradient" />
            <span className="block font-display italic text-2xl text-foreground/90 -mt-1">Travellers</span>
          </div>

          <div className="flex rounded-lg border border-border p-1 mt-6 bg-background/60">
            {["signin", "signup"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`relative flex-1 py-1.5 text-xs rounded-md transition-colors ${mode === m ? "text-primary-foreground" : "text-muted-foreground"}`}
              >
                {mode === m && <motion.span layoutId="st-login-tab" className="absolute inset-0 rounded-md bg-primary" />}
                <span className="relative">{titles[m]}</span>
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-5 space-y-3">
            <AnimatePresence initial={false}>
              {mode === "signup" && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="relative overflow-hidden">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome no servidor" className="pl-10 h-11 bg-background" required />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" className="pl-10 h-11 bg-background" required autoComplete="email" />
            </div>
            {mode !== "reset" && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha (mín. 6 caracteres)"
                  className="pl-10 h-11 bg-background"
                  required
                  minLength={6}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                />
              </div>
            )}
            <Button type="submit" disabled={busy} className="w-full h-11 font-cinzel tracking-[0.25em] bg-primary hover:bg-primary/90">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : titles[mode].toUpperCase()}
            </Button>
          </form>

          <button
            type="button"
            onClick={() => setMode(mode === "reset" ? "signin" : "reset")}
            className="w-full mt-4 text-xs text-muted-foreground hover:text-primary transition-colors"
          >
            {mode === "reset" ? "Voltar para entrar" : "Esqueci minha senha"}
          </button>
        </div>
      </div>
    </div>
  );
}
