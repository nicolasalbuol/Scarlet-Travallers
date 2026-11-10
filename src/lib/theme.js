import { useSyncExternalStore } from "react";

// Tema claro/escuro: fica salvo no navegador e muda a classe "dark" do <html>.
const KEY = "st-theme";
const listeners = new Set();

export function getTheme() {
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

export function setTheme(theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
  try {
    localStorage.setItem(KEY, theme);
  } catch {}
  listeners.forEach((fn) => fn());
}

export const toggleTheme = () => setTheme(getTheme() === "dark" ? "light" : "dark");

export function useTheme() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getTheme
  );
}
