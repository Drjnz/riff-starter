import { describe, expect, test } from 'vitest'
import { writeFile, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { loadRateLimitConfig } from '../src/adapters/rate-limit-config.ts'

const testDir = join(process.cwd(), 'test', 'tmp-rate-limit')

describe('RateLimitConfig', () => {
  test('loads a valid fixed-window configuration', async () => {
    await mkdir(testDir, { recursive: true })

    const filePath = join(testDir, 'valid.toml')

    await writeFile(
      filePath,
      'strategy = "fixed-window"\nlimit = 30\nwindowMs = 60000',
    )

    const config = await loadRateLimitConfig(filePath)

    expect(config).toEqual({
      strategy: 'fixed-window',
      limit: 30,
      windowMs: 60000,
    })

    await rm(testDir, { recursive: true, force: true })
  })

  test('rejects an invalid configuration', async () => {
    await mkdir(testDir, { recursive: true })

    const filePath = join(testDir, 'invalid.toml')

    await writeFile(
      filePath,
      'strategy = "fixed-window"\nlimit = -1\nwindowMs = 60000',
    )

    await expect(loadRateLimitConfig(filePath))
      .rejects.toThrow('Invalid fixed-window configuration')

    await rm(testDir, { recursive: true, force: true })
  })

  test('rejects an unknown strategy', async () => {
    await mkdir(testDir, { recursive: true })

    const filePath = join(testDir, 'unknown.toml')

    await writeFile(
      filePath,
      'strategy = "unknown"\nlimit = 30',
    )

    await expect(loadRateLimitConfig(filePath))
      .rejects.toThrow('Unknown rate-limit strategy')

    await rm(testDir, { recursive: true, force: true })
  })
})