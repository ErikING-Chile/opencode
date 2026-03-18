# @arche-ai/telegram-bot

Telegram bot integration for Arche that enables users to interact via Telegram chat.

## Setup

1. Create a bot at https://t.me/BotFather on Telegram
2. Get your bot token from BotFather
3. Copy `.env.example` to `.env` and add your bot token

## Usage

```bash
# From the telegram package directory
cd packages/telegram

# Run the bot
bun dev
```

The bot will respond to messages in chats where it's added, creating separate Arche sessions for each conversation.

## Commands

- `/start` - Show welcome message
- `/new` - Create a new session
- `/end` - End current session
- `/help` - Show available commands

## Example Usage

### Starting a conversation

1. Open Telegram and send `/start` to your bot
2. The bot will welcome you and explain how to use it
3. Send any message to start an Arche session
4. The bot will create a session and provide a shareable link

### Continuing a conversation

Simply send another message - the bot remembers your session and continues the conversation.

### Ending a session

Send `/end` to close the current session and clear context.

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather | Yes |

## Development

```bash
# Run tests
bun test

# Type check
bun run typecheck
```