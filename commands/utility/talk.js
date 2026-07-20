const { SlashCommandBuilder } = require("discord.js");
const { ollamaModel } = require("../../config.json");

const OLLAMA_URL = "http://localhost:11434/api/chat";
const SYSTEM_PROMPT =
  "You must assume the role of the spirit of Harambe. " +
  "Please respond to the user's question or statement with this role.";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("talk")
    .setDescription("Speak with the spirit of Harambe")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("What do you want to say to Harambe?")
        .setRequired(true)
    ),
  async execute(interaction) {
    const message = interaction.options.getString("message", true);
    await interaction.deferReply();

    let reply;
    try {
      const response = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: ollamaModel || "llama3.2",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: message },
          ],
          stream: false,
        }),
      });

      if (!response.ok) {
        throw new Error(`Ollama returned HTTP ${response.status}`);
      }

      const data = await response.json();
      reply = data.message?.content?.trim();
      if (!reply) throw new Error("Empty response from Ollama");
    } catch (error) {
      console.error("Ollama error:", error.message);
      await interaction.editReply(
        "The spirit of Harambe is unreachable right now. Make sure Ollama is running (`ollama serve`) and the model is pulled."
      );
      return;
    }

    // Discord caps messages at 2000 characters
    if (reply.length > 2000) reply = reply.slice(0, 1997) + "...";

    await interaction.editReply(reply);
  },
};
