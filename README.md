# INMeta – API de Documentação de Colaboradores

API RESTful para **controle de documentação obrigatória** de colaboradores:

## Stack
- **Node.js 20+, TypeScript (ESM/NodeNext)**
- **Express**
- **PostgreSQL** (driver `pg`)
- **Zod** (validação)
- **Jest + Supertest** (testes)
- **Swagger UI** (docs interativas em `/docs`)

---

## Requisitos
- Node.js 20+
- PostgreSQL 14+

---

## Setup

```bash
# 1) dependências
npm i

# 2) configure variáveis
cp .env.example .env
# edite .env se necessário (DB_HOST, DB_USER, DB_PASS, DB_NAME, PORT)

# 3) crie o banco (se necessário)
createdb inmeta

# 4) rode as migrations
npm run migrate

# 5) suba a API
npm run dev
