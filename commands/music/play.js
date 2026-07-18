/*
/play <query> — the main entry point for music.
- If query is a URL: EXPERIMENTAL path that navigates a Kenku FM browser tab to
  the URL over the Chrome DevTools Protocol (requires Kenku launched in debug
  mode, see kenku-debug.bat). Audio flows to Discord through Kenku's own capture.
- Otherwise: fuzzy-matches a track or playlist already in Kenku's library and
  plays it via the official Kenku Remote API.
*/

const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const tabPlayer = require("../../kenku/tabPlayer");
const { withKenku } = require("../../kenku/commandUtil");


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
      if (/^https?:\/\//i.test(query)) {
        const result = await tabPlayer.playUrl(query);
        return result.confirmed
          ? `▶️ Now playing in a Kenku FM tab: **${result.title}**`
          : `🟡 Opened **${result.title}** in a Kenku FM tab, but couldn't confirm playback started — someone may need to press play in the Kenku window.`;
      }

      const match = await kenku.findInLibrary(query);
      if (!match) {
        return (
          `❌ Nothing in the Kenku library matches **${query}**. ` +
          "Use `/library` to see what's available, or pass a URL to play it in a Kenku tab (experimental)."
        );
      }
      await kenku.playTrack(match.id);
      return match.type === "playlist"
        ? `▶️ Now playing playlist **${match.title}**`
        : `▶️ Now playing **${match.title}**${match.playlist ? ` (from *${match.playlist}*)` : ""}`;
    });
  },
};
