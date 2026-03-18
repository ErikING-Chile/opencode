import { createOpencode, type ToolPart } from "@opencode-ai/sdk"

export interface TelegramSession {
  client: any
  server: any
  sessionId: string
  chatId: number
  messageId: number
}

const sessions = new Map<string, TelegramSession>()

let opencode: Awaited<ReturnType<typeof createOpencode>> | null = null

export async function initOpencode() {
  if (opencode) return opencode

  console.log("🚀 Starting Arche server...")
  opencode = await createOpencode({
    port: 0,
  })
  console.log("✅ Arche server ready")

  return opencode
}

export function getOpencode() {
  return opencode
}

export function getSession(chatId: number): TelegramSession | undefined {
  return sessions.get(`${chatId}`)
}

export function setSession(chatId: number, session: TelegramSession): void {
  sessions.set(`${chatId}`, session)
}

export function deleteSession(chatId: number): boolean {
  return sessions.delete(`${chatId}`)
}

export function getAllSessions(): Map<string, TelegramSession> {
  return sessions
}

export async function createSession(chatId: number, messageId: number): Promise<TelegramSession | null> {
  const oc = await initOpencode()
  const { client, server } = oc

  const createResult = await client.session.create({
    body: { title: `Telegram chat ${chatId}` },
  })

  if (createResult.error) {
    console.error("❌ Failed to create session:", createResult.error)
    return null
  }

  console.log("✅ Created Arche session:", createResult.data.id)

  const session: TelegramSession = {
    client,
    server,
    sessionId: createResult.data.id,
    chatId,
    messageId,
  }

  sessions.set(`${chatId}`, session)

  const shareResult = await client.session.share({ path: { id: createResult.data.id } })
  if (!shareResult.error && shareResult.data) {
    const sessionUrl = shareResult.data.share?.url!
    console.log("🔗 Session shared:", sessionUrl)
    return { ...session, shareUrl: sessionUrl }
  }

  return session
}

export async function startToolEventListener(bot: any): Promise<void> {
  const oc = await initOpencode()

  const events = await oc.client.event.subscribe()
  for await (const event of events.stream) {
    if (event.type === "message.part.updated") {
      const part = event.properties.part
      if (part.type === "tool") {
        for (const [sessionKey, session] of sessions.entries()) {
          if (session.sessionId === part.sessionID) {
            await handleToolUpdate(part, session.chatId, session.messageId, bot)
            break
          }
        }
      }
    }
  }
}

async function handleToolUpdate(part: ToolPart, chatId: number, messageId: number, bot: any): Promise<void> {
  if (part.state.status !== "completed") return
  const toolMessage = `*${part.tool}* - ${part.state.title}`
  await bot.api.sendMessage(chatId, toolMessage, { reply_to_message_id: messageId }).catch(() => {})
}
