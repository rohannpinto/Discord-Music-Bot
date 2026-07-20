/*
/play <query> — the main entry point for music.
- If query is a URL: EXPERIMENTAL path that navigates a Kenku FM browser tab to
  the URL over the Chrome DevTools Protocol (requires Kenku launched in debug
  mode, see kenku-debug.bat). Audio flows to Discord through Kenku's own capture.
- Otherwise: fuzzy-matches a track or playlist already in Kenku's library and
  plays it via the official Kenku Remote API.
*/

const { SlashCommandBuilder } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const kenku = require("../../kenku/remote");
const tabPlayer = require("../../kenku/tabPlayer");
const { withKenku } = require("../../kenku/commandUtil");

const SHORTCUTS_PATH = path.join(__dirname, "../../shortcuts.json");
function loadShortcuts() {
  try {
    return JSON.parse(fs.readFileSync(SHORTCUTS_PATH, "utf8"));
  } catch {
    return {};
  }
}


module.exports = {
  data: new SlashCommandBuilder()
    .setName("play")
    .setDescription("Play music through Kenku FM")
    .addStringOption((option) =>
      option
        .setName("query")
        .setDescription("A track/playlist name from the Kenku library, or a URL (experimental)")
        .setRequired(true)
    ),
  async execute(interaction) {
    const query = interaction.options.getString("query", true).trim();

    await withKenku(interaction, async () => {
      // Resolve saved shortcut → URL, then check for raw URL, else library search
      const shortcuts = loadShortcuts();
      const shortcutUrl = shortcuts[query.toLowerCase()];
      const urlToPlay = shortcutUrl ?? (/^https?:\/\//i.test(query) ? query : null);

      if (urlToPlay) {
        const result = await tabPlayer.playUrl(urlToPlay);
        const label = shortcutUrl ? `**${query}**` : `**${result.title}**`;
        return result.confirmed
          ? `▶️ Now playing in a Kenku FM tab: ${label}`
          : `🟡 Opened ${label} in a Kenku FM tab, but couldn't confirm playback started — someone may need to press play in the Kenku window.`;
      }

      const match = await kenku.findInLibrary(query);
      if (!match) {
        return (
          `❌ Nothing in the Kenku library matches **${query}**. ` +
          "Use `/library` to see what's available, `/save` to add a URL shortcut, or pass a URL directly."
        );
      }
      await kenku.playTrack(match.id);
      return match.type === "playlist"
        ? `▶️ Now playing playlist **${match.title}**`
        : `▶️ Now playing **${match.title}**${match.playlist ? ` (from *${match.playlist}*)` : ""}`;
    });
  },
};
