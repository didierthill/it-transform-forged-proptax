// ──────────────────────────────────────────────
// PropTax Engine — Fastify Server
// Mode dégradé : sans MONGODB_URI, seules les
// couches Calcul et Documents démarrent
// ──────────────────────────────────────────────

import Fastify from 'fastify'
import cors from '@fastify/cors'
import swagger from '@fastify/swagger'
import swaggerUi from '@fastify/swagger-ui'
import rateLimit from '@fastify/rate-limit'

import { registerCalculRoutes } from './routes/calcul.js'
import { registerDocumentRoutes } from './routes/documents.js'
import { apiKeyAuth } from './middleware/api-key-auth.js'
import { PropTaxError } from './errors.js'

const PORT = Number(process.env.PORT ?? 3400)
const HOST = process.env.HOST ?? '0.0.0.0'
const MONGODB_URI = process.env.MONGODB_URI
const LOG_LEVEL = process.env.LOG_LEVEL ?? 'info'

export async function buildServer() {
  const app = Fastify({
    logger: {
      level: LOG_LEVEL,
      transport:
        process.env.NODE_ENV !== 'production'
          ? { target: 'pino-pretty', options: { translateTime: 'HH:MM:ss', ignore: 'pid,hostname' } }
          : undefined,
    },
  })

  // ── Plugins ──

  await app.register(cors, { origin: true })

  await app.register(rateLimit, {
    max: Number(process.env.RATE_LIMIT_MAX ?? 100),
    timeWindow: '1 minute',
    keyGenerator: (req) => {
      // Rate limit per API key, fallback to IP
      return (req.headers['x-api-key'] as string) ?? req.ip
    },
  })

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'PropTax Engine',
        description: 'Moteur de calcul fiscal immobilier belge — API headless MIT',
        version: '0.1.0',
      },
      components: {
        securitySchemes: {
          apiKey: {
            type: 'apiKey',
            name: 'X-API-Key',
            in: 'header',
          },
        },
      },
      security: [{ apiKey: [] }],
    },
  })

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: { docExpansion: 'list', deepLinking: true },
  })

  // ── Auth middleware ──

  app.addHook('onRequest', apiKeyAuth)

  // ── Error handler ──

  app.setErrorHandler((error: Error & { statusCode?: number; validation?: unknown }, _request, reply) => {
    if (error instanceof PropTaxError) {
      return reply.status(error.statusCode).send(error.toJSON())
    }

    // Rate limit errors from @fastify/rate-limit
    if (error.statusCode === 429) {
      return reply.status(429).send({
        error: 'RATE_LIMIT_EXCEEDED',
        message: 'Trop de requêtes. Réessayez dans une minute.',
        statusCode: 429,
      })
    }

    // Validation errors from Fastify (Zod)
    if (error.validation) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: error.message,
        statusCode: 400,
      })
    }

    app.log.error(error)
    return reply.status(500).send({
      error: 'INTERNAL_ERROR',
      message: 'Erreur interne du serveur',
      statusCode: 500,
    })
  })

  // ── Health check (no auth) ──

  app.get('/health', { config: { skipAuth: true } }, async () => {
    return {
      status: 'ok',
      version: '0.1.0',
      layers: {
        calcul: true,
        documents: true,
        dossiers: !!MONGODB_URI,
      },
    }
  })

  // ── Routes — Couche Calcul (stateless) ──

  await app.register(registerCalculRoutes, { prefix: '/api/v1/calcul' })

  // ── Routes — Couche Documents (stateless) ──

  await app.register(registerDocumentRoutes, { prefix: '/api/v1/documents' })

  // ── Routes — Couche Dossiers (requires MongoDB) ──

  if (MONGODB_URI) {
    const mongoose = await import('mongoose')
    try {
      await mongoose.default.connect(MONGODB_URI)
      app.log.info('MongoDB connecté')

      const { registerDossierRoutes } = await import('./routes/dossiers.js')
      await app.register(registerDossierRoutes, { prefix: '/api/v1/dossiers' })
    } catch (err) {
      app.log.error(err, 'Échec connexion MongoDB — couche Dossiers désactivée')
    }

    app.addHook('onClose', async () => {
      await mongoose.default.disconnect()
    })
  } else {
    app.log.warn('MONGODB_URI non défini — couche Dossiers désactivée (mode dégradé)')
  }

  return app
}

// ── Start ──

async function start() {
  const app = await buildServer()

  try {
    await app.listen({ port: PORT, host: HOST })
    app.log.info(`PropTax Engine démarré sur http://${HOST}:${PORT}`)
    app.log.info(`Documentation : http://${HOST}:${PORT}/docs`)
  } catch (err) {
    app.log.fatal(err)
    process.exit(1)
  }
}

start()
