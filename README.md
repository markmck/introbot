# IntroBot

A Discord bot that plays custom audio clips when users join/leave voice channels.

## Setup

1. Clone the repository
2. Copy `config.example.json` to `config.json` and fill in your Discord bot credentials
3. Install dependencies: `npm install`
4. Add audio files to the `/audio` directory
5. Run: `node main.js`

## Discord Bot Setup

1. Create a bot at https://discord.com/developers/applications
2. Enable the following intents:
   - Guilds
   - Guild Voice States
3. Copy the bot token to your `config.json`

## Commands

- `/setintro` - Set your intro clip
- `/setoutro` - Set your outro clip
- `/myclips` - View your current clips
- `/preview` - Preview a clip
- `/listclips` - List all available clips

## License

MIT
