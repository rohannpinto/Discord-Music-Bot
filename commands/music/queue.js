const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { withKenku, formatDuration } = require("../../kenku/commandUtil");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("queue")
    .setDescription("Show upcoming tracks in the current Kenku FM playlist"),
  async execute(interaction) {
    await withKenku(interaction, async () => {
      const playback = await kenku.getPlayback();
      if (!playback.track) return "💤 Nothing is currently playing.";
      if (playback.shuffle)
        return "🔀 Shuffle is on — the queue order is randomised.";

      const { playlists = [], tracks = {} } = await kenku.getPlaylists();
      const currentPlaylist = playlists.find(
        (p) => p.title === playback.playlist?.title
      );
      if (!currentPlaylist)
        return "❓ Could not determine the current playlist.";

      const playlistTracks = (currentPlaylist.tracks || [])
        .map((id) => tracks[id])
        .filter(Boolean);

      const currentIdx = playlistTracks.findIndex(
        (t) => t.id === playback.track.id || t.title === playback.track.title
      );

      const upcoming =
        currentIdx >= 0 ? playlistTracks.slice(currentIdx + 1) : [];
      if (upcoming.length === 0)
        return "🔚 This is the last track in the playlist.";

      const MAX_SHOW = 10;
      const lines = upcoming.slice(0, MAX_SHOW).map((t, i) => {
        const dur = formatDuration(t.duration);
        return `${i + 1}. **${t.title || "Untitled"}**${dur !== "?:??" ? ` · \`${dur}\`` : ""}`;
      });
      if (upcoming.length > MAX_SHOW)
        lines.push(`…and ${upcoming.length - MAX_SHOW} more`);

      return `**Up next in *${currentPlaylist.title}*** — ${upcoming.length} track${upcoming.length !== 1 ? "s" : ""} remaining\n${lines.join("\n")}`;
    });
  },
};
