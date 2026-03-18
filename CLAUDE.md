# CLAUDE.md — PropTax Engine

> Moteur de calcul fiscal immobilier belge — API headless MIT, zéro dépendance @saas/*

## Architecture

```
src/
  index.ts              → Public API exports
  server.ts             → Fastify server + plugins
  errors.ts             → PropTaxError hierarchy
  types.ts              → Types + Zod schemas (332 lignes)
  calculators/          → 7 calculateurs fiscaux belges
    registration-fees.ts  → Droits d'enregistrement (3 régions)
    indexation.ts         → Indexation loyer (Art. 1728bis)
    notice-period.ts      → Préavis bail (9 ans, court, étudiant)
    capital-gains.ts      → Plus-value immobilière (16.5%)
    cadastral-income.ts   → RC indexé (coefficient annuel)
    rental-guarantee.ts   → Garantie locative (2-3 mois)
    property-tax.ts       → Précompte immobilier (centimes add.)
  data/                 → Données de référence
    registration-rates.ts → Taux par région
    rc-coefficients.ts    → Coefficients indexation RC 2020-2026
    health-index.ts       → Indices santé belges 2020-2026
  documents/            → Générateurs DOCX/PDF
    rental-receipt.ts     → Quittance de loyer
    property-tax-summary.ts → Résumé précompte
  dossiers/             → Mongoose model + CRUD
    model.ts              → Dossier schema (vente/location)
  routes/               → Fastify route handlers
    calcul.ts             → 7 endpoints calcul
    documents.ts          → 2 endpoints documents
    dossiers.ts           → CRUD dossiers
  middleware/
    api-key-auth.ts       → X-API-Key SHA-256
  __tests__/            → Vitest tests
```

## Stack

- Node.js 22, TypeScript strict, ESM (NodeNext)
- Fastify 5 + @fastify/swagger + @fastify/rate-limit
- Zod (validation input)
- Mongoose 8 (optionnel — couche Dossiers)
- docx + pdfkit (génération documents)
- Vitest (tests)

## 3 couches

1. **Calcul** (stateless) — `POST /api/v1/calcul/{calculator}`
2. **Documents** (stateless) — `POST /api/v1/documents/{type}`
3. **Dossiers** (MongoDB) — `GET/POST/PATCH/DELETE /api/v1/dossiers`

Sans `MONGODB_URI`, seules les couches 1 et 2 démarrent.

## Conventions

- Pas de `@saas/*` — tout est local
- `PropTaxError` → base, `CalculationError` (422), `InvalidRegionError` (400), `FiscalYearNotSupportedError` (400)
- `round2()` helper dans chaque calculateur
- Import paths avec `.js` extension (ESM)
- Données réglementaires dans `src/data/` — mises à jour annuellement

## Tests

53 tests couvrant les 7 calculateurs. Lancer : `npm test`

## Dev

```bash
npm run dev        # tsx watch sur port 3400
npm run build      # tsc → dist/
npm start          # node dist/server.js
npm run typecheck  # tsc --noEmit
```

## Session log — 18 mars 2026

- Porté 7 calculateurs depuis @saas/proptax (monorepo) → standalone
- Créé server.ts (Fastify 5, swagger, rate-limit, auth API key)
- Créé routes calcul (7), documents (2), dossiers (CRUD)
- Créé modèle Mongoose Dossier
- Créé document generators (quittance loyer, résumé précompte) en DOCX + PDF
- 53 tests verts
- Dockerfile (Chainguard), docker-compose.yml
- README.md complet
