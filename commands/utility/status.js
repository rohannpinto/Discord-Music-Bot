const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { isAvailable: isDebugAvailable } = require("../../kenku/tabPlayer");
const { formatDuration } = require("../../kenku/commandUtil");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("status")
    .setDescription("Show HarambeBot and Kenku FM connection status"),
  async execute(interaction) {
    await interaction.deferReply();

    // Bot uptime
    const totalSeconds = Math.floor(interaction.client.uptime / 1000);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    const uptime = `${h}h ${m}m ${s}s`;

    // Kenku FM connectivity + current track
    let kenkuStatus = "❌ Unreachable";
    let nowPlaying = "Nothing";
    try {
      const playback = await kenku.getPlayback();
      kenkuStatus = "✅ Connected";
      if (playback.track) {
        const progress = formatDuration(playback.track.progress);
        const duration = formatDuration(playback.track.duration);
        const icon = playback.playing ? "▶️" : "⏸️";
        nowPlaying = `${icon} **${playback.track.title}** \`${progress}/${duration}\``;
      }
    } catch {
      // Kenku FM not running or remote disabled
    }

    // Debug port (CDP for URL playback)
    const debugStatus = (await isDebugAvailable())
      ? "✅ Running (URL playback enabled)"
      : "❌ Not running (library playback only)";

    const embed = new EmbedBuilder()
      .setTitle("🦍 HarambeBot Status")
      .setColor(0x3a9f4c)
      .addFields(
        { name: "Uptime", value: uptime, inline: true },
        { name: "Kenku FM Remote", value: kenkuStatus, inline: true },
        { name: "Debug Port (CDP)", value: debugStatus },
        { name: "Now Playing", value: nowPlaying }
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
