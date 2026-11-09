import React, { useState, useRef } from "react";
import { Shield, Lock, Mail, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { base44 } from "@/api/base44Client";
import { ADMIN_PASSWORD } from "@/lib/masterAccess";

const CODE_EXPIRY_MS = 10 * 60 * 1000;

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function AdminLogin({ onAuthenticated }) {
  const { user, navigateToLogin } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("password");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const sentCodeRef = useRef(null);
  const expiryRef = useRef(0);

  // Sem login não há e-mail registrado para enviar o código — exige login.
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
          <h1 className="font-cinzel text-xl font-bold text-foreground mb-1">Área Administrativa</h1>
          <p className="text-sm text-muted-foreground mb-6">Faça login para acessar a área administrativa.</p>
          <Button className="w-full bg-primary text-primary-foreground mb-2" onClick={navigateToLogin}>Entrar</Button>
          <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => navigate("/profile")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </Button>
        </div>
      </div>
    );
  }

  const sendCode = async () => {
    setSendingCode(true);
    try {
      const c = generateCode();
      sentCodeRef.current = c;
      expiryRef.current = Date.now() + CODE_EXPIRY_MS;
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: "Código de verificação — Scarlet Travellers",
        body: `Seu código de verificação para acessar a área administrativa é: ${c}\n\nEle expira em 10 minutos.`,
      });
      toast.success(`Código enviado para ${user.email}`);
    } finally {
      setSendingCode(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (password !== ADMIN_PASSWORD) {
      toast.error("Senha incorreta");
      return;
    }
    setPassword("");
    await sendCode();
    setStep("code");
  };

  const handleCodeSubmit = (e) => {
    e.preventDefault();
    setVerifying(true);
    if (Date.now() > expiryRef.current) {
      toast.error("O código expirou. Solicite um novo.");
      setVerifying(false);
      return;
    }
    if (code !== sentCodeRef.current) {
      toast.error("Código incorreto");
      setVerifying(false);
      return;
    }
    setCode("");
    setVerifying(false);
    onAuthenticated();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <Shield className="w-12 h-12 text-primary mx-auto mb-3" />
          <h1 className="font-cinzel text-xl font-bold text-foreground">Área Administrativa</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {step === "password" ? "Digite a senha de admin para acessar" : "Digite o código enviado por e-mail"}
          </p>
        </div>

        {step === "password" ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Senha de administrador"
                  className="pl-10 bg-background"
                  autoFocus
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={sendingCode}>
              {sendingCode ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Enviando código...</> : "Continuar"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
              <Mail className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">Código enviado para {user.email}</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Código de verificação</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="pl-10 bg-background tracking-widest text-center"
                  autoFocus
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground" disabled={verifying || code.length !== 6}>
              {verifying ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Verificando...</> : "Verificar e entrar"}
            </Button>
            <button type="button" onClick={sendCode} disabled={sendingCode} className="w-full text-xs text-primary hover:underline disabled:opacity-50">
              {sendingCode ? "Reenviando..." : "Reenviar código"}
            </button>
          </form>
        )}

        <Button variant="ghost" className="w-full mt-3 text-muted-foreground" onClick={() => navigate("/profile")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
      </div>
    </div>
  );
}