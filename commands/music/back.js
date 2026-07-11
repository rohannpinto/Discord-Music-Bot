const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { withKenku } = require("../../kenku/commandUtil");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("back")
    .setDescription("Go back to the previous track in the Kenku FM queue"),
  async execute(interaction) {
    await withKenku(interaction, async () => {
      await kenku.previous();
      return "⏮️ Went back to the previous track.";
    });
  },
};
