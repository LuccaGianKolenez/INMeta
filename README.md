# INMETA – API de Documentação de Colaboradores (Express + TypeScript + PostgreSQL)

API REST para **gerenciamento de documentação obrigatória** de colaboradores, com:

- Validação robusta usando **Zod**
- Estrutura em camadas (Controller → Service → Repository → DB)
- **PostgreSQL** como banco de dados
- **Testes automatizados** com Jest + Supertest
- Tratamento centralizado de erros
- Scripts simples para **migrations**

---

## Stack

- **Node.js** 20+
- **Express** (ESM + TypeScript)
- **PostgreSQL** (`pg`)
- **Zod** (validação de entrada)
- **Jest + Supertest** (testes)
- **TS-Node / Nodemon** (desenvolvimento)
- **ESLint + Prettier** (padronização de código)

---

## Estrutura do Projeto

```text
src/
├── app.ts                  # Inicialização do Express
├── server.ts               # Ponto de entrada
├── routes.ts               # Definição de rotas
├── db/                     # Configuração e migrations
│   ├── migrate.ts
│   └── schema.sql
├── modules/
│   ├── employees/          # CRUD e vinculação de documentos
│   ├── documentTypes/      # CRUD tipos de documentos
│   └── documents/          # Envio e listagem pendente
└── middlewares/            # Logger, validação, erros
tests/
├── employees.e2e.test.ts
└── documents.e2e.test.ts
```

## 1) Requisitos

- **Node.js** 20+
- **PostgreSQL** 14+ (porta padrão 5432)

**Instalação:**

```bash
# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Linux (Debian/Ubuntu)
sudo apt install postgresql

# Windows
# Baixe e instale a partir de:
# https://www.postgresql.org/download/

## 3) Configurar Banco de Dados

```bash
createdb inmeta
export DATABASE_URL="postgres://$(whoami)@localhost:5432/inmeta"
```

## 4) Executar Migrations

```bash
npm run migrate
```

Isso criará as tabelas:

- `employees`
- `document_types`
- `employee_documents`
- `schema_migrations`

## 5) Rodar a API

npm run dev
API disponível em: http://localhost:3000

## 6) Endpoints
**Base:** `/api`

| Método | Rota                                                       | Descrição                                              |
|-------:|------------------------------------------------------------|--------------------------------------------------------|
| GET    | `/health`                                                  | Health check                                           |
| GET    | `/readyz`                                                  | Readiness (ping ao DB)                                 |
| POST   | `/document-types`                                          | Criar tipo de documento                                |
| GET    | `/document-types`                                          | Listar tipos de documento                              |
| POST   | `/employees`                                               | Criar colaborador                                      |
| PUT    | `/employees/:id`                                           | Atualizar colaborador                                  |
| POST   | `/employees/:id/required-docs`                             | Vincular/Desvincular pendências (`add[]`/`remove[]`)   |
| GET    | `/employees/:id/status`                                    | Enviados vs. Pendentes do colaborador                  |
| POST   | `/employees/:id/documents`                                 | Enviar documento (muda `PENDING` → `SENT`)             |
| GET    | `/documents/pending?page=&pageSize=&employeeId=&documentTypeId=` | Lista pendentes + paginação (`X-Total-Count`)   |

## Regras de Negócio

- **Vinculação idempotente:** repetir `add`/`remove` não gera erro.
- **Envio:** exige vínculo prévio e só permite `PENDING` → `SENT`. Se tentar reenviar, retorna **409** (*Document already sent*).
- **Desvincular:** não remove itens já `SENT` (mantém histórico de envio).

---

## Padrão de Erro

```json
{
  "error": "Validation error",
  "code": "PG_UNIQUE_VIOLATION",
  "details": { ... }
}
```

**Códigos comuns**
- **400** — validação  
- **404** — não encontrado  
- **409** — conflito / already sent  
- **500** — interno  
- **503** — DB indisponível

### 7) Testes Automatizados

**Rodar todos os testes**
```bash
npm test
```

**Rodar em modo watch**
```bash
npm run test:watch
```

## 8) Logs

- **[API]** método, rota, status, duração, `requestId`
- **[DB]** consultas executadas e duração
- **[BODY]** corpo mascarado (ex.: CPF → `***.***.***-**`)
- Erros tratados no **middleware global**

## 9) Decisões de Arquitetura

- **Camadas:** Controller → Service → Repository → DB (`pg`)
- **Vínculo + status:** `employee_documents` mantém vínculo e estado (`PENDING`/`SENT`)
- **Validação:** Zod nos inputs (middlewares)
- **ESM / NodeNext:** imports relativos com `.js` no código TS; Jest mapeia `.js` → `.ts`
- **Migrations:** SQL puro + runner incremental:

```bash
npm run migrate
```

### 10) Troubleshooting

**Import `.js` em TypeScript**
- Com `moduleResolution: "NodeNext"`, use imports relativos com sufixo `.js`:
  ```ts
  import { algo } from "./arquivo.js";
  ```
- O VSCode para de acusar erro e o Node resolve após transpilar.

**Erro Jest “Cannot use import statement outside a module”**
- Testes rodam com **ts-jest** em CommonJS usando `tsconfig.jest.json` + `moduleNameMapper` para `.js`.

**Postgres no macOS (Apple Silicon)**
```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

## 11) Postman

**Arquivo:** `inmeta.postman_collection.json`

**Passos:**
1. Importar a coleção.
2. Definir `baseUrl` = `http://localhost:3000/api`.
3. Rodar as requests (exemplos já preenchidos).

## 12) Segurança (produção)

- **helmet**, **cors** (origens via `.env`), **express-rate-limit**
- `requestId` e **máscara de PII** nos logs
- **Graceful shutdown** (`SIGTERM`/`SIGINT`) fecha HTTP e pool do DB
