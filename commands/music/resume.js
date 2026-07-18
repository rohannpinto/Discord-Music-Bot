const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { withKenku } = require("../../kenku/commandUtil");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("resume")
    .setDescription("Resume Kenku FM playback"),
  async execute(interaction) {
    await withKenku(interaction, async () => {
      await kenku.resume();
      return "▶️ Playback resumed.";
    });
  },
};
