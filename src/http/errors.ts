import type { Context } from 'hono'
import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'
import { InvalidSlot, RoomNotFound, SlotTaken, UnknownMember } from '../domain/errors.ts'

// Errors owned by the HTTP layer.
export class InvalidInput extends Error {
  readonly code = 'INVALID_INPUT'
}

export class Unauthenticated extends Error {
  readonly code = 'UNAUTHENTICATED'
}

export type ErrorBody = { error: { code: string; message: string } }

const body = (code: string, message: string): ErrorBody => ({ error: { code, message } })

// The only place that decides the HTTP status of an error.
type CodedError = Error & { readonly code: string }
const statusByError: [abstract new (...args: never[]) => CodedError, ContentfulStatusCode][] = [
  [InvalidInput, 400],
  [InvalidSlot, 400],
  [Unauthenticated, 403],
  [RoomNotFound, 400],
  [UnknownMember, 400],
  [SlotTaken, 409],
]

export function handleError(error: Error, c: Context) {
  for (const [type, status] of statusByError) {
    if (error instanceof type) return c.json(body(error.code, error.message), status)
  }
  if (error instanceof HTTPException && error.status < 500) {
    // e.g. a malformed JSON body rejected by Hono's validator.
    return c.json(body('INVALID_INPUT', error.message), error.status as ContentfulStatusCode)
  }
  console.error(error)
  return c.json(body('INTERNAL_ERROR', 'An unexpected error occurred'), 500)
}

export function handleNotFound(c: Context) {
  return c.json(body('NOT_FOUND', `No route for ${c.req.method} ${c.req.path}`), 404)
}
