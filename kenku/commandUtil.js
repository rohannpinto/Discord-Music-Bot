/*
Shared plumbing for the music commands: defers the reply (Kenku calls can
exceed Discord's 3s interaction window), runs the handler, and converts
expected Kenku/tab errors into friendly replies instead of crash messages.
*/

const { KenkuError } = require("./remote");
const { TabPlayerError } = require("./tabPlayer");

async function withKenku(interaction, handler) {
  const hasRole = interaction.member?.roles.cache.some(
    (r) => r.name === "Disc Monkey" || r.name === "Disc Gorilla"
  );
  if (!hasRole) {
    await interaction.reply({
      content:
        "You need the **Disc Monkey** role to use music commands. Ask a Disc Gorilla for access via `/token`.",
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply();

  try {
    const message = await handler();
    await interaction.editReply(message);
  } catch (error) {
    if (error instanceof KenkuError || error instanceof TabPlayerError) {
      await interaction.editReply(`⚠️ ${error.message}`);
    } else {
      throw error;
    }
  }
}

function formatDuration(seconds) {
  if (!Number.isFinite(seconds)) return "?:??";
  const total = Math.round(seconds);
  const m = Math.floor(total / 60);
  const s = String(total % 60).padStart(2, "0");
  return `${m}:${s}`;
}

module.exports = { withKenku, formatDuration };
