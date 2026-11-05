// Senha única do ADM e da Área do Mestre.
export const ADMIN_PASSWORD = "0260020310200762";

const KEY = "st-master-unlocked";

export function isMasterUnlocked() {
  try {
    return sessionStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setMasterUnlocked(value) {
  try {
    if (value) sessionStorage.setItem(KEY, "1");
    else sessionStorage.removeItem(KEY);
  } catch {
    /* navegador sem storage: o desbloqueio vale só enquanto a página estiver aberta */
  }
}
