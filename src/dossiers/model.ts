// ──────────────────────────────────────────────
// Dossier — Mongoose Model
// Dossier immobilier (vente ou location)
// ──────────────────────────────────────────────

import mongoose, { Schema, type Document } from 'mongoose'

export interface IParty {
  name: string
  email?: string
  phone?: string
  notary?: string
}

export interface ICalculation {
  type: string
  input: Record<string, unknown>
  result: Record<string, unknown>
  calculatedAt: Date
}

export interface IDossier extends Document {
  reference: string
  type: 'vente' | 'location'
  status: 'draft' | 'active' | 'pending' | 'closed' | 'archived'
  property: {
    address: string
    postalCode: string
    city: string
    region: 'wallonie' | 'flandre' | 'bruxelles'
    cadastralIncome?: number
    type?: 'appartement' | 'maison' | 'studio' | 'garage' | 'terrain' | 'commerce' | 'autre'
  }
  parties: {
    sellers: IParty[]
    buyers: IParty[]
  }
  financial?: {
    askingPrice?: number
    salePrice?: number
    monthlyRent?: number
    charges?: number
    commission?: number
    commissionRate?: number
  }
  calculations: ICalculation[]
  notes?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

const partySchema = new Schema<IParty>(
  {
    name: { type: String, required: true },
    email: String,
    phone: String,
    notary: String,
  },
  { _id: false },
)

const calculationSchema = new Schema<ICalculation>(
  {
    type: { type: String, required: true },
    input: { type: Schema.Types.Mixed, required: true },
    result: { type: Schema.Types.Mixed, required: true },
    calculatedAt: { type: Date, default: Date.now },
  },
  { _id: true },
)

const dossierSchema = new Schema<IDossier>(
  {
    reference: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ['vente', 'location'] },
    status: {
      type: String,
      required: true,
      enum: ['draft', 'active', 'pending', 'closed', 'archived'],
      default: 'draft',
    },
    property: {
      address: { type: String, required: true },
      postalCode: { type: String, required: true },
      city: { type: String, required: true },
      region: { type: String, required: true, enum: ['wallonie', 'flandre', 'bruxelles'] },
      cadastralIncome: Number,
      type: { type: String, enum: ['appartement', 'maison', 'studio', 'garage', 'terrain', 'commerce', 'autre'] },
    },
    parties: {
      sellers: [partySchema],
      buyers: [partySchema],
    },
    financial: {
      askingPrice: Number,
      salePrice: Number,
      monthlyRent: Number,
      charges: Number,
      commission: Number,
      commissionRate: Number,
    },
    calculations: [calculationSchema],
    notes: String,
    tags: [String],
  },
  {
    timestamps: true,
  },
)

// ── Indexes ──

dossierSchema.index({ type: 1, status: 1 })
dossierSchema.index({ 'property.postalCode': 1 })
dossierSchema.index({ 'property.region': 1 })
dossierSchema.index({ reference: 1 }, { unique: true })
dossierSchema.index(
  { reference: 'text', 'property.address': 'text', 'property.city': 'text', notes: 'text' },
  { name: 'dossier_text_search' },
)

export const Dossier = mongoose.model<IDossier>('Dossier', dossierSchema)
