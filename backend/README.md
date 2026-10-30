# Backend K.G.J.

API REST em Node.js + Express com PostgreSQL. O frontend existente permanece na raiz do projeto; o backend fica isolado em `backend/`.

## Requisitos

- Node.js 22 ou superior
- PostgreSQL 14 ou superior

## Configuração local

1. Crie um banco PostgreSQL e um usuário para a aplicação.
2. Copie `.env.example` para `.env` e configure `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USER` e `DATABASE_PASSWORD`. O arquivo `.env` é local e ignorado pelo Git.
3. No diretório `backend`, execute `npm install`, `npm run db:check`, `npm run db:migrate`, `npm run db:seed` e `npm run dev`.
4. Sirva os arquivos da raiz com uma extensão local como Live Server. O cliente usa `http://localhost:3000/api` quando está em localhost; outras implantações podem definir `window.KGJ_API_BASE` antes de `js/api.js` ou usar `/api` no mesmo domínio.
5. Confira `GET http://localhost:3000/api/health`.

As migrações são aplicadas uma vez e registradas em `schema_migrations`. A carga inicial importa os jogos estáticos atuais, inclusive os títulos adicionais de `js/jogos-adicionais.js`; executar novamente atualiza esses registros pelo slug.

## Rotas iniciais

- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- `GET /api/users/me`
- `GET /api/games?q=&category=&status=&featured=`; `GET /api/games/:slug`
- `GET /api/games/featured`, `/api/games/recent`, `/api/games/upcoming`
- `GET /api/categories`
- `GET /api/library`, `POST /api/library/:slug`
- `GET /api/wishlist`, `POST /api/wishlist/:slug`, `DELETE /api/wishlist/:slug`
- `GET /api/games/:slug/reviews`, `POST /api/games/:slug/reviews`
- `POST /api/contact`

Os endpoints de biblioteca, lista de desejos, perfil e avaliação exigem sessão. Senhas são armazenadas com Argon2id; a sessão é um token aleatório em cookie `HttpOnly`, com o hash do token no banco. A biblioteca só aceita jogos gratuitos ou com compra marcada como paga. O modelo de compra está no banco; pagamentos ainda não são processados.

## Organização

- `src/routes`: mapeamento de endpoints
- `src/controllers`: camada HTTP
- `src/services`: regras da aplicação
- `src/models`: consultas PostgreSQL parametrizadas
- `src/middleware` e `src/validation`: autenticação, autorização e validação
- `src/db/migrations`: schema versionado
- `scripts/seed-games.js`: importação dos dados estáticos existentes

Configure `FRONTEND_ORIGINS` com a origem exata que hospeda o frontend. Em produção, use HTTPS e `DATABASE_SSL=true` quando o provedor de banco exigir TLS. A API não serve os arquivos estáticos do repositório.

`npm run db:check` testa a conexão com o PostgreSQL executando `SELECT 1`.
