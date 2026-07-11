const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { withKenku, formatDuration } = require("../../kenku/commandUtil");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("seek")
    .setDescription("Seek to a position in the current track")
    .addIntegerOption((option) =>
      option
        .setName("seconds")
        .setDescription("Position in seconds from the start of the track")
        .setMinValue(0)
        .setRequired(true)
    ),
  async execute(interaction) {
    const seconds = interaction.options.getInteger("seconds", true);
    await withKenku(interaction, async () => {
      await kenku.seek(seconds);
      return `⏩ Seeked to ${formatDuration(seconds)}.`;
    });
  },
};
