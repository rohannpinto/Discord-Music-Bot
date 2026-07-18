const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { withKenku } = require("../../kenku/commandUtil");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("shuffle")
    .setDescription("Turn shuffle on or off in Kenku FM")
    .addBooleanOption((option) =>
      option
        .setName("enabled")
        .setDescription("True to shuffle, false to play in order")
        .setRequired(true)
    ),
  async execute(interaction) {
    const enabled = interaction.options.getBoolean("enabled", true);
    await withKenku(interaction, async () => {
      await kenku.setShuffle(enabled);
      return enabled ? "🔀 Shuffle on." : "➡️ Shuffle off.";
    });
  },
};
