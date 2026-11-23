import { Scalar } from '@scalar/hono-api-reference'
import type { Hono } from 'hono'
import { openAPIRouteHandler, resolver, validator } from 'hono-openapi'
import type * as v from 'valibot'
import { DEFAULT_CLIENT_IP, FAKE_CLIENT_IP_HEADER, FAKE_USER_ID_HEADER, type AppEnv } from './caller.ts'
import { InvalidInput } from './errors.ts'
import { errorDtoSchema } from './schemas.ts'

export function json(schema: v.GenericSchema, description: string) {
  return { description, content: { 'application/json': { schema: resolver(schema) } } }
}

const errorDescriptions = {
  400: 'Invalid input, slot rule violated, or unknown member',
  401: `Missing ${FAKE_USER_ID_HEADER} header`,
  404: 'Room not found',
  409: 'Slot overlaps an existing booking',
} as const

export function errors(...statuses: (keyof typeof errorDescriptions)[]) {
  return Object.fromEntries(statuses.map((s) => [s, json(errorDtoSchema, errorDescriptions[s])]))
}

// The simulation headers, documented so they can be filled in from /docs.
export const fakeCallerHeaders = [
  {
    in: 'header' as const,
    name: FAKE_CLIENT_IP_HEADER,
    required: false,
    schema: { type: 'string' as const, example: '203.0.113.7' },
    description: `Local simulation of the client IP. Defaults to ${DEFAULT_CLIENT_IP}.`,
  },
  {
    in: 'header' as const,
    name: FAKE_USER_ID_HEADER,
    required: false,
    schema: { type: 'string' as const, example: 'member-1' },
    description: 'Local simulation of the signed-in member. Required to book.',
  },
]

// Validate one part of the request and turn a failure into InvalidInput (-> 400).
export function validate<S extends v.GenericSchema, T extends 'json' | 'query' | 'param'>(target: T, schema: S) {
  return validator<S, T, AppEnv, string>(target, schema, (result) => {
    if (!result.success) {
      const message = result.error.map((issue) => issue.message).join('; ')
      throw new InvalidInput(`Invalid ${target}: ${message}`)
    }
  })
}

export function documentation(app: Hono<AppEnv>) {
  app.get(
    '/openapi.json',
    openAPIRouteHandler(app, {
      documentation: {
        openapi: '3.1.0',
        info: {
          title: 'Studio Riff API',
          version: '1.0.0',
          description: `Rehearsal room bookings. All times are UTC. Identity is simulated with the ${FAKE_USER_ID_HEADER} and ${FAKE_CLIENT_IP_HEADER} headers (local demo only).`,
        },
      },
      exclude: ['/', '/openapi.json', '/docs'],
    }),
  )
  app.get('/docs', Scalar({ url: '/openapi.json' }))
  // The interactive docs are the default page, to try the API from the browser.
  app.get('/', (c) => c.redirect('/docs'))
}
