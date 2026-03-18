import { test, expect, describe, vi, beforeEach } from "bun:test"
import { registerCommandHandlers } from "../src/handlers/commands"
import { getAllSessions } from "../src/session"

vi.mock("../src/session", () => ({
  getSession: vi.fn(),
  deleteSession: vi.fn(),
  createSession: vi.fn(),
  getAllSessions: vi.fn(() => new Map()),
}))

describe("command handlers", () => {
  let mockBot: any
  let mockCtx: any

  beforeEach(() => {
    vi.clearAllMocks()
    getAllSessions().clear()

    mockCtx = {
      chat: { id: 12345 },
      message: { message_id: 67890 },
      reply: vi.fn().mockResolvedValue(undefined),
    }

    mockBot = {
      command: vi.fn((_cmd: string, handler: Function) => {
        return mockBot
      }),
    }

    registerCommandHandlers(mockBot)
  })

  test("registers start command", () => {
    expect(mockBot.command).toHaveBeenCalledWith("start", expect.any(Function))
  })

  test("registers help command", () => {
    expect(mockBot.command).toHaveBeenCalledWith("help", expect.any(Function))
  })

  test("registers new command", () => {
    expect(mockBot.command).toHaveBeenCalledWith("new", expect.any(Function))
  })

  test("registers end command", () => {
    expect(mockBot.command).toHaveBeenCalledWith("end", expect.any(Function))
  })

  test("/start sends welcome message", async () => {
    const handlers: Record<string, Function> = {}
    mockBot.command = vi.fn((cmd: string, handler: Function) => {
      handlers[cmd] = handler
      return mockBot
    })
    registerCommandHandlers(mockBot)

    await handlers["start"](mockCtx)

    expect(mockCtx.reply).toHaveBeenCalled()
    const [message] = mockCtx.reply.mock.calls[0]
    expect(message).toContain("Welcome to Arche AI!")
  })

  test("/help sends help message", async () => {
    const handlers: Record<string, Function> = {}
    mockBot.command = vi.fn((cmd: string, handler: Function) => {
      handlers[cmd] = handler
      return mockBot
    })
    registerCommandHandlers(mockBot)

    await handlers["help"](mockCtx)

    expect(mockCtx.reply).toHaveBeenCalled()
    const [message] = mockCtx.reply.mock.calls[0]
    expect(message).toContain("Available Commands")
  })

  test("/end sends session ended message when session exists", async () => {
    const { deleteSession } = await import("../src/session")
    vi.mocked(deleteSession).mockReturnValue(true)

    const handlers: Record<string, Function> = {}
    mockBot.command = vi.fn((cmd: string, handler: Function) => {
      handlers[cmd] = handler
      return mockBot
    })
    registerCommandHandlers(mockBot)

    await handlers["end"](mockCtx)

    expect(deleteSession).toHaveBeenCalledWith(12345)
    expect(mockCtx.reply).toHaveBeenCalled()
    const [message] = mockCtx.reply.mock.calls[0]
    expect(message).toContain("Session ended!")
  })

  test("/end sends no session message when no session exists", async () => {
    const { deleteSession } = await import("../src/session")
    vi.mocked(deleteSession).mockReturnValue(false)

    const handlers: Record<string, Function> = {}
    mockBot.command = vi.fn((cmd: string, handler: Function) => {
      handlers[cmd] = handler
      return mockBot
    })
    registerCommandHandlers(mockBot)

    await handlers["end"](mockCtx)

    expect(deleteSession).toHaveBeenCalledWith(12345)
    expect(mockCtx.reply).toHaveBeenCalled()
    const [message] = mockCtx.reply.mock.calls[0]
    expect(message).toContain("No active session")
  })
})
