const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { withKenku } = require("../../kenku/commandUtil");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("mute")
    .setDescription("Mute or unmute Kenku FM audio")
    .addStringOption((option) =>
      option
        .setName("action")
        .setDescription("Mute or unmute")
        .setRequired(true)
        .addChoices(
          { name: "mute", value: "mute" },
          { name: "unmute", value: "unmute" }
        )
    ),
  async execute(interaction) {
    await withKenku(interaction, async () => {
      const action = interaction.options.getString("action", true);
      await kenku.setMute(action === "mute");
      return action === "mute" ? "🔇 Kenku FM muted." : "🔊 Kenku FM unmuted.";
    });
  },
};
