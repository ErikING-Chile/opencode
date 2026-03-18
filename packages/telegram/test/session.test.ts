import { test, expect, beforeEach, describe, vi } from "bun:test"
import {
  getSession,
  setSession,
  deleteSession,
  getAllSessions,
  type TelegramSession,
} from "../src/session"

describe("session management", () => {
  beforeEach(() => {
    getAllSessions().clear()
  })

  test("setSession and getSession", () => {
    const session: TelegramSession = {
      client: {},
      server: {},
      sessionId: "test-123",
      chatId: 12345,
      messageId: 67890,
    }

    setSession(12345, session)
    const retrieved = getSession(12345)

    expect(retrieved).toBeDefined()
    expect(retrieved?.sessionId).toBe("test-123")
    expect(retrieved?.chatId).toBe(12345)
  })

  test("getSession returns undefined for non-existent chat", () => {
    const result = getSession(99999)
    expect(result).toBeUndefined()
  })

  test("deleteSession removes session", () => {
    const session: TelegramSession = {
      client: {},
      server: {},
      sessionId: "test-123",
      chatId: 12345,
      messageId: 67890,
    }

    setSession(12345, session)
    expect(getSession(12345)).toBeDefined()

    const deleted = deleteSession(12345)
    expect(deleted).toBe(true)
    expect(getSession(12345)).toBeUndefined()
  })

  test("deleteSession returns false for non-existent session", () => {
    const deleted = deleteSession(99999)
    expect(deleted).toBe(false)
  })

  test("getAllSessions returns all sessions", () => {
    const session1: TelegramSession = {
      client: {},
      server: {},
      sessionId: "test-1",
      chatId: 11111,
      messageId: 1,
    }
    const session2: TelegramSession = {
      client: {},
      server: {},
      sessionId: "test-2",
      chatId: 22222,
      messageId: 2,
    }

    setSession(11111, session1)
    setSession(22222, session2)

    const sessions = getAllSessions()
    expect(sessions.size).toBe(2)
    expect(sessions.get("11111")).toBeDefined()
    expect(sessions.get("22222")).toBeDefined()
  })

  test("sessions are isolated by chatId", () => {
    const session1: TelegramSession = {
      client: { name: "client1" },
      server: {},
      sessionId: "test-1",
      chatId: 11111,
      messageId: 1,
    }
    const session2: TelegramSession = {
      client: { name: "client2" },
      server: {},
      sessionId: "test-2",
      chatId: 22222,
      messageId: 2,
    }

    setSession(11111, session1)
    setSession(22222, session2)

    const retrieved1 = getSession(11111)
    const retrieved2 = getSession(22222)

    expect(retrieved1?.client.name).toBe("client1")
    expect(retrieved2?.client.name).toBe("client2")
  })
})
