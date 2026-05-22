# kaio-portfolio-api

API de certificacoes para o portfolio do Kaio.

Observacao: no formato atual os dados ficam em memoria da funcao serverless. Para persistencia real em producao, conecte um banco (ex.: Neon, Supabase, PlanetScale, MongoDB Atlas).

## Endpoints

- GET /api/certifications
- POST /api/certifications
- DELETE /api/certifications

## Rodando local

npm install
npm run dev

API local em http://localhost:3001/api/certifications

## Deploy

O deploy no Vercel e automatico pelos workflows em .github/workflows.

## Segredos necessarios no GitHub

- VERCEL_TOKEN
- VERCEL_ORG_ID
- VERCEL_PROJECT_ID
