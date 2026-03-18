import { Bot, type Context } from "grammy"
import { initOpencode, startToolEventListener } from "./session"
import { registerCommandHandlers } from "./handlers/commands"
import { registerMessageHandlers } from "./handlers/message"

export interface TelegramEnv {
  TELEGRAM_BOT_TOKEN: string
}

export function createBot(token: string): Bot<Context> {
  const bot = new Bot<Context>(token)

  registerCommandHandlers(bot)
  registerMessageHandlers(bot)

  bot.use(async (ctx, next) => {
    console.log("📡 Received update:", ctx.update.update_id)
    await next()
  })

  return bot
}

export async function startBot(): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN environment variable is required")
  }

  console.log("🔧 Bot configuration:")
  console.log("- Bot token present:", !!token)

  await initOpencode()

  const bot = createBot(token)

  startToolEventListener(bot).catch((err) => {
    console.error("❌ Error in tool event listener:", err)
  })

  await bot.start()
  console.log("⚡️ Telegram bot is running!")
}
