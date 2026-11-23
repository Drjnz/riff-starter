import { readFile } from 'node:fs/promises'
import { parse } from '@iarna/toml'
import type { RateLimitConfig } from '../domain/rate-limit/rate-limiter-factory.ts'

export async function loadRateLimitConfig(
  filePath = 'config/rate-limit.toml',
): Promise<RateLimitConfig> {
  const content = await readFile(filePath, 'utf-8')
  const parsed = parse(content) as Record<string, unknown>

  if (parsed.strategy === 'fixed-window') {
    if (
      !Number.isInteger(parsed.limit) ||
      !Number.isInteger(parsed.windowMs) ||
      (parsed.limit as number) < 1 ||
      (parsed.windowMs as number) < 1
    ) {
      throw new Error('Invalid fixed-window configuration')
    }

    return {
      strategy: 'fixed-window',
      limit: parsed.limit as number,
      windowMs: parsed.windowMs as number,
    }
  }

  if (parsed.strategy === 'sliding-window') {
    if (
      !Number.isInteger(parsed.limit) ||
      !Number.isInteger(parsed.windowMs) ||
      (parsed.limit as number) < 1 ||
      (parsed.windowMs as number) < 1
    ) {
      throw new Error('Invalid sliding-window configuration')
    }

    return {
      strategy: 'sliding-window',
      limit: parsed.limit as number,
      windowMs: parsed.windowMs as number,
    }
  }

  if (parsed.strategy === 'token-bucket') {
    if (
      !Number.isInteger(parsed.capacity) ||
      !Number.isFinite(parsed.refillRate) ||
      !Number.isInteger(parsed.refillIntervalMs) ||
      (parsed.capacity as number) < 1 ||
      (parsed.refillRate as number) <= 0 ||
      (parsed.refillIntervalMs as number) < 1
    ) {
      throw new Error('Invalid token-bucket configuration')
    }

    return {
      strategy: 'token-bucket',
      capacity: parsed.capacity as number,
      refillRate: parsed.refillRate as number,
      refillIntervalMs: parsed.refillIntervalMs as number,
    }
  }

  throw new Error('Unknown rate-limit strategy')
}