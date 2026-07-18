const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { withKenku, formatDuration } = require("../../kenku/commandUtil");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("nowplaying")
    .setDescription("Show what Kenku FM is currently playing"),
  async execute(interaction) {
    await withKenku(interaction, async () => {
      const playback = await kenku.getPlayback();
      const track = playback.track;
      if (!track) {
        return "💤 Nothing is queued in the Kenku FM playlist player right now.";
      }
      const lines = [
        `${playback.playing ? "▶️" : "⏸️"} **${track.title || "Unknown track"}**` +
          (playback.playlist && playback.playlist.title ? ` — *${playback.playlist.title}*` : ""),
        `\`${formatDuration(track.progress)} / ${formatDuration(track.duration)}\`` +
          ` · 🔊 ${Math.round((playback.volume ?? 0) * 100)}%` +
          (playback.muted ? " (muted)" : "") +
          (playback.shuffle ? " · 🔀 shuffle" : "") +
          (playback.repeat && playback.repeat !== "off" ? ` · 🔁 ${playback.repeat}` : ""),
      ];
      return lines.join("\n");
    });
  },
};
