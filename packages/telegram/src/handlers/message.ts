import type { Bot, Context } from "grammy"
import { getSession, setSession, createSession, getOpencode } from "../session"

export function registerMessageHandlers(bot: Bot<Context>): void {
  bot.on("message:text", async (ctx) => {
    const chat = ctx.chat
    const messageId = ctx.message.message_id
    const text = ctx.message.text

    if (text.startsWith("/")) {
      return
    }

    let session = getSession(chat.id)

    if (!session) {
      console.log("🆕 Creating new Arche session...")
      const newSession = await createSession(chat.id, messageId)

      if (!newSession) {
        await ctx.reply("Sorry, I had trouble creating a session. Please try again.")
        return
      }

      const shareUrl = (newSession as any).shareUrl
      if (shareUrl) {
        await ctx.reply(`🆕 *New session created!*\n\nView here: ${shareUrl}`, {
          parse_mode: "Markdown",
          reply_to_message_id: messageId,
        })
      }

      session = newSession
    }

    console.log("📝 Sending to Arche:", text)

    const result = await session.client.session.prompt({
      path: { id: session.sessionId },
      body: { parts: [{ type: "text", text }] },
    })

    console.log("📤 Arche response:", JSON.stringify(result, null, 2))

    if (result.error) {
      console.error("❌ Failed to send message:", result.error)
      await ctx.reply("Sorry, I had trouble processing your message. Please try again.")
      return
    }

    const response = result.data

    const responseText =
      response.info?.content ||
      response.parts
        ?.filter((p: any) => p.type === "text")
        .map((p: any) => p.text)
        .join("\n") ||
      "I received your message but didn't have a response."

    console.log("💬 Sending response:", responseText)

    await ctx.reply(responseText)
  })
}
