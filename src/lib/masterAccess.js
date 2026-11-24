// Senha da Área do Mestre. Só o resumo (SHA-256) fica no site, nunca a senha.
// Isto é só uma trava de tela: quem decide o que cada conta vê são as regras do banco (RLS).
// Para trocar a senha: rode no navegador
//   crypto.subtle.digest("SHA-256", new TextEncoder().encode("scarlet-travellers:" + "NOVA_SENHA"))
// e cole o resultado em hexadecimal abaixo.
const MASTER_PASSWORD_SHA256 = "9793d15305bf6199746b228de4619d5cac1947a368eb86c8a13e8c8de295e276";

export async function checkMasterPassword(password) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("scarlet-travellers:" + (password || "")));
  const hex = [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
  return hex === MASTER_PASSWORD_SHA256;
}

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
