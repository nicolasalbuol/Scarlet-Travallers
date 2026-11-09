/**
 * Camada de compatibilidade: o site foi escrito para o SDK do Base44.
 * Este arquivo expõe a MESMA interface (`base44.entities.X.filter/list/...`,
 * `base44.auth`, `base44.integrations.Core`), mas tudo roda no Supabase.
 *
 * Todas as entidades ficam numa tabela `records` (entity + data jsonb).
 * Quem pode ler/gravar o quê é decidido no banco pelas regras (RLS) do
 * arquivo supabase/schema.sql — não aqui.
 */
import { supabase } from "@/api/supabase";

const META = ["id", "created_by", "created_date", "updated_date"];
const COLUMNS = new Set(META);

const flatten = (row) =>
  row
    ? {
        ...(row.data || {}),
        id: row.id,
        created_by: row.created_by,
        created_date: row.created_date,
        updated_date: row.updated_date,
      }
    : null;

const stripMeta = (obj = {}) => {
  const out = { ...obj };
  META.forEach((k) => delete out[k]);
  return out;
};

const fail = (error) => {
  console.error("[supabase]", error);
  const e = new Error(error.message || "Erro no servidor");
  e.status = error.status || error.code;
  throw e;
};

function applySort(q, sort) {
  if (!sort) return q.order("created_date", { ascending: false });
  const desc = sort.startsWith("-");
  const field = desc ? sort.slice(1) : sort;
  const col = COLUMNS.has(field) ? field : `data->${field}`;
  return q.order(col, { ascending: !desc, nullsFirst: false });
}

async function currentEmail() {
  const { data } = await supabase.auth.getUser();
  return data?.user?.email || null;
}

function entity(name) {
  const base = () => supabase.from("records").select("*").eq("entity", name);

  return {
    async list(sort, limit) {
      let q = applySort(base(), sort);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) fail(error);
      return (data || []).map(flatten);
    },

    async filter(query = {}, sort, limit) {
      // Link público de ficha: busca pelo token sem precisar ser o dono.
      if (name === "Character" && query.share_token && Object.keys(query).length === 1) {
        const { data, error } = await supabase.rpc("character_by_token", { p_token: query.share_token });
        if (error) fail(error);
        return (data || []).map(flatten);
      }
      let q = base();
      const json = {};
      for (const [k, v] of Object.entries(query)) {
        if (v === undefined) continue;
        if (COLUMNS.has(k)) q = q.eq(k, v);
        else json[k] = v;
      }
      if (Object.keys(json).length) q = q.contains("data", json);
      q = applySort(q, sort);
      if (limit) q = q.limit(limit);
      const { data, error } = await q;
      if (error) fail(error);
      return (data || []).map(flatten);
    },

    async get(id) {
      const { data, error } = await base().eq("id", id).maybeSingle();
      if (error) fail(error);
      return flatten(data);
    },

    async create(payload) {
      const email = await currentEmail();
      const { data, error } = await supabase
        .from("records")
        .insert({ entity: name, data: stripMeta(payload), created_by: email })
        .select()
        .single();
      if (error) fail(error);
      return flatten(data);
    },

    async update(id, patch) {
      // Mescla os campos (como o Base44 fazia), sem apagar os outros.
      const { data, error } = await supabase.rpc("merge_record", { p_id: id, p_patch: stripMeta(patch) });
      if (error) fail(error);
      return flatten(Array.isArray(data) ? data[0] : data);
    },

    async delete(id) {
      const { error } = await supabase.from("records").delete().eq("id", id);
      if (error) fail(error);
    },
  };
}

async function me() {
  const { data } = await supabase.auth.getUser();
  const u = data?.user;
  if (!u) {
    const e = new Error("Não autenticado");
    e.status = 401;
    throw e;
  }
  const { data: profile } = await supabase.from("profiles").select("full_name, role").eq("id", u.id).maybeSingle();
  return {
    id: u.id,
    email: u.email,
    full_name: profile?.full_name || u.user_metadata?.full_name || u.email.split("@")[0],
    role: profile?.role || "user",
  };
}

async function upload(bucket, file) {
  const ext = (file.name || "arquivo").split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: false });
  if (error) fail(error);
  return path;
}

export const base44 = {
  entities: new Proxy({}, { get: (_, name) => entity(String(name)) }),

  auth: {
    me,
    async isAuthenticated() {
      const { data } = await supabase.auth.getSession();
      return !!data?.session;
    },
    async logout() {
      await supabase.auth.signOut();
      window.location.href = "/";
    },
    redirectToLogin() {
      window.location.href = "/login";
    },
  },

  // Edição de ficha por link compartilhado (?share=token).
  shared: {
    async getForEdit(id, token) {
      const { data, error } = await supabase.rpc("character_for_edit", { p_id: id, p_token: token });
      if (error) fail(error);
      return (data || []).map(flatten)[0] || null;
    },
    async updateWithToken(id, token, patch) {
      const { error } = await supabase.rpc("update_character_with_token", { p_id: id, p_token: token, p_patch: stripMeta(patch) });
      if (error) fail(error);
    },
  },

  integrations: {
    Core: {
      async UploadFile({ file }) {
        const path = await upload("uploads", file);
        return { file_url: supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl };
      },
      async UploadPublicFile({ file }) {
        const path = await upload("uploads", file);
        return { file_url: supabase.storage.from("uploads").getPublicUrl(path).data.publicUrl };
      },
      async UploadPrivateFile({ file }) {
        const path = await upload("private", file);
        return { file_uri: path };
      },
      async CreateFileSignedUrl({ file_uri, expires_in = 3600 }) {
        const { data, error } = await supabase.storage.from("private").createSignedUrl(file_uri, expires_in);
        if (error) fail(error);
        return { signed_url: data.signedUrl };
      },
      async SendEmail() {
        // Envio de e-mail não existe nesta versão (era usado só pelo código de 2 etapas do ADM).
        return { ok: false };
      },
    },
  },
};
