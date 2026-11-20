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

// Cor-tema (paleta): muda o atributo data-palette do <html>; as cores do index.css seguem.
export const PALETTES = [
  { id: "jade", name: "Jade", h: 161 },
  { id: "esmeralda", name: "Esmeralda", h: 140 },
  { id: "turquesa", name: "Turquesa", h: 178 },
  { id: "oceano", name: "Oceano", h: 200 },
  { id: "musgo", name: "Musgo", h: 95 },
  { id: "cobre", name: "Cobre", h: 22 },
  { id: "ametista", name: "Ametista", h: 268 },
];
const PKEY = "st-palette";

export const getPalette = () => document.documentElement.dataset.palette || "jade";

export function setPalette(id) {
  if (id === "jade") delete document.documentElement.dataset.palette;
  else document.documentElement.dataset.palette = id;
  try {
    localStorage.setItem(PKEY, id);
  } catch {}
  listeners.forEach((fn) => fn());
}

export function usePalette() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    getPalette
  );
}
