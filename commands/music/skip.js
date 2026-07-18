const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { withKenku } = require("../../kenku/commandUtil");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("skip")
    .setDescription("Skip to the next track in the Kenku FM queue"),
  async execute(interaction) {
    await withKenku(interaction, async () => {
      await kenku.next();
      return "⏭️ Skipped to the next track.";
    });
  },
};
