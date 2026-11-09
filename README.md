# Scarlet Travellers

Site de fichas, campanhas e livros do sistema **Scarlet Travellers**.
Hospedagem: **Vercel** (site) + **Supabase** (contas, fichas e arquivos). Ambos têm plano grátis.

---

## Passo 1 — Supabase (banco de dados e contas)

1. Crie uma conta em https://supabase.com e clique em **New project**.
   Dê um nome (ex.: `scarlet-travellers`), crie uma senha do banco (guarde) e escolha a região **South America (São Paulo)**.
2. Quando o projeto terminar de criar, abra **SQL Editor → New query**, cole o conteúdo inteiro de
   [`supabase/schema.sql`](supabase/schema.sql) e clique em **Run**. Deve aparecer "Success".
3. Vá em **Project Settings → API** e copie:
   - **Project URL** (algo como `https://abcd1234.supabase.co`)
   - **anon public key** (uma chave longa que começa com `eyJ...`)
4. (Recomendado) Em **Authentication → URL Configuration**, preencha **Site URL** com o endereço do
   site no Vercel quando ele existir (Passo 3). Assim os e-mails de confirmação levam para o lugar certo.
5. (Opcional) Se não quiser que os jogadores precisem confirmar o e-mail, desligue
   **Authentication → Providers → Email → Confirm email**.

## Passo 2 — GitHub (onde o código fica)

1. Crie uma conta em https://github.com e um repositório novo (pode ser privado), ex.: `scarlet-travellers`.
2. Envie os arquivos desta pasta para ele (botão **Add file → Upload files**, arrastando as pastas).
   O GitHub aceita até 100 arquivos por envio, então mande em duas levas se precisar
   (ex.: primeiro a pasta `src/components`, depois o resto).

## Passo 3 — Vercel (coloca o site no ar)

1. Crie uma conta em https://vercel.com entrando **com o GitHub**.
2. **Add New → Project** → escolha o repositório `scarlet-travellers` → **Import**.
3. O Vercel detecta "Vite" sozinho. Abra **Environment Variables** e adicione:
   - `VITE_SUPABASE_URL` = a Project URL do Passo 1
   - `VITE_SUPABASE_ANON_KEY` = a anon public key do Passo 1
4. Clique em **Deploy**. Em 1–2 minutos o site estará em `https://scarlet-travellers-xxxx.vercel.app`.

## Passo 4 — Virar Mestre (ADM)

1. Abra o site, clique em **Criar conta** e cadastre-se.
2. No Supabase, **SQL Editor**, rode (com o seu e-mail):

   ```sql
   update public.profiles set role = 'admin' where email = 'seu-email@exemplo.com';
   ```
3. Saia e entre de novo no site. Agora aparece o menu **ADM** e a **Área do Mestre** mostra todas as fichas
   (a senha da Área do Mestre é a mesma do Painel ADM, definida em `src/lib/masterAccess.js`).

---

## Quem vê o quê (garantido pelo banco)

| | Jogador | Mestre da campanha | ADM |
|---|---|---|---|
| Próprias fichas | ver e editar | ver e editar | ver e editar |
| Fichas dos outros | não vê | vê e edita as da campanha dele | vê e edita todas |
| Campanhas | vê, cria, entra por código | edita a dele | tudo |
| Livros e conteúdo do construtor | vê | vê | cria e edita |

Os links públicos de ficha (`/shared/...`) continuam funcionando sem login.

## Rodar no computador (opcional)

```bash
npm install
cp .env.example .env.local   # e preencha as duas variáveis
npm run dev
```
