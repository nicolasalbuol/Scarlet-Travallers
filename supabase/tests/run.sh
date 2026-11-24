#!/usr/bin/env bash
# Testes de segurança das regras do banco num Postgres LOCAL (nunca no Supabase de verdade).
# Uso: bash supabase/tests/run.sh   (precisa de um Postgres 16 local rodando, usuário postgres)
set -e
cd "$(dirname "$0")"
psql -q -U postgres -f stub.sql >/dev/null
psql -q -U postgres -d t -f ../schema.sql -f ../audit_log.sql >/dev/null 2>&1
psql -q -U postgres -d t -f seed.sql
echo "== ataques (todos devem falhar)";  psql -q -U postgres -d t -f attack.sql
echo "== contornos (todos devem falhar)"; psql -q -U postgres -d t -c "delete from rate_events" -f attack2.sql
