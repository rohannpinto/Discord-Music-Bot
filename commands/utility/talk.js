const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("talk")
    .setDescription("Lets you talk to harambe itself"),
  async execute(interaction) {
    // interaction.guild is the object representing the Guild in which the command was run
    await interaction.reply("What do you want to say to Harambe?");
  },
};
