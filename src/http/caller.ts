import type { MiddlewareHandler } from 'hono'
import { Unauthenticated } from './errors.ts'

// LOCAL SIMULATION. These two headers let a single machine pretend to be
// several clients (IP) and several users (userId). In production you would
// never trust them as they are. Identity would come from a verified token
// (JWT, session...) and the IP from a trusted proxy (for example an
// X-Forwarded-For header rewritten by the load balancer).
export const FAKE_CLIENT_IP_HEADER = 'X-Fake-Client-Ip'
export const FAKE_USER_ID_HEADER = 'X-Fake-User-Id'
export const DEFAULT_CLIENT_IP = '127.0.0.1'

export type Caller = {
  ip: string
  userId: string | null
}

export type AppEnv = { Variables: { caller: Caller } }

export function fakeCaller(): MiddlewareHandler<AppEnv> {
  return async (c, next) => {
    c.set('caller', {
      ip: c.req.header(FAKE_CLIENT_IP_HEADER)?.trim() || DEFAULT_CLIENT_IP,
      userId: c.req.header(FAKE_USER_ID_HEADER)?.trim() || null,
    })
    await next()
  }
}

export function requireUserId(caller: Caller): string {
  if (!caller.userId) throw new Unauthenticated(`Header ${FAKE_USER_ID_HEADER} is required`)
  return caller.userId
}
