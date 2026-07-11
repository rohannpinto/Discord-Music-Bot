const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { withKenku } = require("../../kenku/commandUtil");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("repeat")
    .setDescription("Set the repeat mode in Kenku FM")
    .addStringOption((option) =>
      option
        .setName("mode")
        .setDescription("Repeat mode")
        .setRequired(true)
        .addChoices(
          { name: "off", value: "off" },
          { name: "track", value: "track" },
          { name: "playlist", value: "playlist" }
        )
    ),
  async execute(interaction) {
    const mode = interaction.options.getString("mode", true);
    await withKenku(interaction, async () => {
      await kenku.setRepeat(mode);
      return `🔁 Repeat set to **${mode}**.`;
    });
  },
};
