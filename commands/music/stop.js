const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { withKenku } = require("../../kenku/commandUtil");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stop")
    .setDescription("Stop playback and reset to the beginning of the track"),
  async execute(interaction) {
    await withKenku(interaction, async () => {
      await kenku.pause();
      await kenku.seek(0);
      return "⏹️ Playback stopped.";
    });
  },
};
