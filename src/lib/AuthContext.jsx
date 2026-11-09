import React, { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/api/supabase";
import { base44 } from "@/api/base44Client";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [recovering, setRecovering] = useState(false);

  const firstCheck = useRef(true);

  // Só mostra a tela de carregamento na primeira verificação; depois atualiza em silêncio
  // (o Supabase avisa SIGNED_IN de novo ao voltar para a aba).
  const checkUserAuth = useCallback(async () => {
    if (firstCheck.current) setIsLoadingAuth(true);
    try {
      const { data } = await supabase.auth.getSession();
      setUser(data?.session ? await base44.auth.me() : null);
    } catch {
      setUser(null);
    } finally {
      firstCheck.current = false;
      setIsLoadingAuth(false);
      setAuthChecked(true);
    }
  }, []);

  useEffect(() => {
    checkUserAuth();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecovering(true);
      // setTimeout: não chamar o Supabase de dentro deste callback (evita travamento).
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") setTimeout(checkUserAuth, 0);
    });
    return () => sub?.subscription?.unsubscribe();
  }, [checkUserAuth]);

  const logout = () => base44.auth.logout();
  const navigateToLogin = () => base44.auth.redirectToLogin();

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoadingAuth,
        isLoadingPublicSettings: false,
        authError: null,
        appPublicSettings: null,
        authChecked,
        logout,
        navigateToLogin,
        checkUserAuth,
        checkAppState: checkUserAuth,
        recovering,
        finishRecovery: () => setRecovering(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
