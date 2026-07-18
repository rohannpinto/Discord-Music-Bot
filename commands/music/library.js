const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { withKenku } = require("../../kenku/commandUtil");

const MAX_TRACKS_PER_PLAYLIST = 10;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("library")
    .setDescription("List the playlists and tracks available in Kenku FM"),
  async execute(interaction) {
    await withKenku(interaction, async () => {
      const { playlists = [], tracks = {} } = await kenku.getPlaylists();
      if (playlists.length === 0) {
        return "📭 The Kenku FM library is empty — add playlists in the Kenku FM app first.";
      }

      const sections = [];
      for (const playlist of playlists) {
        const ids = playlist.tracks || [];
        const names = ids
          .slice(0, MAX_TRACKS_PER_PLAYLIST)
          .map((id) => (tracks[id] && tracks[id].title) || "Untitled")
          .map((name) => `  • ${name}`);
        if (ids.length > MAX_TRACKS_PER_PLAYLIST) {
          names.push(`  • …and ${ids.length - MAX_TRACKS_PER_PLAYLIST} more`);
        }
        sections.push(`🎵 **${playlist.title || "Untitled playlist"}** (${ids.length} tracks)\n${names.join("\n")}`);
      }

      // Discord messages cap at 2000 characters
      let message = "**Kenku FM Library** — play anything below with `/play <name>`\n\n";
      for (const section of sections) {
        if (message.length + section.length + 2 > 1990) {
          message += "\n…truncated. Open Kenku FM to see the full library.";
          break;
        }
        message += section + "\n\n";
      }
      return message.trimEnd();
    });
  },
};
