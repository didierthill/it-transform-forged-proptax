# PropTax Engine 🇧🇪

> Moteur de calcul fiscal immobilier belge — API headless open source (MIT)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## Qu'est-ce que PropTax Engine ?

PropTax Engine est une API REST autonome qui calcule les taxes et frais immobiliers belges. Conçue pour être intégrée dans les CRM immobiliers (Whise, Zoho), portails d'agences, ou tout système nécessitant des calculs fiscaux immobiliers belges.

**3 couches d'API** :
- **Calcul** — 7 calculateurs fiscaux (stateless, aucune dépendance)
- **Documents** — Génération DOCX/PDF à partir de JSON
- **Dossiers** — CRUD MongoDB pour dossiers immobiliers (optionnel)

**Mode dégradé** : sans `MONGODB_URI`, seules les couches Calcul et Documents démarrent. Parfait pour un déploiement léger.

## Calculateurs disponibles

| Calculateur | Endpoint | Description |
|------------|----------|-------------|
| Droits d'enregistrement | `POST /api/v1/calcul/registration-fees` | 3 régions (Wallonie 12.5%/6%, Flandre 12%/3%, Bruxelles 12.5%) |
| Indexation du loyer | `POST /api/v1/calcul/indexation` | Art. 1728bis — loyer × (nouvel_indice / indice_départ) |
| Préavis de bail | `POST /api/v1/calcul/notice-period` | Bail 9 ans, courte durée, étudiant |
| Plus-value immobilière | `POST /api/v1/calcul/capital-gains` | Spéculative < 5 ans (16.5%), exonération résidence principale |
| Revenu cadastral indexé | `POST /api/v1/calcul/cadastral-income` | RC (1975) × coefficient annuel |
| Garantie locative | `POST /api/v1/calcul/rental-guarantee` | Plafonds légaux (2-3 mois selon type) |
| Précompte immobilier | `POST /api/v1/calcul/property-tax` | RC indexé × taux régional + centimes additionnels |

## Démarrage rapide

### Sans Docker

```bash
npm install
npm run dev    # Mode développement (tsx watch)
```

### Avec Docker

```bash
docker compose up -d
```

L'API est disponible sur `http://localhost:3400`.
Documentation Swagger : `http://localhost:3400/docs`

## Configuration

| Variable | Défaut | Description |
|----------|--------|-------------|
| `PORT` | `3400` | Port d'écoute |
| `HOST` | `0.0.0.0` | Adresse d'écoute |
| `MONGODB_URI` | — | URI MongoDB (optionnel — active la couche Dossiers) |
| `API_KEYS` | — | Clés API hashées SHA-256, séparées par virgules |
| `RATE_LIMIT_MAX` | `100` | Requêtes max par minute par clé API |
| `LOG_LEVEL` | `info` | Niveau de log (debug, info, warn, error) |

### Authentification

Si `API_KEYS` n'est pas défini, l'auth est désactivée (mode dev).

Pour activer l'auth :

```bash
# Générer le hash SHA-256 d'une clé
echo -n "my-secret-key" | shasum -a 256 | cut -d' ' -f1

# Configurer
export API_KEYS="hash1,hash2"
```

Inclure `X-API-Key: my-secret-key` dans chaque requête.

## Exemples

### Droits d'enregistrement (Bruxelles)

```bash
curl -X POST http://localhost:3400/api/v1/calcul/registration-fees \
  -H "Content-Type: application/json" \
  -d '{
    "purchasePrice": 350000,
    "region": "bruxelles",
    "isOnlyHome": true
  }'
```

### Précompte immobilier

```bash
curl -X POST http://localhost:3400/api/v1/calcul/property-tax \
  -H "Content-Type: application/json" \
  -d '{
    "baseCadastralIncome": 1500,
    "fiscalYear": 2025,
    "region": "bruxelles",
    "postalCode": "1050"
  }'
```

### Indexation du loyer

```bash
curl -X POST http://localhost:3400/api/v1/calcul/indexation \
  -H "Content-Type: application/json" \
  -d '{
    "baseRent": 850,
    "startIndex": 110.5,
    "newIndex": 128.7,
    "leaseStartDate": "2021-09-01",
    "calculationDate": "2025-09-01"
  }'
```

### Générer un document DOCX

```bash
curl -X POST http://localhost:3400/api/v1/documents/property-tax-summary \
  -H "Content-Type: application/json" \
  -d '{
    "format": "docx",
    "ownerName": "Jean Dupont",
    "propertyAddress": "Rue de la Loi 42, 1000 Bruxelles",
    "postalCode": "1000",
    "region": "bruxelles",
    "baseCadastralIncome": 1500,
    "fiscalYear": 2025
  }' -o precompte-2025.docx
```

## Stack technique

- **Runtime** : Node.js 22, TypeScript strict, ESM
- **Framework** : Fastify 5
- **Validation** : Zod
- **Base de données** : MongoDB 7 + Mongoose 8 (optionnel)
- **Documents** : docx (DOCX), pdfkit (PDF)
- **Tests** : Vitest

## Tests

```bash
npm test              # Lancer les tests
npm run test:watch    # Mode watch
npm run test:coverage # Avec couverture
```

## Licence

MIT © IT-Transform
