import { test, expect, describe, vi, beforeEach } from "bun:test"
import { createBot } from "../src/bot"

describe("bot initialization", () => {
  test("createBot creates a bot with token", () => {
    const mockToken = "test-token-123"
    const bot = createBot(mockToken)

    expect(bot).toBeDefined()
  })

  test("createBot registers command handlers", () => {
    const mockToken = "test-token-123"
    const bot = createBot(mockToken)

    const middlewareCount = bot.middlewares.length
    expect(middlewareCount).toBeGreaterThan(0)
  })

  test("createBot handles different tokens", () => {
    const bot1 = createBot("token-1")
    const bot2 = createBot("token-2")

    expect(bot1).not.toBe(bot2)
  })
})
