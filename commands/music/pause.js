const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { withKenku } = require("../../kenku/commandUtil");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pause")
    .setDescription("Pause Kenku FM playback"),
  async execute(interaction) {
    await withKenku(interaction, async () => {
      await kenku.pause();
      return "⏸️ Playback paused.";
    });
  },
};
