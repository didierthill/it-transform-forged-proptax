# PropTax — Cahier des Charges (CDC)

> **Instructions pour Claude Code** : Ce document est le CDC metier de l'app `proptax`.
> LIRE le root CLAUDE.md (saas-platform/) AVANT d'implementer — c'est la loi technique.
> Implementer dans l'ordre : types -> modeles -> routes -> agents -> tests -> frontend.
> Ne pas decider de la stack — elle est fixee dans le root CLAUDE.md.

---

## Version & Statut

| Champ | Valeur |
|-------|--------|
| Version | 1.0 |
| Statut | Pret pour implementation |
| Date | 2026-03-18 |
| Auteur | Didier Thill / IT-Transform |
| CPO | Sabrina Little |
| App | `proptax` |
| Domaine | `proptax.eu` |
| Root specs | saas-platform/CLAUDE.md (source de verite) |

---

## 0. Etat de l'existant / Migration

### PropTax Engine (standalone, MIT)

Le moteur headless `proptax-engine` est deja construit et fonctionnel :

- **Repo** : `projets/002-INT-proptax/repo/proptax-engine/`
- **Stack** : Fastify 5, Zod, Mongoose 8, docx, pdfkit
- **Licence** : MIT — open-source, zero dependance `@saas/*`
- **Tests** : 53 tests verts

**Contenu du moteur** :

| Couche | Composants | Statut |
|--------|-----------|--------|
| Calcul (stateless) | 7 calculateurs : registration-fees, indexation, notice-period, capital-gains, cadastral-income, rental-guarantee, property-tax | Implemente, 53 tests |
| Documents (stateless) | 2 generateurs : rental-receipt (DOCX+PDF), property-tax-summary (DOCX+PDF) | Implemente |
| Dossiers (MongoDB) | Modele Mongoose Dossier (vente/location), CRUD | Implemente |
| Auth | API key simple (`X-API-Key` header SHA-256) | Implemente |
| Donnees reference | registration-rates, rc-coefficients (2020-2026), health-index (2020-2026) | Implemente |

### Strategie d'integration plateforme

L'app `apps/proptax/` dans le monorepo **wrappe** le moteur standalone :

```
proptax-engine (MIT, standalone)
    |
    v -- importe comme dependance npm ou recopie des calculateurs --
    |
apps/proptax/ (monorepo saas-platform)
    |-- utilise @saas/core, @saas/auth, @saas/tenancy, @saas/billing...
    |-- ajoute multi-tenancy (agences), RBAC, billing Stripe
    |-- ajoute frontend React + 3 themes visuels
    |-- ajoute agent IA "Conseiller Fiscal"
    |-- ajoute dashboard, gestion dossiers, admin
```

**Option d'import** : le package `proptax-engine` est ajoute comme dependance workspace (`"proptax-engine": "file:../../projets/002-INT-proptax/repo/proptax-engine"`) ou ses calculateurs sont reimportes directement dans `apps/proptax/src/calculators/`. Choix a valider avec Didier.

---

## 0b. Sources analysees

### Sources du dossier projet

| # | Fichier | Type | Contenu identifie | Impact CDC |
|---|---------|------|-------------------|------------|
| 1 | `repo/proptax-engine/src/calculators/` (7 fichiers) | Code TS | 7 calculateurs fiscaux belges, types, schemas Zod | Sections 4, 5, 7 |
| 2 | `repo/proptax-engine/src/data/` (3 fichiers) | Donnees reference | Taux enregistrement, coefficients RC, indices sante | Section 11 |
| 3 | `repo/proptax-engine/src/types.ts` (332 lignes) | Types TS | Interfaces Input/Result pour chaque calculateur | Section 4 |
| 4 | `repo/proptax-engine/src/documents/` (2 fichiers) | Generateurs | Quittance loyer DOCX/PDF, resume precompte DOCX/PDF | Section 6 |
| 5 | `repo/proptax-engine/src/dossiers/model.ts` | Modele Mongoose | Schema Dossier (vente/location) | Section 4 |
| 6 | `repo/proptax-engine/CLAUDE.md` | Spec technique | Architecture 3 couches, conventions standalone | Section 0 |
| 7 | `workdir/templates/` (5 DOCX + 5 PDF + types) | Templates We Invest | Options media, mediapack, fiche location, fiche vente, rapport AML | Section 6 |
| 8 | `FICHE.md` | Fiche projet | Owners, statut, delivrables | Section 1 |

### Inputs conversation

| # | Type | Description | Impact CDC |
|---|------|-------------|------------|
| 1 | Brief fonctionnel | Description complete de l'app plateforme | Toutes sections |
| 2 | 3 themes visuels | Belgian Authority, Immo Fresh, Terra Notarial | Section 13 |
| 3 | 4 personas | AGENCY_ADMIN, AGENT, BACK_OFFICE, PLATFORM_ADMIN | Section 2 |
| 4 | Plans billing | Starter, Agency, Enterprise | Section 3 |
| 5 | Glossaire metier (14 termes) | RC, precompte, droits enregistrement... | Section 12 |

---

## 1. Vision Produit

### Le quoi

PropTax est une plateforme SaaS de calcul fiscal immobilier belge destinee aux agences immobilieres. Elle encapsule le moteur standalone `proptax-engine` (MIT) dans l'ecosysteme `@saas/*` pour offrir multi-tenancy, RBAC, billing, theming et intelligence artificielle.

### Le pour qui

