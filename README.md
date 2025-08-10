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
Node.js 20+

PostgreSQL 14+ (porta padrão 5432)

Instalação:


# macOS (Homebrew)
brew install postgresql@16
brew services start postgresql@16

# Linux (Debian/Ubuntu)
sudo apt install postgresql

# Windows
# Baixe e instale:
# https://www.postgresql.org/download/
Verifique se está rodando:

psql -l


## 2) Clonar e instalar dependências

git clone <seu-repo>.git INMeta
cd INMeta
npm ci

## 3) Configurar Banco de Dados

createdb inmeta
export DATABASE_URL="postgres://$(whoami)@localhost:5432/inmeta"

## 4) Executar Migrations
npm run migrate
Isso criará as tabelas:
employees
document_types
employee_documents
schema_migrations

## 5) Rodar a API

npm run dev
API disponível em: http://localhost:3000

## 6) Endpoints
**Base URL:** `/api`

| Método | Rota                          | Descrição                                      |
|--------|--------------------------------|------------------------------------------------|
| GET    | `/health`                      | Health check                                   |
| POST   | `/document-types`              | Criar tipo de documento                        |
| GET    | `/document-types`              | Listar tipos de documentos                     |
| POST   | `/employees`                   | Criar colaborador                              |
| PUT    | `/employees/:id`               | Atualizar colaborador                          |
| POST   | `/employees/link-documents`    | Vincular documentos obrigatórios               |
| POST   | `/documents/send`              | Enviar documento                               |
| GET    | `/employees/:id/status`        | Status de documentos do colaborador            |
| GET    | `/documents/pending`           | Documentos pendentes (com paginação) 

### 7) Testes Automatizados

**Rodar todos os testes**
```bash
npm test
```

**Rodar em modo watch**
```bash
npm run test:watch
```

### 8) Logs

- **[DB]** consultas SQL  
- **[API]** requisições HTTP  
- **[BODY]** corpo da requisição  

> Erros tratados no **middleware** global

### 9) Decisões de Arquitetura

- **Camadas:** Controller → Service → Repository → DB (**pg**)
- **Vínculo + status:** `employee_documents` concentra vínculo e estado (`PENDING`/`SENT`)
- **Validação:** **Zod** nos inputs (middlewares)
- **ESM / NodeNext:** imports relativos com `.js` no código TS; **Jest** mapeia `.js` → `.ts`
- **Migrations:** arquivos `.sql` com tabela `schema_migrations` e script:
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

### 11) Coleção Postman

- **Arquivo:** `inmeta.postman_collection.json` incluído.

**Passos**
1. Abra o **Postman**.
2. Clique em **Import** e selecione `inmeta.postman_collection.json`.
3. Configure a variável **`baseUrl`** para `http://localhost:3000/api`.
4. Teste os endpoints.
