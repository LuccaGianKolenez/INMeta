## Decisões de Arquitetura (resumo)
- **Camadas**: Controller → Service → Repository → DB (`pg`).
- **Vínculo+status**: `employee_documents` concentra vínculo e estado (`PENDING`/`SENT`).
- **Validação**: Zod nos inputs (middlewares).
- **ESM NodeNext**: imports relativos **com `.js`** no código TS; Jest mapeia `.js` → `.ts`.
- **Migrations**: arquivos `.sql` com tabela `schema_migrations` e script simples `npm run migrate`.

## Troubleshooting
- **Import .js em TS**: com `moduleResolution: NodeNext`, use `./algo.js` nos imports relativos. VSCode para de reclamar e Node resolve após transpilar.
- **Jest “Cannot use import statement outside a module”**: testes rodam com `ts-jest` em CommonJS usando `tsconfig.jest.json` + `moduleNameMapper` para `'.js'`.
- **Postgres local**: se usar Homebrew no macOS (Apple Silicon), adicione ao PATH:
