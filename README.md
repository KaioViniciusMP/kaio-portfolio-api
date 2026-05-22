# kaio-portfolio-api

API de certificacoes para o portfolio do Kaio, implementada como um app Next minimo para deploy estavel no Vercel.

Por padrao, roda com fallback em memoria. Em producao no Vercel, ative persistencia real com Upstash Redis (variaveis abaixo).

## Endpoints

- GET /api/certifications
- POST /api/certifications
- DELETE /api/certifications

## Rodando local

npm install
npm run dev

API local em http://localhost:3001/api/certifications

## Variaveis de ambiente

- FRONTEND_ORIGIN: dominio do frontend permitido no CORS.
- UPSTASH_REDIS_REST_URL: URL REST do Upstash Redis (opcional, recomendado em producao).
- UPSTASH_REDIS_REST_TOKEN: token REST do Upstash Redis (opcional, recomendado em producao).

Se UPSTASH_* nao estiver configurado, a API usa dados em memoria com seeds iniciais.

## Deploy

O deploy no Vercel e automatico pelos workflows em .github/workflows.

## Segredos necessarios no GitHub

- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID
