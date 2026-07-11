const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { withKenku } = require("../../kenku/commandUtil");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("volume")
    .setDescription("Set Kenku FM playback volume")
    .addIntegerOption((option) =>
      option
        .setName("percent")
        .setDescription("Volume from 0 to 100")
        .setMinValue(0)
        .setMaxValue(100)
        .setRequired(true)
    ),
  async execute(interaction) {
    const percent = interaction.options.getInteger("percent", true);
    await withKenku(interaction, async () => {
      await kenku.setVolume(percent / 100);
      return `🔊 Volume set to ${percent}%.`;
    });
  },
};
