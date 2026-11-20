// Importa fichas exportadas do site antigo (Base44 → Dashboard → Data → Character → Export).
// Aceita o CSV do Base44 ou um JSON (lista de fichas).

const META = ["id", "created_by", "created_by_id", "created_date", "updated_date", "is_sample", "app_id"];

// CSV com aspas, vírgulas e quebras de linha dentro das células.
export function parseCSV(text) {
  const rows = [];
  let row = [], cell = "", quoted = false;
  const src = text.replace(/^﻿/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') { cell += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { row.push(cell); cell = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += ch;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows.filter((r) => r.some((c) => c.trim() !== ""));
  if (!head) return [];
  return body.map((r) => Object.fromEntries(head.map((h, i) => [h.trim(), r[i] ?? ""])));
}

// Células do CSV vêm como texto: volta objetos, listas, números e sim/não ao tipo certo.
function revive(v) {
  if (typeof v !== "string") return v;
  const t = v.trim();
  if (t === "") return undefined;
  if (/^[[{]/.test(t)) {
    try { return JSON.parse(t); } catch { return v; }
  }
  if (t === "true" || t === "false") return t === "true";
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  return v;
}

export function parseOldFile(text) {
  const t = text.trim();
  let rows;
  if (t.startsWith("[") || t.startsWith("{")) {
    const parsed = JSON.parse(t);
    rows = Array.isArray(parsed) ? parsed : parsed.records || parsed.data || [parsed];
  } else {
    rows = parseCSV(text);
  }
  return rows
    .map((r) => {
      const data = {};
      for (const [k, v] of Object.entries(r)) {
        if (META.includes(k)) continue;
        const val = revive(v);
        if (val !== undefined) data[k] = val;
      }
      if (r.id) data.imported_from_id = String(r.id);
      return { owner: String(r.created_by || "").trim().toLowerCase(), data };
    })
    .filter((x) => x.data.name || x.data.imported_from_id);
}