Les agences immobilieres belges (We Invest, Trevi, Century 21...) et leurs agents terrain qui realisent quotidiennement des calculs fiscaux (precompte, droits d'enregistrement, indexation loyer) pour leurs clients acheteurs et locataires.

### La valeur differenciante

- **7 calculateurs fiscaux belges** couvrant les 3 regions — aucun outil en ligne ne les regroupe tous
- **Dossiers structures** (vente + location) avec timeline et generation de documents officiels
- **Agent IA "Conseiller Fiscal"** contextuel sur chaque dossier — interprete les resultats, suggere des optimisations
- **Multi-agence** — chaque agence est un tenant isole avec ses propres dossiers, branding et utilisateurs
- **Mise a jour reglementaire centralisee** — les coefficients RC, indices sante et centimes communaux sont maintenus par IT-Transform pour toutes les agences

### Audience type

`b2b-invite` — les agences immobilieres s'inscrivent (ou sont inscrites par IT-Transform), puis invitent leurs agents.

### MVP scope vs roadmap v2+

**v1 (ce CDC)** :
- 7 calculateurs avec formulaires UI
- Gestion de dossiers (vente + location) avec timeline
- Generation documents DOCX/PDF
- 3 themes visuels selectionnables par tenant
- Agent IA "Conseiller Fiscal"
- Dashboard KPIs
- Import CSV de dossiers existants
- Landing page publique
- Admin : gestion donnees reglementaires

**v2+** :
- Integration Whise CRM (sync biens)
- Integration Zoho CRM
- API MyMINFIN (SPF Finances)
- Import cadastre automatise
- Rapprochement IPP cadre III
- Signature eIDAS
- Indivision / copropriete / demembrement
- Multi-devise Luxembourg (EUR ok, mais termes legaux differents)

---

## 2. Utilisateurs & Profils

### Profil : AGENCY_ADMIN

- **Description** : Directeur d'agence immobiliere (ex: Directeur We Invest Mons). Configure l'agence, gere les agents, gere le billing.
- **Permissions** : TENANT_ADMIN (herite de MEMBER). Peut : inviter/supprimer des membres, gerer le plan, configurer le theme, acceder aux rapports d'activite, gerer les dossiers de tous les agents.
- **Device principal** : Desktop
- **Contexte d'usage** : Bureau, gestion quotidienne
- **Competence tech** : Moyenne
- **Onboarding** : Wizard setup : profil agence -> premier bien -> inviter agents

### Profil : AGENT

- **Description** : Agent immobilier terrain (ex: agent We Invest). Realise les calculs quotidiens, cree et gere ses dossiers, genere les documents.
- **Permissions** : MEMBER. Peut : creer/modifier ses propres dossiers, executer tous les calculateurs, generer des documents, utiliser l'agent IA.
- **Device principal** : Mobile + Desktop (50/50)
- **Contexte d'usage** : En rendez-vous client, en voiture, au bureau
- **Competence tech** : Moyenne a faible
- **Onboarding** : Pas de setup — guide contextuel "voici ce que vous pouvez faire" + EmptyState sur chaque vue

### Profil : BACK_OFFICE

- **Description** : Secretariat de l'agence. Gere les dossiers administratifs, genere les documents, suit la facturation.
- **Permissions** : Role custom `back-office` (inherits MEMBER). Peut : voir et modifier tous les dossiers du tenant, generer des documents, exporter des rapports. Ne peut pas : inviter des membres, gerer le billing.
- **Device principal** : Desktop
- **Contexte d'usage** : Bureau, toute la journee
- **Competence tech** : Moyenne
- **Onboarding** : Pas de setup — acces immediat aux dossiers existants

### Profil : PLATFORM_ADMIN

- **Description** : Equipe IT-Transform. Gere les tenants, met a jour les donnees reglementaires (coefficients, centimes, indices).
- **Permissions** : APP_ADMIN / SUPER_ADMIN
- **Device principal** : Desktop
- **Contexte d'usage** : Administration ponctuelle
- **Competence tech** : Elevee
- **Onboarding** : Aucun — acces direct admin

---

## 3. app.yaml

```yaml
# ──────────────────────────────────────────────
# PropTax — app.yaml
# Calcul fiscal immobilier belge — B2B agences
# ──────────────────────────────────────────────

# Identite
appId: proptax
domain: proptax.eu
version: latest
domainCategory: real-estate-fiscal
tenantMode: flat

# i18n
i18n: [fr, nl, de]
defaultLocale: fr

# Auth — B2B invite-only
auth:
  mode: b2b
  signupMode: invite-only
  methods: [magic-link]
  primaryMethod: magic-link
  signup:
    open: false
    requireEmailVerification: true
  session:
    ttl: 604800        # 7 jours
    rememberMe: true
  rateLimit:
    login: 10
    signup: 3
    magicLink: 3
  customRoles:
    - id: back-office
      label: Back-office
      inherits: MEMBER
      description: Gestion administrative des dossiers et documents
  sso:
    enabled: true
    providers: [azure-ad, google-workspace]
    restrictedToPlans: [enterprise]
  apiKeys:
    enabled: true
    restrictedToPlans: [enterprise]
    maxKeysPerTenant: 10
    scopes:
      - id: 'calculators:execute'
        label: 'Executer les calculateurs'
      - id: 'dossiers:read'
        label: 'Lire les dossiers'
      - id: 'dossiers:write'
        label: 'Creer/modifier les dossiers'
      - id: 'documents:generate'
        label: 'Generer des documents'
      - id: 'reports:read'
        label: 'Lire les rapports d activite'

# Plans Stripe
plans:
  - id: starter
    stripeProductId: null
    stripePriceId: null
    isMetered: false
    quotas:
      dailyAiRequests: 5
      monthlyAiTokens: 50000
      maxTenantUsers: 1
      maxStorageGb: 1
      maxConcurrentStreams: 1
      allowedModels: ['claude-haiku-4-5']
      custom:
        maxDailyCalculations: 3
        maxDossiers: 0
        maxDocuments: 0
    features: ['calculators-basic']
    auditRetentionDays: 14

  - id: agency
    stripeProductId: prod_proptax_agency_xxx
    stripePriceId: price_proptax_agency_monthly_xxx
    stripePriceIdAnnual: price_proptax_agency_annual_xxx
    isMetered: false
    quotas:
      dailyAiRequests: 100
      monthlyAiTokens: 1000000
      maxTenantUsers: 5
      maxStorageGb: 5
      maxConcurrentStreams: 3
      allowedModels: ['claude-sonnet-4-5']
      custom:
        maxDailyCalculations: -1
        maxDossiers: 100
        maxDocuments: -1
    features: ['calculators-all', 'dossiers', 'documents-docx', 'ai-advisor', 'import-csv']
    auditRetentionDays: 365

  - id: enterprise
    stripeProductId: prod_proptax_enterprise_xxx
    stripePriceId: price_proptax_enterprise_monthly_xxx
    stripePriceIdAnnual: price_proptax_enterprise_annual_xxx
    isMetered: false
    quotas:
      dailyAiRequests: -1
      monthlyAiTokens: -1
      maxTenantUsers: -1
      maxStorageGb: 25
      maxConcurrentStreams: 10
      allowedModels: ['claude-sonnet-4-5']
      custom:
        maxDailyCalculations: -1
        maxDossiers: -1
        maxDocuments: -1
    features: ['calculators-all', 'dossiers', 'documents-docx', 'documents-pdf', 'ai-advisor', 'import-csv', 'export-xlsx', 'api-access', 'sso', 'priority-support']
    auditRetentionDays: 2555

# Member Tiers
memberTiers:
  - id: agent
    rank: 0
    isDefault: true
    quotas:
      global:
        dailyAiRequests: 10
        monthlyAiTokens: 100000
        allowedModels: ['claude-haiku-4-5']
      perAgent:
        tax-advisor: { limit: 20, window: day }

  - id: senior-agent
    rank: 1
    quotas:
      global:
        dailyAiRequests: 50
        monthlyAiTokens: 500000
        allowedModels: ['claude-sonnet-4-5']
      perAgent:
        tax-advisor: { limit: 100, window: day }

  - id: admin
    rank: 2
    quotas:
      global:
        dailyAiRequests: -1
        monthlyAiTokens: -1
        allowedModels: ['*']
      perAgent: '*'

# Agents IA
agents:
  - id: tax-advisor
    model: claude-sonnet-4-5
    systemPrompt: |
      Tu es un conseiller fiscal immobilier belge expert. Tu aides les agents immobiliers
      a comprendre les implications fiscales des transactions immobilieres en Belgique.

      Tu connais parfaitement :
      - Les droits d'enregistrement des 3 regions (Wallonie, Flandre, Bruxelles)
      - L'indexation des loyers (Art. 1728bis Code civil)
      - Le precompte immobilier et les centimes additionnels
      - Les plus-values immobilieres (Art. 90 CIR)
      - Le revenu cadastral et son indexation
      - Les garanties locatives
      - Les preavis de bail

      Tu reponds en francais sauf si l'utilisateur ecrit en neerlandais ou allemand.
      Tu cites toujours la base legale de tes reponses.
      Tu utilises les outils de calcul disponibles pour fournir des chiffres precis.
      Si tu n'es pas sur d'un montant, tu le dis clairement — ne jamais inventer un chiffre.
      Tu ajoutes systematiquement un disclaimer : "Ce calcul est indicatif et ne constitue
      pas un avis fiscal officiel. Consultez un notaire ou un conseiller fiscal agree."
    tools: [calculate-tax, get-dossier-context, search-regulatory-data, generate-summary]
    maxSteps: 8
    memoryTTL: 3600
    temperature: 0.2

  - id: address-autocomplete
    model: claude-haiku-4-5
    systemPrompt: |
      Tu es un assistant d'auto-completion d'adresses belges. A partir d'une saisie partielle,
      tu suggeres des adresses completes avec code postal, commune et region.
      Tu utilises le format belge standard.
    tools: [geocode-address]
    maxSteps: 2
    memoryTTL: 300
    temperature: 0.1

# Admin Dashboard
admin:
  customSections:
    - id: regulatory-data
      label: Donnees reglementaires
      icon: database
      component: RegulatoryDataAdmin
      requiredRole: APP_ADMIN

    - id: rc-coefficients
      label: Coefficients RC
      icon: calculator
      component: RcCoefficientsAdmin
      requiredRole: APP_ADMIN

    - id: municipal-centimes
      label: Centimes additionnels
      icon: map-pin
      component: MunicipalCentimesAdmin
      requiredRole: APP_ADMIN

    - id: health-indices
      label: Indices sante
      icon: heart-pulse
      component: HealthIndicesAdmin
      requiredRole: APP_ADMIN

# Tenant Dashboard — KPIs metier
tenantDashboard:
  kpis:
    - id: active-dossiers
      label: Dossiers actifs
      icon: FolderOpen
    - id: calculations-month
      label: Calculs ce mois
      icon: Calculator
      format: '{value}'
    - id: documents-generated
      label: Documents generes
      icon: FileText
    - id: avg-transaction-value
      label: Valeur moy. transaction
      icon: Euro
      format: '{value} EUR'
    - id: dossiers-by-type
      label: Dossiers vente/location
      icon: PieChart
    - id: ai-queries-month
      label: Questions IA
      icon: Bot
      format: '{value}'

# Landing Page
landing:
  enabled: true
  type: product
  hero:
    title: Fiscalite immobiliere belge, simplifiee
    subtitle: PropTax aide les agences immobilieres a calculer les droits d'enregistrement, le precompte, l'indexation des loyers et bien plus — en quelques clics.
    cta:
      label: Demander un acces
      action: /auth/request-access
  features:
    - icon: calculator
      title: 7 calculateurs fiscaux
      description: Droits d'enregistrement, precompte, indexation, plus-value, RC indexe, garantie locative, preavis
    - icon: map
      title: 3 regions couvertes
      description: Wallonie, Flandre, Bruxelles — chaque region avec ses regles specifiques
    - icon: file-text
      title: Documents professionnels
      description: Generez vos fiches dossier, quittances et rapports en DOCX ou PDF
    - icon: bot
      title: Conseiller IA integre
      description: Un assistant fiscal qui connait votre dossier et cite ses sources legales
  showPricing: true
  showContact: true
  requestAccess:
    enabled: true
    fields: [name, email, company, phone, message]
    notifyEmail: contact@proptax.eu

# Onboarding
onboarding:
  wizard:
    enabled: true
    skipable: false
    steps:
      - id: agency-profile
        label: Votre agence
        fields: [name, address, phone, bce, logo]
      - id: first-calculation
        label: Votre premier calcul
        description: Testez un calcul de droits d'enregistrement
        component: FirstCalculationWizard
      - id: invite-agents
        label: Invitez vos agents
        description: Ajoutez les membres de votre equipe (optionnel)
        skipable: true
  adminSteps:
    - id: complete-profile
      label: Completez le profil agence
      route: /settings/profile
    - id: first-calculation
      label: Effectuez votre premier calcul
      route: /calculators
    - id: create-first-dossier
      label: Creez votre premier dossier
      route: /dossiers/new
    - id: invite-team
      label: Invitez votre equipe
      route: /settings/members
  memberWelcome:
    title: Bienvenue dans PropTax
    description: Vous avez ete invite par votre agence. Decouvrez les calculateurs fiscaux.

# Legal retention (ADR-009)
legalRetention:
  fiscalRecords: 7y

# Support
support:
  channels:
    - type: email
      value: support@proptax.eu
    - type: phone
      value: "+32 81 00 00 00"
      hours: "Lun-Ven 9h-17h"
  faqUrl: /faq

help:
  glossary: true
  faq: true
  contextualHelp: true
  supportWidget: true

# Import/Export
importExport:
  enabled: true
  import:
    formats: [csv, json]
    maxFileSizeMB: 10
    entities:
      - entity: dossiers
        requiredFields: [type, address, postalCode, region]
  export:
    formats: [csv, json, xlsx]
    entities:
      - entity: dossiers
      - entity: calculations
      - entity: documents

# Feature flags
featureFlags:
  aiChatWidget: true
  bulkImport: true
  documentGeneration: true
  exportXlsx: false

# PWA
pwa:
  enabled: false

# Demo
demo:
  enabled: true
  quickDemo:
    enabled: true
    sessionTtlMinutes: 60
    maxWriteRecords: 5
    resetSchedule: '0 3 * * *'
  personalDemo:
    enabled: true
    ttlDays: 7
  planId: agency
  seedLocale: fr

# Theme — 3 profils selectionnables par tenant
theme:
  profiles:
    - id: belgian-authority
      label: "Belgian Authority"
      default: true
    - id: immo-fresh
      label: "Immo Fresh"
    - id: terra-notarial
      label: "Terra Notarial"
```

---

## 4. Modeles de Donnees (Mongoose)

### Modele : Property (Bien immobilier)

```typescript
import { Schema, model } from 'mongoose'

const propertySchema = new Schema({
  appId: { type: String, required: true, index: true },
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },

  // Identification
  reference: { type: String },                          // ref interne agence
  label: { type: String, required: true },              // "Appartement Rue de la Loi 42"

  // Adresse
  address: {
    street: { type: String, required: true },
    number: { type: String, required: true },
    box: { type: String },
    postalCode: { type: String, required: true, match: /^\d{4}$/ },
    municipality: { type: String, required: true },
    province: { type: String },
    region: { type: String, required: true, enum: ['wallonie', 'flandre', 'bruxelles'] },
    country: { type: String, default: 'BE' },
  },

  // Cadastre
  cadastralIncome: { type: Number },                    // RC non indexe
  cadastralReference: { type: String },                 // reference cadastrale
  cadastralSection: { type: String },
  cadastralParcel: { type: String },

  // Caracteristiques
  propertyType: {
    type: String,
    enum: ['house', 'apartment', 'studio', 'commercial', 'land', 'garage', 'other'],
    required: true,
  },
  surface: { type: Number },                            // m2
  rooms: { type: Number },
  constructionYear: { type: Number },
  pebScore: { type: String, enum: ['A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'] },

  // Ownership
  ownerName: { type: String },
  ownerContact: { type: String },

  // GeoJSON
  location: {
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number] },                    // [lng, lat]
  },

  // Metadonnees
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  notes: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

propertySchema.index({ appId: 1, tenantId: 1, createdAt: -1 })
propertySchema.index({ appId: 1, tenantId: 1, 'address.postalCode': 1 })
propertySchema.index({ appId: 1, tenantId: 1, status: 1 })
propertySchema.index({ location: '2dsphere' })

export const PropertyModel = model('Property', propertySchema)
```

### Modele : Dossier (Transaction immobiliere)

```typescript
const dossierSchema = new Schema({
  appId: { type: String, required: true, index: true },
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },

  // Type de dossier
  type: { type: String, required: true, enum: ['sale', 'rental'] },
  reference: { type: String, required: true },          // auto-genere : "DOS-2026-00142"
  status: {
    type: String,
    required: true,
    enum: ['draft', 'active', 'completed', 'archived'],
    default: 'draft',
  },

  // Bien
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
  propertySnapshot: {                                    // copie a la creation du dossier
    label: String,
    address: { street: String, number: String, postalCode: String, municipality: String, region: String },
    cadastralIncome: Number,
    propertyType: String,
  },

  // Parties
  parties: [{
    role: { type: String, enum: ['seller', 'buyer', 'landlord', 'tenant', 'notary', 'agent'] },
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    nationalNumber: { type: String },                    // numero national belge
    address: { type: String },
  }],

  // Donnees financieres (vente)
  saleData: {
    askingPrice: { type: Number },
    salePrice: { type: Number },
    saleDate: { type: Date },
    notaryFees: { type: Number },
    registrationFees: { type: Number },
    isOnlyHome: { type: Boolean },
    isModestHome: { type: Boolean },
    mortgageAmount: { type: Number },
  },

  // Donnees financieres (location)
  rentalData: {
    monthlyRent: { type: Number },
    charges: { type: Number },
    leaseStartDate: { type: Date },
    leaseEndDate: { type: Date },
    leaseType: { type: String, enum: ['short_term', 'standard_9yr', 'long_term', 'student', 'commercial'] },
    guaranteeType: { type: String, enum: ['bank_account', 'bank_guarantee', 'cpas_guarantee'] },
    guaranteeAmount: { type: Number },
    indexationBaseIndex: { type: Number },
  },

  // Timeline
  timeline: [{
    date: { type: Date, required: true },
    event: { type: String, required: true },
    description: { type: String },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    metadata: { type: Schema.Types.Mixed },
  }],

  // Documents generes
  documents: [{
    type: { type: String },                              // 'rental-receipt', 'property-tax-summary', etc.
    filename: { type: String },
    format: { type: String, enum: ['docx', 'pdf'] },
    storageKey: { type: String },                        // ref S3/Garage
    generatedAt: { type: Date },
    generatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  }],

  // Calculs associes
  calculations: [{
    calculatorId: { type: String },                      // 'registration-fees', 'indexation', etc.
    input: { type: Schema.Types.Mixed },
    result: { type: Schema.Types.Mixed },
    calculatedAt: { type: Date },
    calculatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    version: { type: Number, default: 1 },
  }],

  // Assignation
  assignedTo: { type: Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },

  // Tags libres
  tags: [{ type: String }],

  // Metadonnees
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

dossierSchema.index({ appId: 1, tenantId: 1, status: 1, createdAt: -1 })
dossierSchema.index({ appId: 1, tenantId: 1, type: 1 })
dossierSchema.index({ appId: 1, tenantId: 1, assignedTo: 1 })
dossierSchema.index({ appId: 1, tenantId: 1, reference: 1 }, { unique: true })
dossierSchema.index({ appId: 1, tenantId: 1, 'propertySnapshot.address.postalCode': 1 })

export const DossierModel = model('Dossier', dossierSchema)
```

### Modele : Calculation (Historique des calculs)

```typescript
const calculationSchema = new Schema({
  appId: { type: String, required: true, index: true },
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },

  // Calculateur
  calculatorId: {
    type: String,
    required: true,
    enum: [
      'registration-fees',
      'indexation',
      'notice-period',
      'capital-gains',
      'cadastral-income',
      'rental-guarantee',
      'property-tax',
    ],
  },

  // Entrees/Sorties
  input: { type: Schema.Types.Mixed, required: true },
  result: { type: Schema.Types.Mixed, required: true },

  // Liaison dossier (optionnel — un calcul peut etre fait hors dossier)
  dossierId: { type: Schema.Types.ObjectId, ref: 'Dossier' },

  // Mode
  mode: { type: String, enum: ['simulation', 'definitive'], default: 'simulation' },

  // Metadonnees
  region: { type: String, enum: ['wallonie', 'flandre', 'bruxelles'] },
  fiscalYear: { type: Number },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
})

calculationSchema.index({ appId: 1, tenantId: 1, calculatorId: 1, createdAt: -1 })
calculationSchema.index({ appId: 1, tenantId: 1, dossierId: 1 })
calculationSchema.index({ appId: 1, tenantId: 1, userId: 1, createdAt: -1 })

export const CalculationModel = model('Calculation', calculationSchema)
```

### Modele : RegulatoryData (Donnees reglementaires)

```typescript
const regulatoryDataSchema = new Schema({
  appId: { type: String, required: true, index: true },

  // Type de donnee
  dataType: {
    type: String,
    required: true,
    enum: [
      'rc-coefficient',         // coefficient indexation RC par annee
      'health-index',           // indice sante par mois
      'registration-rate',      // taux droits enregistrement par region
      'municipal-centimes',     // centimes additionnels par commune
      'provincial-centimes',    // centimes additionnels par province
    ],
  },

  // Cle unique
  key: { type: String, required: true },                // ex: "2026", "2026-03", "1000" (code postal)

  // Valeur
  value: { type: Schema.Types.Mixed, required: true },  // nombre, objet, ou tableau

  // Contexte
  region: { type: String, enum: ['wallonie', 'flandre', 'bruxelles'] },
  fiscalYear: { type: Number },
  municipality: { type: String },
  province: { type: String },

  // Source officielle
  source: { type: String },                             // "SPF Finances", "Statbel", "Moniteur Belge"
  sourceDate: { type: Date },                           // date de publication
  sourceUrl: { type: String },

  // Validite
  validFrom: { type: Date, required: true },
  validUntil: { type: Date },

  // Audit
  updatedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

regulatoryDataSchema.index({ appId: 1, dataType: 1, key: 1 }, { unique: true })
regulatoryDataSchema.index({ appId: 1, dataType: 1, region: 1, fiscalYear: 1 })
regulatoryDataSchema.index({ appId: 1, dataType: 1, validFrom: -1 })

export const RegulatoryDataModel = model('RegulatoryData', regulatoryDataSchema)
```

### Modele : Document (Document genere)

```typescript
const documentSchema = new Schema({
  appId: { type: String, required: true, index: true },
  tenantId: { type: Schema.Types.ObjectId, required: true, index: true },

  // Type
  documentType: {
    type: String,
    required: true,
    enum: [
      'rental-receipt',          // quittance de loyer
      'property-tax-summary',    // resume precompte immobilier
      'sale-sheet',              // fiche de vente
      'rental-sheet',            // fiche de location
      'aml-report',              // rapport anti-blanchiment
      'media-options',           // options pack media
      'custom',                  // document personnalise
    ],
  },

  // Fichier
  filename: { type: String, required: true },
  format: { type: String, required: true, enum: ['docx', 'pdf'] },
  storageKey: { type: String, required: true },          // chemin S3/Garage
  fileSize: { type: Number },                            // bytes

  // Liaison
  dossierId: { type: Schema.Types.ObjectId, ref: 'Dossier' },
  propertyId: { type: Schema.Types.ObjectId, ref: 'Property' },
  calculationId: { type: Schema.Types.ObjectId, ref: 'Calculation' },

  // Partage
  shareToken: { type: String },                          // token unique pour partage par lien
  shareExpiresAt: { type: Date },                        // TTL 7 jours

  // Metadonnees
  generatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
})

documentSchema.index({ appId: 1, tenantId: 1, dossierId: 1, createdAt: -1 })
documentSchema.index({ appId: 1, tenantId: 1, documentType: 1 })
documentSchema.index({ shareToken: 1 }, { sparse: true })

export const DocumentModel = model('Document', documentSchema)
```

---

## 5. Workflows & Regles Metier

### Workflow 1 : Calcul fiscal

- **Trigger** : L'agent selectionne un calculateur et remplit le formulaire
- **Acteurs** : AGENT, BACK_OFFICE, AGENCY_ADMIN
- **Etapes** :
  1. Selection du calculateur (7 disponibles)
  2. Saisie des parametres (formulaire Zod-valide)
  3. Execution du calcul (appel moteur proptax-engine)
  4. Affichage du resultat detaille (breakdown)
  5. Sauvegarde en historique (CalculationModel)
  6. (Optionnel) Liaison a un dossier existant
  7. (Optionnel) Generation document PDF/DOCX du resultat
- **Regles** :
  - Un calcul sans dossier est toujours en mode `simulation`
  - Un calcul lie a un dossier peut etre `simulation` ou `definitive`
  - Un calcul `definitive` est immutable — versionne si refait
  - Le disclaimer legal est affiche sur CHAQUE resultat
  - Les quotas `maxDailyCalculations` sont verifies avant execution
- **Erreurs** : Region invalide, annee fiscale hors plage, donnees reglementaires manquantes, quota depasse
- **Evenements** : `calculation.executed`, `calculation.saved`, `calculation.linked_to_dossier`

### Workflow 2 : Gestion de dossier

- **Trigger** : L'agent cree un nouveau dossier (vente ou location)
- **Acteurs** : AGENT (cree), BACK_OFFICE (complete), AGENCY_ADMIN (supervise)
- **Etapes** :
  1. Creation : choix type (vente/location) + bien (existant ou nouveau)
  2. Saisie parties (vendeur/acheteur ou bailleur/locataire)
  3. Saisie donnees financieres
  4. Calculs associes (enregistres dans le dossier)
  5. Generation documents
  6. Passage en statut `active` puis `completed`
  7. Archivage
- **Regles** :
  - Reference auto-generee : `DOS-{YYYY}-{NNNNN}` (sequentiel par tenant)
  - Un dossier `completed` ne peut plus etre modifie (seulement archive)
  - Chaque modification ajoute une entree dans la timeline
  - Un dossier doit avoir au moins 1 partie et 1 bien pour passer en `active`
- **Erreurs** : Dossier incomplet, bien non trouve, quota dossiers depasse
- **Evenements** : `dossier.created`, `dossier.updated`, `dossier.completed`, `dossier.archived`

### Workflow 3 : Generation de document

- **Trigger** : L'agent clique "Generer document" depuis un dossier ou un calcul
- **Acteurs** : AGENT, BACK_OFFICE
- **Etapes** :
  1. Selection du type de document
  2. Verification des donnees requises (parties, financier, calculs)
  3. Generation DOCX (via `docx`) et/ou PDF (via `pdfkit`)
  4. Upload vers Garage/S3 via `@saas/storage`
  5. Sauvegarde reference dans DocumentModel
  6. (Optionnel) Partage par lien temporaire (presigned URL, TTL 7 jours)
- **Regles** :
  - DOCX disponible des le plan `agency`
  - PDF reserve au plan `enterprise`
  - Chaque document genere est stocke dans `{appId}/{tenantId}/documents/{dossierId}/{filename}`
  - Le partage par lien genere un `shareToken` unique (crypto.randomBytes)
- **Erreurs** : Donnees manquantes pour le template, quota documents depasse, erreur generation
- **Evenements** : `document.generated`, `document.shared`

### Workflow 4 : Import CSV de dossiers

- **Trigger** : AGENCY_ADMIN importe un fichier CSV depuis l'admin
- **Acteurs** : AGENCY_ADMIN
- **Etapes** :
  1. Upload du fichier CSV via presigned URL
  2. Validation : parse + Zod schema par ligne
  3. Rapport de pre-import (valid/invalid/duplicates)
  4. Confirmation par l'admin
  5. Import en batch (500 lignes/batch)
  6. Rapport final
- **Regles** :
  - Champs requis : type, address, postalCode, region
  - Mode upsert : si un dossier avec la meme reference existe, il est mis a jour
  - Les biens (Property) sont crees automatiquement si absents
  - Max 10 000 lignes par import
- **Erreurs** : Fichier invalide, lignes en erreur, quota depasse
- **Evenements** : `import.started`, `import.completed`

### Workflow 5 : Mise a jour reglementaire

- **Trigger** : PLATFORM_ADMIN met a jour les coefficients/centimes/indices
- **Acteurs** : PLATFORM_ADMIN uniquement
- **Etapes** :
  1. Navigation vers la section admin "Donnees reglementaires"
  2. Selection du type (RC coefficients, indices sante, centimes, taux)
  3. Saisie ou import CSV des nouvelles valeurs
  4. Validation (fourchette plausible, source obligatoire)
  5. Publication (effectif immediatement pour tous les tenants)
- **Regles** :
  - Source officielle obligatoire (SPF Finances, Statbel, Moniteur Belge)
  - Les anciennes valeurs sont conservees (historique complet)
  - Un changement de coefficient RC declenche un recalcul des resultats cached
- **Erreurs** : Valeur hors plage, source manquante, conflit de dates
- **Evenements** : `regulatory-data.updated`

---

## 6. Features & Ecrans

### Feature : Dashboard

- **Route** : `/dashboard`
- **Profils autorises** : AGENCY_ADMIN, AGENT, BACK_OFFICE
- **Description fonctionnelle** : Vue d'ensemble de l'activite de l'agence avec KPIs et acces rapide aux actions principales.
- **Composants principaux** :
  - KPI cards (6) : dossiers actifs, calculs du mois, documents generes, valeur moy. transaction, repartition vente/location, questions IA
  - Liste des dossiers recents (5 derniers)
  - Actions rapides : "Nouveau calcul", "Nouveau dossier", "Poser une question IA"
  - Graphique mensuel (calculs par type)
- **Etats UI** : loading (skeleton), empty (OnboardingChecklist + EmptyState), error (retry), success
- **Responsive** : desktop (grille 3 colonnes), tablet (2 colonnes), mobile (stack)

### Feature : Calculateurs

- **Route** : `/calculators` (hub) et `/calculators/{calculatorId}` (formulaire individuel)
- **Profils autorises** : AGENCY_ADMIN, AGENT, BACK_OFFICE
- **Description fonctionnelle** : Hub des 7 calculateurs. Chaque calculateur a un formulaire dedie avec validation Zod, resultat detaille, et option de sauvegarde.
- **Composants principaux** :
  - Grille des 7 calculateurs (icone + nom + description 1 ligne)
  - Formulaire dynamique par calculateur (champs selon le type)
  - Panneau resultat (breakdown detaille, base legale, disclaimer)
  - Boutons : "Sauvegarder", "Lier a un dossier", "Generer PDF", "Nouveau calcul"
  - Historique des derniers calculs (sidebar ou onglet)
- **Etats UI** : formulaire vide, en calcul (spinner), resultat affiche, erreur validation
- **Notes UX (crash-test)** :
  - Les labels des champs doivent inclure un HelpTooltip (ex: "RC" -> "Revenu cadastral : revenu fictif fixe en 1975...")
  - Le disclaimer legal est TOUJOURS visible dans le resultat, pas cache
  - Sur mobile : formulaire plein ecran, resultat en page separee (pas de split)

### Feature : Gestion de dossiers

- **Route** : `/dossiers` (liste) et `/dossiers/{id}` (detail)
- **Profils autorises** : AGENCY_ADMIN (tous les dossiers), AGENT (ses dossiers), BACK_OFFICE (tous les dossiers)
- **Description fonctionnelle** : CRUD des dossiers immobiliers (vente et location) avec timeline, documents, calculs et chat IA.
- **Composants principaux** :
  - Liste paginee avec filtres (type, statut, agent assigne, periode)
  - Detail dossier avec onglets : "Resume", "Parties", "Financier", "Calculs", "Documents", "Timeline"
  - Timeline : log visuel des evenements du dossier
  - Widget chat IA (agent tax-advisor) contextualisé sur le dossier
  - Actions : "Generer document", "Ajouter calcul", "Changer statut", "Partager"
- **Etats UI** : liste vide (EmptyState "Creez votre premier dossier"), loading, detail, erreur
- **Notes UX** :
  - Le filtre "Mes dossiers" est selectionne par defaut pour le role AGENT
  - Le changement de statut est confirme par une modale (irreversible pour `completed`)

### Feature : Generation de documents

- **Route** : `/dossiers/{id}/documents` (onglet dans le dossier) et `/documents` (liste globale)
- **Profils autorises** : AGENCY_ADMIN, AGENT, BACK_OFFICE
- **Description fonctionnelle** : Generation DOCX/PDF depuis un dossier, telechargement, et partage par lien temporaire.
- **Composants principaux** :
  - Selecteur de type de document
  - Preview des donnees qui seront injectees dans le template
  - Bouton "Generer" + indicateur de progression
  - Liste des documents generes avec actions : "Telecharger", "Partager", "Supprimer"
  - Lien de partage avec compteur d'expiration
- **Etats UI** : aucun document (EmptyState), generation en cours, pret a telecharger, lien expire

### Feature : Agent IA "Conseiller Fiscal"

- **Route** : Widget flottant accessible partout + panneau lateral dans `/dossiers/{id}`
- **Profils autorises** : AGENCY_ADMIN, AGENT, BACK_OFFICE (avec quotas par tier)
- **Description fonctionnelle** : Chat conversationnel avec un agent IA specialise en fiscalite immobiliere belge. Contextualisé sur le dossier ouvert.
- **Composants principaux** :
  - Widget chat flottant (bouton en bas a droite)
  - Panneau lateral dans la vue dossier (contexte dossier injecte)
  - Historique des conversations
  - Indicateur : "Ceci est une IA — les reponses sont indicatives"
  - Actions rapides : "Resume ce dossier", "Quel est le precompte estime ?", "Optimisations possibles ?"
- **Etats UI** : conversation vide (suggestions), en cours (streaming SSE), erreur quota, erreur reseau

### Feature : Administration donnees reglementaires

- **Route** : `/admin/regulatory-data`, `/admin/rc-coefficients`, `/admin/municipal-centimes`, `/admin/health-indices`
- **Profils autorises** : APP_ADMIN, SUPER_ADMIN
- **Description fonctionnelle** : CRUD des donnees reglementaires (coefficients RC, indices sante, centimes communaux, taux d'enregistrement).
- **Composants principaux** :
  - Tableau editable par type de donnee
  - Import CSV pour les centimes communaux (581+ communes)
  - Historique des modifications (audit trail)
  - Indicateur source officielle + date de publication
- **Etats UI** : liste existante, edition inline, import en cours, confirmation publication

### Feature : Landing page publique

- **Route** : `/` (non authentifie)
- **Profils autorises** : Public (pas d'auth)
- **Description fonctionnelle** : Page d'accueil publique presentant PropTax, ses fonctionnalites, le pricing et un formulaire de demande d'acces.
- **Composants principaux** :
  - Hero (titre, sous-titre, CTA "Demander un acces")
  - Section features (7 calculateurs, 3 regions, documents, IA)
  - Section pricing (3 plans : Starter, Agency, Enterprise)
  - Section FAQ
  - Formulaire de contact / demande d'acces
  - Footer (mentions legales, liens, contact)
- **SEO** : title, meta description, OG tags, structured data Schema.org

### Feature : Parametres agence

- **Route** : `/settings/profile`, `/settings/members`, `/settings/billing`, `/settings/theme`
- **Profils autorises** : AGENCY_ADMIN
- **Description fonctionnelle** : Configuration de l'agence (profil, membres, plan, theme visuel).
- **Composants principaux** :
  - Profil agence : nom, adresse, BCE, logo, telephone
  - Gestion membres : inviter, supprimer, changer le role (MEMBER, back-office, TENANT_ADMIN)
  - Billing : plan actuel, upgrade/downgrade, historique factures (Stripe Customer Portal)
  - Theme : selection parmi les 3 profils visuels (Belgian Authority, Immo Fresh, Terra Notarial) + dark/light

---

## 7. Routes API (Fastify)

### Calculateurs

| Methode | Route | Auth | Roles | Description |
|---------|-------|------|-------|-------------|
| POST | `/api/calculators/registration-fees` | oui | MEMBER+ | Calculer les droits d'enregistrement |
| POST | `/api/calculators/indexation` | oui | MEMBER+ | Calculer l'indexation du loyer |
| POST | `/api/calculators/notice-period` | oui | MEMBER+ | Calculer le preavis de bail |
| POST | `/api/calculators/capital-gains` | oui | MEMBER+ | Calculer la plus-value immobiliere |
| POST | `/api/calculators/cadastral-income` | oui | MEMBER+ | Calculer le RC indexe |
| POST | `/api/calculators/rental-guarantee` | oui | MEMBER+ | Calculer la garantie locative |
| POST | `/api/calculators/property-tax` | oui | MEMBER+ | Calculer le precompte immobilier |

**Schema commun** : body = schema Zod du calculateur (voir types.ts du moteur). Response = resultat + breakdown + disclaimer. Erreurs : 400 (validation), 422 (calcul), 429 (quota).

Chaque route :
- Verifie le quota `maxDailyCalculations` via `checkCustomQuota(ctx, 'maxDailyCalculations', ...)`
- Appelle le calculateur du moteur proptax-engine
- Sauvegarde le resultat dans `CalculationModel`
- Audit log : categorie `data`, action `CREATED`, targetType `calculation`

### Biens (Property)

| Methode | Route | Auth | Roles | Description |
|---------|-------|------|-------|-------------|
| GET | `/api/properties` | oui | MEMBER+ | Lister les biens du tenant (pagine) |
| GET | `/api/properties/:id` | oui | MEMBER+ | Detail d'un bien |
| POST | `/api/properties` | oui | MEMBER+ | Creer un bien |
| PATCH | `/api/properties/:id` | oui | MEMBER+ | Modifier un bien |
| DELETE | `/api/properties/:id` | oui | TENANT_ADMIN | Archiver un bien |

### Dossiers

| Methode | Route | Auth | Roles | Description |
|---------|-------|------|-------|-------------|
| GET | `/api/dossiers` | oui | MEMBER+ | Lister les dossiers (pagine, filtre par statut/type/agent) |
| GET | `/api/dossiers/:id` | oui | MEMBER+ | Detail complet d'un dossier |
| POST | `/api/dossiers` | oui | MEMBER+ | Creer un dossier |
| PATCH | `/api/dossiers/:id` | oui | MEMBER+ | Modifier un dossier (si pas completed) |
| PATCH | `/api/dossiers/:id/status` | oui | MEMBER+ | Changer le statut |
| POST | `/api/dossiers/:id/calculations` | oui | MEMBER+ | Lier un calcul a un dossier |
| POST | `/api/dossiers/:id/timeline` | oui | MEMBER+ | Ajouter un evenement timeline |
| DELETE | `/api/dossiers/:id` | oui | TENANT_ADMIN | Archiver un dossier |

**Quotas** : `checkCustomQuota(ctx, 'maxDossiers', ...)` a la creation.

### Documents

| Methode | Route | Auth | Roles | Description |
|---------|-------|------|-------|-------------|
| GET | `/api/documents` | oui | MEMBER+ | Lister les documents du tenant |
| POST | `/api/documents/generate` | oui | MEMBER+ | Generer un document |
| GET | `/api/documents/:id/download` | oui | MEMBER+ | Telecharger (presigned URL) |
| POST | `/api/documents/:id/share` | oui | MEMBER+ | Creer un lien de partage |
| GET | `/api/share/:token` | non | Public | Telecharger via lien de partage |
| DELETE | `/api/documents/:id` | oui | TENANT_ADMIN | Supprimer un document |

### Calculs (historique)

| Methode | Route | Auth | Roles | Description |
|---------|-------|------|-------|-------------|
| GET | `/api/calculations` | oui | MEMBER+ | Historique des calculs (pagine) |
| GET | `/api/calculations/:id` | oui | MEMBER+ | Detail d'un calcul |
| DELETE | `/api/calculations/:id` | oui | TENANT_ADMIN | Supprimer un calcul |

### Donnees reglementaires (admin)

| Methode | Route | Auth | Roles | Description |
|---------|-------|------|-------|-------------|
| GET | `/api/admin/regulatory-data` | oui | APP_ADMIN | Lister les donnees reglementaires |
| GET | `/api/admin/regulatory-data/:dataType` | oui | APP_ADMIN | Lister par type |
| POST | `/api/admin/regulatory-data` | oui | APP_ADMIN | Creer/mettre a jour une donnee |
| POST | `/api/admin/regulatory-data/import` | oui | APP_ADMIN | Import CSV de centimes/indices |
| DELETE | `/api/admin/regulatory-data/:id` | oui | SUPER_ADMIN | Supprimer une donnee |

### Rapports

| Methode | Route | Auth | Roles | Description |
|---------|-------|------|-------|-------------|
| GET | `/api/reports/activity` | oui | TENANT_ADMIN | Rapport d'activite du tenant (KPIs dashboard) |
| GET | `/api/reports/calculations` | oui | TENANT_ADMIN | Statistiques des calculs (par type, par mois) |

### Import/Export

| Methode | Route | Auth | Roles | Description |
|---------|-------|------|-------|-------------|
| POST | `/api/import/validate` | oui | TENANT_ADMIN | Valider un fichier CSV avant import |
| POST | `/api/import/execute` | oui | TENANT_ADMIN | Executer l'import |
| GET | `/api/import/template` | oui | MEMBER+ | Telecharger le template CSV |
| GET | `/api/export` | oui | TENANT_ADMIN | Exporter dossiers/calculs (CSV/JSON/XLSX) |

---

## 8. Agents IA & Opportunites IA

### AI Opportunity Scan

| Workflow/Feature | Categorie IA | Type | Valeur | Priorite |
|-----------------|-------------|------|--------|----------|
| Calcul fiscal | Saisie assistee | Micro-tool | Auto-completion adresse + suggestion RC | v1 |
| Dossier actif | Assistant utilisateur | Agent | Chat contextuel sur le dossier, interprete les resultats | v1 |
| Import CSV | Enrichissement donnees | Micro-tool | Nettoyage adresses, normalisation codes postaux | v1 |
| Dashboard | Synthese / digest | Micro-tool | Resume mensuel des dossiers et tendances | v2 |
| Generation documents | Generation de documents | Micro-tool | Resume narratif du dossier pour le document | v2 |
| Recherche dossier | Recherche / decouverte | Micro-tool | Recherche en langage naturel dans les dossiers | v2 |
| Veille reglementaire | Detection anomalies | Agent | Alerter quand les coefficients changent | v2 |

### Agent : tax-advisor (Conseiller Fiscal)

- **ID** : `tax-advisor`
- **Modele** : claude-sonnet-4-5
- **Description** : Agent conversationnel specialise en fiscalite immobiliere belge. Contextualisé sur le dossier ouvert.
- **System prompt** : voir app.yaml ci-dessus
- **Tools** :

```typescript
// Tool 1 : calculate-tax
defineTool({
  name: 'calculate_tax',
  description: 'Execute un calcul fiscal via le moteur PropTax',
  inputSchema: z.object({
    calculator: z.enum([
      'registration-fees', 'indexation', 'notice-period',
      'capital-gains', 'cadastral-income', 'rental-guarantee', 'property-tax'
    ]),
    params: z.record(z.unknown()),
  }),
  execute: async (input, ctx) => {
    // Appelle le calculateur et retourne le resultat
  },
})

// Tool 2 : get-dossier-context
defineTool({
  name: 'get_dossier_context',
  description: 'Recupere les donnees du dossier en cours pour contextualiser la reponse',
  inputSchema: z.object({
    dossierId: z.string(),
  }),
  execute: async (input, ctx) => {
    // Retourne le dossier + bien + calculs + parties
  },
})

// Tool 3 : search-regulatory-data
defineTool({
  name: 'search_regulatory_data',
  description: 'Recherche dans les donnees reglementaires (coefficients, indices, centimes)',
  inputSchema: z.object({
    dataType: z.enum(['rc-coefficient', 'health-index', 'registration-rate', 'municipal-centimes']),
    key: z.string().optional(),
    region: z.enum(['wallonie', 'flandre', 'bruxelles']).optional(),
    fiscalYear: z.number().optional(),
  }),
  execute: async (input, ctx) => {
    // Recherche dans RegulatoryDataModel
  },
})

// Tool 4 : generate-summary
defineTool({
  name: 'generate_summary',
  description: 'Genere un resume structure du dossier ou du calcul',
  inputSchema: z.object({
    dossierId: z.string().optional(),
    calculationId: z.string().optional(),
    format: z.enum(['text', 'bullet-points']).default('bullet-points'),
  }),
  execute: async (input, ctx) => {
    // Compose un resume a partir des donnees
  },
})
```

### Micro-tool : address-autocomplete

- **ID** : `address-autocomplete`
- **Modele** : claude-haiku-4-5
- **Type** : Bouton / auto-completion dans les formulaires
- **Description** : A partir d'une saisie partielle d'adresse, suggere des adresses belges completes avec code postal, commune et region.
- **Fallback** : Si l'IA echoue, afficher un champ texte libre standard

### Micro-tool : rc-suggestion

- **Type** : Bouton dans le formulaire bien
- **Description** : A partir du code postal et du type de bien, suggere une fourchette de RC probable
- **Modele** : claude-haiku-4-5
- **Fallback** : Message "Consultez le cadastre SPF Finances"

### Micro-tool : dossier-summary

- **Type** : Bouton dans la vue dossier
- **Description** : Genere un resume en 5 bullet points du dossier (type, bien, parties, statut, montants cles)
- **Modele** : claude-haiku-4-5
- **Fallback** : Afficher les champs bruts

---

## 9. Sections Admin Custom

### Section : regulatory-data

- **ID** : `regulatory-data`
- **Label** : Donnees reglementaires
- **Component** : `RegulatoryDataAdmin`
- **Route** : `/admin/regulatory-data`
- **Roles** : APP_ADMIN
- **Features** :
  - Vue d'ensemble des 5 types de donnees avec derniere date de mise a jour
  - Indicateurs : "A jour" / "Expireee" / "Manquante"
  - Lien vers chaque section de detail

### Section : rc-coefficients

- **ID** : `rc-coefficients`
- **Label** : Coefficients RC
- **Component** : `RcCoefficientsAdmin`
- **Route** : `/admin/rc-coefficients`
- **Roles** : APP_ADMIN
- **Features** :
  - Tableau : annee | coefficient | source | date publication
  - Edition inline
  - Formulaire d'ajout (nouvelle annee fiscale)
  - Historique des modifications

### Section : municipal-centimes

- **ID** : `municipal-centimes`
- **Label** : Centimes additionnels
- **Component** : `MunicipalCentimesAdmin`
- **Route** : `/admin/municipal-centimes`
- **Roles** : APP_ADMIN
- **Features** :
  - Tableau filtrable par region et province
  - 581 communes belges (262 wallonnes, 300 flamandes, 19 bruxelloises)
  - Import CSV (colonnes : postalCode, municipality, province, region, municipalCentimes, provincialCentimes)
  - Export CSV
  - Recherche par code postal ou nom de commune

### Section : health-indices

- **ID** : `health-indices`
- **Label** : Indices sante
- **Component** : `HealthIndicesAdmin`
- **Route** : `/admin/health-indices`
- **Roles** : APP_ADMIN
- **Features** :
  - Tableau : mois | indice | source (Statbel) | date publication
  - Graphique d'evolution
  - Formulaire d'ajout (nouveau mois)

---

## 10. Integrations Externes

### Integration : PropTax Engine (v1)

- **But** : Moteur de calcul fiscal (calculateurs, donnees de reference)
- **Type** : Import direct (dependance npm ou copie code)
- **Auth** : Aucune (meme processus)
- **Fallback** : Si le moteur est importe comme package, fallback = les calculateurs sont reimplementes localement

### Integration : Whise CRM (v2)

- **But** : Synchronisation automatique des biens immobiliers depuis Whise
- **Type** : API REST (webhook + polling)
- **Auth** : OAuth2 (Whise API)
- **Env vars** : `WHISE_CLIENT_ID`, `WHISE_CLIENT_SECRET`
- **Fallback** : Import CSV manuel

### Integration : Zoho CRM (v2)

- **But** : Synchronisation biens et contacts depuis Zoho
- **Type** : API REST
- **Auth** : OAuth2 (Zoho)
- **Env vars** : `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET`
- **Fallback** : Import CSV manuel

---

## 11. Donnees Reglementaires

### Pattern DRY

Les donnees reglementaires sont **specifiques a PropTax** (pas partagees avec d'autres apps) et stockees dans la collection `RegulatoryData` (voir section 4).

### Donnees par type

| Type | Volume | Frequence MAJ | Source officielle |
|------|--------|---------------|-------------------|
| `rc-coefficient` | 1 par annee (7 existants : 2020-2026) | Annuelle (janvier) | SPF Finances — Moniteur Belge |
| `health-index` | 1 par mois (~84 existants) | Mensuelle | Statbel (indice sante) |
| `registration-rate` | 3 regions × N regles | Rare (changement legislatif) | Code des droits d'enregistrement |
| `municipal-centimes` | ~581 communes | Annuelle | Regions (decrets budgetaires) |
| `provincial-centimes` | ~10 provinces | Annuelle | Regions |

### Mise a jour

- **Responsable** : PLATFORM_ADMIN (IT-Transform)
- **Procedure** : admin dashboard > section reglementaire > saisie/import > publication
- **Validation** : fourchette plausible (coefficient RC entre 1.0 et 3.0, indice sante entre 100 et 200, centimes entre 0 et 5000)
- **Audit** : chaque modification est logguee avec l'auteur et la source

### Seed data initiales

Le moteur standalone contient deja les donnees 2020-2026. Elles sont importees au premier deploiement dans la collection `RegulatoryData`.

---

## 12. Glossaire Metier

| # | Terme | Definition |
|---|-------|-----------|
| 1 | **RC (Revenu Cadastral)** | Revenu fictif annuel attribue a un bien immobilier, fixe sur base des valeurs locatives de 1975. C'est la base de calcul du precompte immobilier. |
| 2 | **RC indexe** | RC de base multiplie par le coefficient d'indexation annuel publie par le SPF Finances. Utilise pour le calcul de l'impot des personnes physiques. |
| 3 | **Precompte immobilier** | Taxe annuelle sur les biens immobiliers, calculee sur le RC indexe. Comprend une part regionale + centimes additionnels provinciaux et communaux. |
| 4 | **Centimes additionnels** | Surtaxes communales et provinciales appliquees en pourcentage du precompte de base. Varient selon la commune (ex: Mons 2900, Bruxelles-Ville 2950). |
| 5 | **Droits d'enregistrement** | Taxe payee lors de l'achat d'un bien immobilier. Le taux varie par region : 12.5% en Wallonie/Bruxelles, 12% en Flandre (taux pleins). |
| 6 | **Abattement** | Reduction de la base imposable pour l'habitation unique et propre. Ex: 20 000 EUR en Wallonie, 175 000 EUR a Bruxelles. |
| 7 | **Indexation du loyer** | Ajustement annuel du loyer base sur la formule : loyer_base x (nouvel_indice / indice_depart). Art. 1728bis du Code civil. |
| 8 | **Indice sante** | Indice des prix a la consommation hors tabac, alcool, essence et diesel. Publie mensuellement par Statbel. Base de l'indexation des loyers. |
| 9 | **Plus-value immobiliere** | Gain realise lors de la revente d'un bien. Imposable a 16.5% si la revente a lieu dans les 5 ans (bien bati) ou 8 ans (terrain). Exoneree pour la residence principale. |
| 10 | **Garantie locative** | Depot de garantie du locataire, plafonne par la loi : 2 mois de loyer (compte bloque) ou 3 mois (garantie bancaire). Art. 10 § 1 de la loi sur les baux. |
| 11 | **Preavis** | Delai legal avant resiliation du bail. Varie selon le type de bail, l'initiateur (locataire/bailleur) et le triennat en cours. |
| 12 | **Triennat** | Periode de 3 ans dans un bail de residence principale de 9 ans. Le bailleur ne peut resilier qu'a la fin d'un triennat (sauf motif personnel). |
| 13 | **Bail de residence principale** | Contrat de location protege par la loi belge du 20 fevrier 1991. Duree par defaut : 9 ans. Renouvellement et resiliation strictement encadres. |
| 14 | **PEB (Performance Energetique du Batiment)** | Certificat obligatoire pour toute mise en vente ou location d'un bien. Score de A++ (excellent) a G (mauvais). Delivre par un certificateur agree. |

---

## 13. Exigences Crash-Test (UX & terrain)

### Profils visuels — 3 themes selectionnables par tenant

> **Implementation** : Les 3 themes sont declares comme des objets `Theme` dans `@saas/theme`
> (`packages/theme/src/profiles/proptax-*.ts`). Le `ThemeProvider` de `@saas/theme` injecte
> les CSS variables sur `:root`. Le choix du theme par tenant utilise le mecanisme
> `TenantThemeOverride` existant. Voir `packages/theme/CLAUDE.md` pour le format exact.
> Les CSS variables ci-dessous correspondent aux tokens `@saas/theme` (colors, typography, spacing).

Chaque tenant (agence) peut choisir parmi 3 themes. Chaque theme inclut un mode light et dark.

#### Theme A — "Belgian Authority"

Style : minimalist, serieux, institutionnel, confiance.

```css
/* Mode light */
:root[data-theme="proptax-belgian-authority"] {
  --color-primary: #1B4F72;
  --color-primary-hover: #154360;
  --color-secondary: #2C3E50;
  --color-accent: #D4A017;
  --color-danger: #C0392B;
  --color-success: #27AE60;
  --color-warning: #F39C12;
  --color-background: #F0F3F5;
  --color-surface: #FFFFFF;
  --color-border: #D5D8DC;
  --color-text: #1A1A2E;
  --color-text-secondary: #6B7280;
  --color-muted: #6B7280;
  --font-heading: 'Source Sans 3', sans-serif;
  --font-body: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
  --shadow-md: 0 2px 4px rgba(0,0,0,0.08);
  --shadow-lg: 0 4px 8px rgba(0,0,0,0.10);
  --spacing-density: 1;
  --touch-target-min: 44px;
}

/* Mode dark */
:root[data-theme="proptax-belgian-authority"][data-mode="dark"] {
  --color-primary: #5DADE2;
  --color-primary-hover: #3498DB;
  --color-secondary: #85929E;
  --color-accent: #F1C40F;
  --color-background: #0F172A;
  --color-surface: #1E293B;
  --color-border: #334155;
  --color-text: #E2E8F0;
  --color-text-secondary: #94A3B8;
  --color-muted: #64748B;
}
```

- **Icones** : Lucide outline
- **Mood** : serieux, fiable, officiel
- **Inspiration** : sites gouvernementaux belges, portails notariaux

#### Theme B — "Immo Fresh"

Style : bento grid, moderne, propre, efficace.

```css
/* Mode light */
:root[data-theme="proptax-immo-fresh"] {
  --color-primary: #0D9488;
  --color-primary-hover: #0F766E;
  --color-secondary: #1E40AF;
  --color-accent: #7C3AED;
  --color-danger: #EF4444;
  --color-success: #10B981;
  --color-warning: #F59E0B;
  --color-background: #FAFAFA;
  --color-surface: #FFFFFF;
  --color-border: #E5E7EB;
  --color-text: #18181B;
  --color-text-secondary: #52525B;
  --color-muted: #71717A;
  --font-heading: 'Inter', sans-serif;
  --font-body: 'IBM Plex Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius-sm: 8px;
  --radius-md: 16px;
  --radius-lg: 24px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.06);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
  --spacing-density: 1;
  --touch-target-min: 44px;
}

/* Mode dark */
:root[data-theme="proptax-immo-fresh"][data-mode="dark"] {
  --color-primary: #2DD4BF;
  --color-primary-hover: #14B8A6;
  --color-secondary: #60A5FA;
  --color-accent: #A78BFA;
  --color-background: #09090B;
  --color-surface: #18181B;
  --color-border: #27272A;
  --color-text: #FAFAFA;
  --color-text-secondary: #D4D4D8;
  --color-muted: #A1A1AA;
}
```

- **Icones** : Phosphor duotone
- **Mood** : moderne, efficace, technologique
- **Inspiration** : Notion, Linear, apps SaaS modernes

#### Theme C — "Terra Notarial"

Style : classic elevated, premium, chaud, rassurant.

```css
/* Mode light */
:root[data-theme="proptax-terra-notarial"] {
  --color-primary: #78350F;
  --color-primary-hover: #92400E;
  --color-secondary: #92400E;
  --color-accent: #059669;
  --color-danger: #DC2626;
  --color-success: #16A34A;
  --color-warning: #CA8A04;
  --color-background: #FFFBEB;
  --color-surface: #FFFFFF;
  --color-border: #D6D3D1;
  --color-text: #1C1917;
  --color-text-secondary: #57534E;
  --color-muted: #78716C;
  --font-heading: 'Playfair Display', serif;
  --font-body: 'Lato', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  --radius-sm: 1px;
  --radius-md: 2px;
  --radius-lg: 4px;
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.04);
  --shadow-md: 0 2px 4px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.04);
  --shadow-lg: 0 4px 8px rgba(0,0,0,0.06), 0 8px 16px rgba(0,0,0,0.06), 0 16px 32px rgba(0,0,0,0.04);
  --spacing-density: 1;
  --touch-target-min: 44px;
}

/* Mode dark */
:root[data-theme="proptax-terra-notarial"][data-mode="dark"] {
  --color-primary: #D97706;
  --color-primary-hover: #F59E0B;
  --color-secondary: #FBBF24;
  --color-accent: #34D399;
  --color-background: #1C1917;
  --color-surface: #292524;
  --color-border: #44403C;
  --color-text: #FAFAF9;
  --color-text-secondary: #D6D3D1;
  --color-muted: #A8A29E;
}
```

- **Icones** : Lucide solid
- **Mood** : premium, traditionnel, rassurant
- **Inspiration** : etudes notariales, cabinets d'avocats premium

### Exigences UX transversales

- **copyTone** : `trustworthy` — formel, rassurant, pas de jargon inutile, vouvoiement
- **EmptyState** : obligatoire sur chaque vue liste (dossiers, calculs, documents, biens)
- **OnboardingChecklist** : 4 etapes (profil, premier calcul, premier dossier, inviter equipe)
- **Disclaimer legal** : present sur CHAQUE resultat de calcul — "Ce calcul est indicatif et ne constitue pas un avis fiscal officiel."
- **HelpTooltip** : sur chaque terme technique (RC, centimes, abattement, PEB...)
- **Landing page** : publique, meme en mode invite-only
- **Mode offline** : non requis en v1 (usage bureau)
- **PWA** : non requis en v1
- **Accessibilite** : WCAG AA, contraste >= 4.5:1, focus visible, navigation clavier
- **Selecteur de langue** : visible dans le header (FR, NL, DE)
- **Selecteur de theme** : dans les parametres agence (AGENCY_ADMIN seulement)

---

## 14. Hors Scope (v1)

| Feature | Version cible | Raison |
|---------|--------------|--------|
| Integration Whise CRM | v2 | Necesssite OAuth2 + webhook infrastructure |
| Integration Zoho CRM | v2 | Idem |
| API MyMINFIN (SPF Finances) | v2 | API gouvernementale complexe, disponibilite incertaine |
| Import cadastre automatise | v2 | Dependance API SPF Finances |
| Rapprochement IPP cadre III | v2 | Complexite fiscale elevee |
| Signature eIDAS | v2 | Infrastructure PKI, ItsMe integration |
| Indivision / copropriete / demembrement | v2 | Regles fiscales tres complexes, cas d'usage minoritaire |
| Multi-devise Luxembourg | v2 | EUR ok, mais termes legaux differents (impot foncier vs precompte) |
| Mode offline / PWA | v2 | Usage bureau principalement |
| Hardware integration | Non prevu | Pas de peripherique physique dans ce domaine |
| Gamification | Non prevu | Public professionnel serieux, pas adapte |
| Social features / rating | Non prevu | B2B pur, pas de dimension sociale |
| Resume IA narratif dans documents | v2 | AI enhancement — generer un texte resume dans les DOCX |
| Recherche langage naturel dans dossiers | v2 | AI enhancement — semantic search |
| Alertes veille reglementaire IA | v2 | AI enhancement — monitoring des changements legislatifs |

---

## 15. Definition of Done

### Code

- [ ] Architecture : `apps/proptax/` dans le monorepo saas-platform
- [ ] Tous les modeles Mongoose avec `tenantId` + `appId` + index composites
- [ ] 7 routes calculateurs fonctionnelles (appel moteur + sauvegarde)
- [ ] CRUD complet biens, dossiers, documents, calculs
- [ ] Generation DOCX/PDF via `@saas/storage`
- [ ] Import CSV de dossiers via `@saas/core/import-export`
- [ ] Export CSV/JSON/XLSX
- [ ] Agent IA `tax-advisor` avec 4 tools
- [ ] Micro-tools : address-autocomplete, rc-suggestion, dossier-summary
- [ ] 4 sections admin custom (regulatory-data, rc-coefficients, municipal-centimes, health-indices)
- [ ] Frontend React : dashboard, calculateurs, dossiers, documents, settings, landing
- [ ] 3 themes visuels (Belgian Authority, Immo Fresh, Terra Notarial) avec dark/light
- [ ] Aucun `any`, aucun `console.log`, aucune couleur hardcodee
- [ ] app.yaml valide (schema Zod)

### Metier

- [ ] Les 7 calculateurs produisent des resultats corrects (verification manuelle avec cas reels)
- [ ] Les 3 regions belges (Wallonie, Flandre, Bruxelles) sont couvertes
- [ ] Les donnees reglementaires 2020-2026 sont chargees
- [ ] Le disclaimer legal est affiche sur chaque resultat
- [ ] Le glossaire contient au moins 14 termes
- [ ] Les documents generes contiennent les bonnes donnees
- [ ] Les quotas par plan sont respectes (calculs/jour, dossiers, documents)

### Tests

- [ ] Tests Vitest : routes, services, isolation tenant, RBAC, tools IA
- [ ] Coverage >= 80% sur les routes et services
- [ ] Tests d'isolation tenant (un tenant ne voit pas les dossiers d'un autre)
- [ ] Tests RBAC (MEMBER ne peut pas acceder a l'admin, AGENT ne voit que ses dossiers sauf AGENCY_ADMIN)
- [ ] Tests calculateurs (resultats connus pour chaque region)
- [ ] Tests E2E Playwright : onboarding flow, calcul complet, creation dossier, generation document

### Compliance

- [ ] Audit log sur chaque creation/modification/suppression
- [ ] Retention legale 7 ans pour les documents fiscaux
- [ ] GDPR : export tenant, droit a l'effacement
- [ ] Accessibilite WCAG AA (Lighthouse >= 90)
- [ ] SEO landing page (title, meta, OG tags, structured data)
- [ ] Securite : security scan 0 CRITICAL, 0 HIGH

### Pre-launch

- [ ] Test agents : min 3 personas (directeur agence, agent terrain, back-office)
- [ ] Score UX moyen >= 7/10
- [ ] Demo on-demand configuree (seed data + quick demo + personal demo)
- [ ] FAQ publique avec au moins 10 questions
- [ ] Checklist QA metier completee
- [ ] Expert fiscal valide les resultats des 7 calculateurs (budget ~500 EUR)

---

## Annexe A : Acceptance Criteria principaux

### AC-001 : Calcul droits d'enregistrement Wallonie

Etant donne un achat a 250 000 EUR en Wallonie, habitation unique, non modeste,
quand je soumets le calcul de droits d'enregistrement,
alors le taux est 12.5%, l'abattement est 20 000 EUR, la base taxable est 230 000 EUR, les droits sont 28 750 EUR.

### AC-002 : Calcul precompte immobilier

Etant donne un RC de 1 500 EUR, code postal 7000 (Mons), annee 2026,
quand je soumets le calcul de precompte immobilier,
alors le resultat inclut le RC indexe, la part regionale, la part provinciale (Hainaut) et la part communale (Mons).

### AC-003 : Indexation loyer

Etant donne un loyer de base de 800 EUR, indice depart 111.36, nouvel indice 130.67,
quand je soumets le calcul d'indexation,
alors le loyer indexe est 800 x (130.67 / 111.36) = 938.76 EUR (arrondi au centime).

### AC-004 : Isolation tenant

Etant donne deux agences (tenant A et tenant B) dans PropTax,
quand l'agent du tenant A liste ses dossiers,
alors il ne voit aucun dossier du tenant B.

### AC-005 : Quota calculs plan Starter

Etant donne un tenant sur le plan Starter (3 calculs/jour),
quand l'agent effectue un 4e calcul dans la meme journee,
alors une erreur 429 est retournee avec le message "Quota depasse" et un lien d'upgrade.

### AC-006 : Generation document DOCX

Etant donne un dossier de location complet (bien, parties, loyer, calcul indexation),
quand je genere une quittance de loyer DOCX,
alors le fichier telecharge contient le nom du locataire, le montant, la periode et le cachet de l'agence.

### AC-007 : Agent IA avec contexte dossier

Etant donne un dossier de vente ouvert avec un bien a Bruxelles,
quand je demande a l'agent IA "Quel est le precompte estime ?",
alors l'agent utilise le tool `calculate_tax` avec le RC du bien et le code postal, et affiche le resultat avec la source legale.
