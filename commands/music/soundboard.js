const { SlashCommandBuilder } = require("discord.js");
const kenku = require("../../kenku/remote");
const { withKenku } = require("../../kenku/commandUtil");

function findSound(soundboards, sounds, query) {
  const q = query.trim().toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const sb of soundboards) {
    for (const id of sb.sounds || []) {
      const sound = sounds[id];
      if (!sound) continue;
      const title = (sound.title || "").toLowerCase();
      const score =
        title === q ? 100 : title.startsWith(q) ? 75 : title.includes(q) ? 50 : 0;
      if (score > bestScore) {
        best = sound;
        bestScore = score;
      }
    }
  }
  return best;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName("soundboard")
    .setDescription("Control Kenku FM soundboards")
    .addSubcommand((sub) =>
      sub.setName("list").setDescription("List all soundboards and their sounds")
    )
    .addSubcommand((sub) =>
      sub
        .setName("play")
        .setDescription("Play a sound effect")
        .addStringOption((o) =>
          o.setName("sound").setDescription("Sound name").setRequired(true)
        )
    )
    .addSubcommand((sub) =>
      sub
        .setName("stop")
        .setDescription("Stop a playing sound effect")
        .addStringOption((o) =>
          o.setName("sound").setDescription("Sound name").setRequired(true)
        )
    ),
  async execute(interaction) {
    const sub = interaction.options.getSubcommand();
    await withKenku(interaction, async () => {
      const { soundboards = [], sounds = {} } = await kenku.getSoundboards();

      if (sub === "list") {
        if (soundboards.length === 0)
          return "📭 No soundboards found in Kenku FM.";
        const sections = soundboards.map((sb) => {
          const names = (sb.sounds || [])
            .map((id) => sounds[id]?.title || "Untitled")
            .map((name) => `  • ${name}`)
            .join("\n");
          return `🔊 **${sb.title || "Untitled"}**\n${names}`;
        });
        let msg =
          "**Kenku FM Soundboards** — play any sound with `/soundboard play <name>`\n\n";
        for (const section of sections) {
          if (msg.length + section.length + 2 > 1990) {
            msg += "\n…truncated.";
            break;
          }
          msg += section + "\n\n";
        }
        return msg.trimEnd();
      }

      const query = interaction.options.getString("sound", true);
      const sound = findSound(soundboards, sounds, query);
      if (!sound)
        return `❌ No sound matching **${query}** found. Use \`/soundboard list\` to see what's available.`;

      if (sub === "play") {
        await kenku.playSound(sound.id);
        return `🔊 Playing **${sound.title}**.`;
      }
      if (sub === "stop") {
        await kenku.stopSound(sound.id);
        return `🔇 Stopped **${sound.title}**.`;
      }
    });
  },
};
