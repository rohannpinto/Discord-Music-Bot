DISCLAIMER: By using HarambeBot or a copied version of this repo, you are agreeing to the bot's original [Terms of Service](https://docs.google.com/document/d/1YKQpZLua-HrpnGxKSBiiUYrGd31H7ar9ymMVX9adw4A/edit?usp=sharing) and [Privacy Policy](https://docs.google.com/document/d/1W7LMOhB9cl5tsNIUMlVhR4tOGH8CJb3yCv8FVnt9Jyk/edit?usp=sharing). HarambeBot (the bot) is a Personal Use Discord Music Bot that utilizes Kenku FM's computer application to pass any audio generated from any valid URL to any channel (with permissions) in any Discord server (with permissions).

HOW IT WORKS:

Kenku FM is the audio client: it logs into Discord with the bot token, sits in a voice channel, and streams whatever it plays (local playlists or its built-in browser tabs) into that channel. This bot adds the traditional music-bot command layer on top: slash commands like `/play` are received by the bot process and forwarded to the local Kenku FM instance over its Remote API (`http://127.0.0.1:3333/v1`). Because audio always plays through Kenku (official web players, ads included), the setup stays TOS-compliant.

```
Discord user ──/play──▶ HarambeBot (node) ──HTTP──▶ Kenku FM (local app) ──audio──▶ Discord voice channel
```

SETUP:

1. Set up your Personal Use Bot | Guide: https://discordjs.guide/preparations/setting-up-a-bot-application.html
2. Connect your bot to the server | Guide: https://discordjs.guide/preparations/adding-your-bot-to-servers.html
3. Download Kenku FM | Website: https://www.kenku.fm/
4. Connect your Bot to Kenku FM | Guide: https://www.youtube.com/watch?v=gLxX-UYD4EU
5. In Kenku FM, enable the Remote API: Settings → Remote → Enabled (leave the default address `127.0.0.1:3333`)
6. Download this bot's repo to a local directory and run `npm install` in it (requires Node 18+)
7. Edit `config.json`:

```json
{
    "token": "YOUR BOT TOKEN",
    "clientId": "YOUR APPLICATION ID (Developer Portal → your app → General Information)",
    "guildId": "YOUR SERVER ID (right-click server → Copy Server ID)",
    "remote": "http://127.0.0.1:3333/v1",
    "kenkuDebugPort": 9222,
    "ollamaModel": "llama3.2"
}
```

8. Register the slash commands (rerun after adding/renaming commands): `npm run deploy` (or `refreshcommands.bat`)
9. Start the bot: `npm start` (or `autobot.bat`)
10. In Kenku FM, join the voice channel you want music in. Users can now drive playback with the commands below.
11. Optional autostart: copy `autobot.bat` into your Startup folder (`Win+R` → `shell:startup`). Make sure the path inside `autobot.bat` matches where you cloned the repo.

COMMANDS:

Music commands require the **Disc Monkey** role. Use `/token` to request access from a Disc Gorilla.

| Command | What it does |
| --- | --- |
| `/play <name>` | Fuzzy-matches a track or playlist in the Kenku FM library and plays it |
| `/play <shortcut>` | Resolves a saved URL shortcut and opens it in a Kenku FM browser tab |
| `/play <url>` | Opens the URL in a Kenku FM browser tab and starts playback (see below) |
| `/pause` · `/resume` | Pause / resume playback |
| `/stop` | Stop playback and reset to the beginning of the track |
| `/skip` · `/back` | Next / previous track |
| `/volume <0-100>` | Set playback volume |
| `/mute` | Mute or unmute Kenku FM audio |
| `/seek <seconds>` | Jump to a position in the current track |
| `/shuffle <on/off>` | Toggle shuffle mode |
| `/repeat <off/track/playlist>` | Set repeat mode |
| `/nowplaying` | Show current track, progress, and volume |
| `/queue` | Show upcoming tracks in the current playlist |
| `/library` | List saved shortcuts and Kenku FM playlists/tracks |
| `/save <name> [url]` | Save a URL as a named shortcut; omit `url` to delete the shortcut |
| `/soundboard list` | List all Kenku FM soundboards and their sounds |
| `/soundboard play <sound>` | Play a sound effect by name (fuzzy matched) |
| `/soundboard stop <sound>` | Stop a playing sound effect |
| `/status` | Show bot uptime, Kenku FM connectivity, and current track |
| `/kenku` | Setup instructions and live Kenku FM connection status |
| `/token` | Role-gated access flow — request a Disc Monkey token from a Disc Gorilla |
| `/talk <message>` | Chat with the ephemeral spirit of Harambe (powered by a local Ollama model) |
| `/help` | Show all commands organized by category |

EXPERIMENTAL URL PLAYBACK (`/play <url>`):

Kenku FM's official Remote API can only play tracks already in its library — it has no "play this URL" endpoint (the maintainers declined that feature: https://github.com/owlbear-rodeo/kenku-fm/issues/35). As a workaround, the bot can drive one of Kenku's browser tabs via the Chrome DevTools Protocol:

1. Launch Kenku FM via `autobot.bat` (starts it with `--remote-debugging-port=9222`)
2. Open at least one tab inside Kenku FM (e.g. youtube.com) — tabs must be created in Kenku so their audio is captured
3. `/play https://www.youtube.com/watch?v=...` navigates that tab and presses play; the video will loop automatically

Caveats: works best with YouTube; Spotify needs you to be logged in inside Kenku's browser and may still require a manual click; the mechanism depends on page structure and can break without notice. Library playback never needs debug mode.

URL SHORTCUTS:

Instead of pasting a full URL each time, save it as a named shortcut:

```
/save ambient forest https://www.youtube.com/watch?v=...
/play ambient forest
```

Shortcuts are stored in `shortcuts.json` at the project root. Use `/library` to browse all saved shortcuts alongside the Kenku FM library.

OLLAMA CHATBOT (`/talk`):

`/talk` connects to a locally running [Ollama](https://ollama.com/) instance and responds in character as the spirit of Harambe. Requires Ollama to be installed and running (`ollama serve`). Set the model in `config.json` under `ollamaModel` (default: `llama3.2`). Pull the model with `ollama pull llama3.2` before first use.

ACCESS CONTROL:

All music and soundboard commands require the **Disc Monkey** role. The `/token` command starts an approval flow: it posts a request that a **Disc Gorilla** approves by reacting with 👍, after which the requesting user receives their access token and is automatically granted the Disc Monkey role.

ROADMAP:

1. Get Bot Online [DONE]
2. Get TOS-Compliant Music Capabilities [DONE]
3. Traditional music-bot commands driving Kenku FM via Remote API [DONE]
4. Experimental URL playback through Kenku browser tabs [DONE]
5. Get additional Admin QOL Features Added [DONE]
6. Get LLM powered Chatbot Interaction Capabilities [DONE]
