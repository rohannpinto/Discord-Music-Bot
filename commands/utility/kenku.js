/*
/kenku — onboarding + status. Kenku FM itself is the audio client that sits in
the voice channel (it connects to Discord with the bot token), so this command
no longer tries to join voice from the bot process; it reports whether the
local Kenku FM instance is reachable instead.
Note: the previous version imported joinVoiceChannel from discord.js, which
does not export it — that branch always crashed.
*/

const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const tabPlayer = require("../../kenku/tabPlayer");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("kenku")
    .setDescription("Kenku FM setup instructions and connection status."),
  async execute(interaction) {
    const member = interaction.member;

    const hasDiscMonkeyRole = member.roles.cache.some(
      (role) => role.name === "Disc Monkey"
    );

    if (!hasDiscMonkeyRole) {
      await interaction.reply({
        content:
          "1. Please install [Kenku FM](https://kenku.fm). \n 2. Use `/token` to get access. \n 3. Rerun this command to start playing songs!",
        ephemeral: true,
      });
      return;
    }

    await interaction.deferReply({ ephemeral: true });

    let remoteStatus;
    try {
      await kenku.getPlaylists();
      remoteStatus = "🟢 Kenku FM Remote API is reachable — `/play`, `/pause`, `/skip` etc. are live.";
    } catch (error) {
      remoteStatus = `🔴 ${error.message}`;
    }

    const urlStatus = (await tabPlayer.isAvailable())
      ? "🟢 Debug mode detected — `/play <url>` (experimental) is available."
      : "🟡 Kenku FM is not in debug mode — `/play <url>` is unavailable (library playback still works). Launch Kenku via kenku-debug.bat to enable it.";

    await interaction.editReply(`${remoteStatus}\n${urlStatus}`);
  },
};
