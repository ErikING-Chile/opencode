import type { Bot, Context } from "grammy"
import { getSession, deleteSession, createSession, getAllSessions } from "../session"

const WELCOME_MESSAGE = `👋 *Welcome to Arche AI!*

I'm your AI coding assistant, integrated right into Telegram.

*Available Commands:*

/start - Show this welcome message
/new - Create a new session
/end - End the current session
/help - Show available commands

*How it works:*
• Just send me any message to start a conversation
• I'll create a session for you automatically
• Use /new to start fresh with a new session
• Use /end when you're done

Let's get started! 🚀`

const HELP_MESSAGE = `📚 *Available Commands*

/start - Show welcome message and get started
/new - Create a new session (ends current one if exists)
/end - End current session and clear context
/help - Show this help message

*Tips:*
• Just send me any message to continue your session
• Each chat has its own independent session
• Your session persists until you use /end`

export function registerCommandHandlers(bot: Bot<Context>): void {
  bot.command("start", async (ctx) => {
    await ctx.reply(WELCOME_MESSAGE, { parse_mode: "Markdown" })
  })

  bot.command("help", async (ctx) => {
    await ctx.reply(HELP_MESSAGE, { parse_mode: "Markdown" })
  })

  bot.command("new", async (ctx) => {
    const chatId = ctx.chat.id
    const messageId = ctx.message.message_id

    const existingSession = getSession(chatId)
    if (existingSession) {
      deleteSession(chatId)
      await ctx.reply("🔄 Ending previous session and creating a new one...", { parse_mode: "Markdown" })
    }

    const session = await createSession(chatId, messageId)
    if (!session) {
      await ctx.reply("❌ Sorry, I had trouble creating a session. Please try again.")
      return
    }

    const shareUrl = (session as any).shareUrl
    if (shareUrl) {
      await ctx.reply(`✅ *New session created!*\n\nYou can view your session here: ${shareUrl}`, {
        parse_mode: "Markdown",
        reply_to_message_id: messageId,
      })
    } else {
      await ctx.reply("✅ *New session created!*", { parse_mode: "Markdown" })
    }
  })

  bot.command("end", async (ctx) => {
    const chatId = ctx.chat.id
    const deleted = deleteSession(chatId)

    if (deleted) {
      await ctx.reply("👋 *Session ended!*\n\nUse /new to start a fresh session, or just send me a message.", {
        parse_mode: "Markdown",
      })
    } else {
      await ctx.reply("ℹ️ No active session to end. Use /new to create one!", { parse_mode: "Markdown" })
    }
  })
}
