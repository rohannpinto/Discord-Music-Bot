const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Show all HarambeBot commands"),
  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("🦍 HarambeBot Commands")
      .setColor(0x3a9f4c)
      .addFields(
        {
          name: "🎵 Music — requires Disc Monkey role",
          value: [
            "`/play <name|url>` — Play from library or a URL",
            "`/pause` · `/resume` · `/stop` — Playback control",
            "`/skip` · `/back` — Next / previous track",
            "`/volume <0-100>` — Set volume",
            "`/mute` — Mute / unmute Kenku FM",
            "`/seek <seconds>` — Jump to a position",
            "`/shuffle` · `/repeat` — Queue behaviour",
            "`/nowplaying` — Show the current track",
            "`/queue` — Show upcoming tracks",
            "`/library` — Browse the Kenku FM library & saved shortcuts",
            "`/save <name> [url]` — Save or delete a URL shortcut",
          ].join("\n"),
        },
        {
          name: "🔊 Soundboard — requires Disc Monkey role",
          value: [
            "`/soundboard list` — List all soundboards and sounds",
            "`/soundboard play <sound>` — Play a sound effect",
            "`/soundboard stop <sound>` — Stop a sound effect",
          ].join("\n"),
        },
        {
          name: "🔧 Utility",
          value: [
            "`/status` — Bot and Kenku FM health check",
            "`/kenku` — Kenku FM connection info and setup guide",
            "`/token` — Request a Disc Monkey access token",
            "`/talk <message>` — Chat with the spirit of Harambe",
            "`/help` — Show this message",
          ].join("\n"),
        }
      )
      .setFooter({
        text: "Music commands require Kenku FM to be running with Remote enabled.",
      });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
