const { SlashCommandBuilder } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");
const kenku = require("../../kenku/remote");
const { withKenku } = require("../../kenku/commandUtil");

const SHORTCUTS_PATH = path.join(__dirname, "../../shortcuts.json");
function loadShortcuts() {
  try {
    return JSON.parse(fs.readFileSync(SHORTCUTS_PATH, "utf8"));
  } catch {
    return {};
  }
}

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

      // Shortcuts section
      const shortcuts = loadShortcuts();
      const shortcutEntries = Object.entries(shortcuts);
      let shortcutSection = "";
      if (shortcutEntries.length > 0) {
        const lines = shortcutEntries.map(([name, url]) => `  • **${name}** → <${url}>`).join("\n");
        shortcutSection = `🔗 **Saved Shortcuts** — use \`/save\` to add or remove\n${lines}\n\n`;
      }

      // Discord messages cap at 2000 characters
      let message = "**Kenku FM Library** — play anything below with `/play <name>`\n\n" + shortcutSection;
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
