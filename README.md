# HarambeBot

A personal-use Discord music bot built on top of [Kenku FM](https://www.kenku.fm/), created because my friends and I couldn't find a music bot that stayed consistently available for our game nights and D&D sessions — so I built one that runs on my own machine and is always up when we need it.

> **Note:** This repository is published for portfolio and demonstration purposes. It is not licensed for use, copying, modification, or distribution — all rights reserved. HarambeBot was built for personal use on a single private server, and this README documents how I built it and how it works.

## How It Works

Kenku FM is the audio client. It logs into Discord with the bot's token, sits in a voice channel, and streams whatever it plays — local playlists or its built-in browser tabs — into that channel. HarambeBot adds the traditional music-bot command layer on top: slash commands like `/play` are received by the bot process (Node.js) and forwarded to the local Kenku FM instance over its Remote API (`http://127.0.0.1:3333/v1`).

```
Discord user ──/play──▶ HarambeBot (Node) ──HTTP──▶ Kenku FM (local app) ──audio──▶ Discord voice channel
```

On top of the Remote API integration, there is an experimental layer that drives one of Kenku FM's browser tabs directly via the Chrome DevTools Protocol (CDP), covering functionality the official Remote API doesn't expose (details below).

## Capabilities

| Command | What it does |
| --- | --- |
| `/play <name>` | Fuzzy-matches a track or playlist in the Kenku FM library and plays it |
| `/play <url>` | Experimental: opens a URL in a Kenku FM browser tab and starts playback (see below) |
| `/pause`, `/resume` | Pause / resume playback |
| `/skip`, `/back` | Next / previous track |
| `/volume <0-100>` | Set volume |
| `/seek <seconds>` | Jump to a position in the current track |
| `/shuffle <on/off>`, `/repeat <off/track/playlist>` | Queue behavior |
| `/nowplaying` | Show current track, progress, and volume |
| `/library` | List playlists/tracks available to `/play` |
| `/kenku` | Setup instructions + live connection status of the local Kenku instance |
| `/token` | Role-gated access flow |

## How I Built and Deployed It

This section documents my setup process, for anyone curious about how the pieces fit together.

1. Registered a Discord application and bot in the [Developer Portal](https://discordjs.guide/preparations/setting-up-a-bot-application.html), then [invited it to our server](https://discordjs.guide/preparations/adding-your-bot-to-servers.html) with voice and slash-command permissions.
2. Installed [Kenku FM](https://www.kenku.fm/) and connected the bot account to it, so Kenku handles the Discord voice connection and audio streaming.
3. Enabled Kenku FM's Remote API (Settings → Remote → Enabled) on the default local address, `127.0.0.1:3333`.
4. Built the Node.js bot process (Node 18+) that registers the slash commands with Discord and translates each command into HTTP calls against Kenku's Remote API.
5. Kept credentials in a local `config.json` (bot token, application ID, server ID, Remote API address, CDP debug port) that is excluded from version control.
6. Wrote a deploy script (`npm run deploy` / `refreshcommands.bat`) that (re)registers the slash commands with Discord — rerun whenever commands are added or renamed.
7. Wrote a start script (`npm start` / `autobot.bat`) that launches the bot process; with Kenku FM sitting in a voice channel, users in the server can drive playback entirely through slash commands.
8. Set the bot to auto-start on boot by placing `autobot.bat` in the Windows Startup folder, so the bot is always available without manual intervention.

## Experimental URL Playback (`/play <url>`)

Kenku FM's official Remote API can only play tracks already in its library — there is no "play this URL" endpoint, and the maintainers [declined to add one](https://github.com/owlbear-rodeo/kenku-fm/issues/35). Since Kenku FM is an Electron app, I worked around this by driving one of its internal browser tabs over the Chrome DevTools Protocol:

1. Kenku FM is launched with remote debugging enabled (`kenku-debug.bat` starts it with `--remote-debugging-port=9222`).
2. At least one browser tab is opened inside Kenku FM, so its audio is captured by Kenku's streaming pipeline.
3. `/play <url>` connects to the CDP endpoint, navigates that tab to the URL, and programmatically triggers playback in the page.

This was the most interesting engineering problem in the project: bridging three interfaces (Discord's API, Kenku's Remote API, and CDP) to add a feature the official API surface doesn't support.

**Caveats:** the mechanism depends on the structure of the target page and can break without notice; some sites require an authenticated session inside Kenku's browser or a manual first click. Library playback never needs debug mode. This feature is experimental and used at the operator's discretion — anyone running software like this is responsible for complying with the terms of any services it connects to.

## Roadmap

1. Get bot online — **done**
2. Integrate Kenku FM via its Remote API — **done**
3. Traditional music-bot commands driving Kenku FM — **done**
4. Experimental URL playback through Kenku browser tabs via CDP — **done**
5. Additional admin quality-of-life features — **in progress**
6. LLM-powered chatbot interaction — **not started**

## Contributing

This is a personal project, but friends and collaborators I've added to the repo are welcome to open issues and PRs.
