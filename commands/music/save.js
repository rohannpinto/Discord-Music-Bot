const { SlashCommandBuilder } = require("discord.js");
const { withKenku } = require("../../kenku/commandUtil");
const fs = require("node:fs");
const path = require("node:path");

const SHORTCUTS_PATH = path.join(__dirname, "../../shortcuts.json");

function loadShortcuts() {
  try {
    return JSON.parse(fs.readFileSync(SHORTCUTS_PATH, "utf8"));
  } catch {
    return {};
  }
}

function persistShortcuts(shortcuts) {
  fs.writeFileSync(SHORTCUTS_PATH, JSON.stringify(shortcuts, null, 2), "utf8");
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("save")
    .setDescription("Save a URL as a named shortcut for /play, or delete one")
    .addStringOption((o) =>
      o
        .setName("name")
        .setDescription("Shortcut name (e.g. 'tavern music')")
        .setRequired(true)
    )
    .addStringOption((o) =>
      o
        .setName("url")
        .setDescription("URL to save — omit to delete the shortcut")
        .setRequired(false)
    ),
  async execute(interaction) {
    await withKenku(interaction, async () => {
      const name = interaction.options.getString("name", true).toLowerCase().trim();
      const url = interaction.options.getString("url")?.trim();
      const shortcuts = loadShortcuts();

      if (!url) {
        if (!shortcuts[name])
          return `❓ No shortcut named **${name}** exists.`;
        delete shortcuts[name];
        persistShortcuts(shortcuts);
        return `🗑️ Deleted shortcut **${name}**.`;
      }

      if (!/^https?:\/\//i.test(url))
        return "❌ URL must start with http:// or https://.";

      shortcuts[name] = url;
      persistShortcuts(shortcuts);
      return `✅ Saved **${name}** → <${url}>. You can now use \`/play ${name}\` to play it.`;
    });
  },
};
