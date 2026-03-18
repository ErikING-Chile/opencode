import type { Bot, Context } from "grammy"
import type { ToolPart } from "@opencode-ai/sdk"
import { getAllSessions } from "../session"

export function createToolUpdateHandler(bot: Bot<Context>) {
  return async (part: ToolPart): Promise<void> => {
    if (part.state.status !== "completed") return

    const sessions = getAllSessions()
    const toolMessage = `*${part.tool}* - ${part.state.title}`

    for (const [, session] of sessions) {
      if (session.sessionId === part.sessionID) {
        await bot.api
          .sendMessage(session.chatId, toolMessage, { reply_to_message_id: session.messageId })
          .catch(() => {})
        break
      }
    }
  }
}
