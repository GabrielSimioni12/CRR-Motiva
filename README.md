# SP-021 — Controle de Vegetação

Frontend do Challenge CCR Motiva (FIAP). Painel + mapa que priorizam a
roçada da SP-021 (Rodoanel Oeste) a partir de dados reais de campo
(retigráfico de 13/03 e 20/03/2026) e do modelo de priorização.

## Rodando localmente

```bash
npm install
npm run dev
```

Abre em `http://localhost:3000`. A primeira `npm run dev` / `npm run build`
precisa de internet pra baixar as fontes (Oswald, Inter, IBM Plex Mono) via
`next/font/google` — depois disso elas ficam em cache local.

## Estrutura

- `app/page.tsx` — painel principal: hero com a proposta do projeto,
  métricas gerais e tabela dos trechos mais urgentes
- `app/mapa/page.tsx` — mapa interativo (Leaflet) com os 642 pontos reais
  classificados por prioridade
- `lib/data.ts` — carrega e processa os dados (`data/mapa.json` e
  `data/prioridade.json`, gerados pelos scripts Python do pipeline)
- `components/` — MetricCard, TabelaUrgentes, MapaRodovia, KmPost (elemento
  de assinatura visual), PrioridadeBadge, Nav

## Próximos passos sugeridos

1. Trocar os JSONs estáticos por uma API (ex: rota `/api/trechos` lendo de
   um banco Postgres) para permitir atualização em tempo real
2. Adicionar a simulação de novas leituras semanais
3. Módulo de cronograma/planejamento de equipes
