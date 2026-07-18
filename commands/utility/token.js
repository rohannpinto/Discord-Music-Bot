const { SlashCommandBuilder } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const absoluteFilePath = path.join(
  path.dirname(path.dirname(__dirname)),
  "config.json"
);
const configData = fs.readFileSync(absoluteFilePath, "utf8");
const config = JSON.parse(configData);
const token = config.token;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("token")
    .setDescription(
      "Request an access token with approval from a Disc Gorilla."
    ),
  async execute(interaction) {
    const member = interaction.member; // No need to fetch, interaction.member is already a GuildMember object.
    const guild = interaction.guild; // interaction.guild is already available.
    const discGorillaRole = guild.roles.cache.find(
      (role) => role.name === "Disc Gorilla"
    );
    // Send the access token request message
    const message = await interaction.reply({
      content: `Requesting an access token. A <@&${discGorillaRole.id}> needs to approve this.`,
      fetchReply: true,
    });

    // React to the message with an emoji for approval
    await message.react("👍"); // Add a reaction for 'approval' (you can customize the emoji)

    // Create a reaction collector
    const filter = async (reaction, user) => {
      if (reaction.emoji.name !== "👍") return false; // Only collect 'thumbs up' reactions

      // Fetch the member to ensure we're getting the latest roles
      const reactingMember = await guild.members.fetch(user.id);
      return reactingMember.roles.cache.some(
        (role) => role.name === "Disc Gorilla"
      ); // Check if the user has the Disc Gorilla role
    };

    const collector = message.createReactionCollector({
      filter,
      time: 60000, // 1 minute
    });

    collector.on("collect", async (reaction, user) => {
      // Find or create the 'Disc Monkey' role
      let role = guild.roles.cache.find((r) => r.name === "Disc Monkey");
      if (!role) {
        try {
          role = await guild.roles.create({
            name: "Disc Monkey",
            color: "Blue",
          });
        } catch (error) {
          console.error("Error creating Disc Monkey role:", error);
          await interaction.followUp(
            "There was an error creating the Disc Monkey role. Check that the bot has the **Manage Roles** permission and its role is above any roles it manages.",
          );
          return;
        }
      }

      try {
        await member.roles.add(role);
      } catch (error) {
        console.error("Error adding role:", error);
        await interaction.followUp(
          "There was an error assigning the Disc Monkey role. Check that the bot has **Manage Roles** and its role sits above the Disc Monkey role in the server settings.",
        );
        return;
      }

      // Try DM first; fall back to an ephemeral reply if DMs are closed
      const tokenMessage = `Your access token is: ${token}. Open Kenku FM's settings menu and paste the token in. [Visual Guide](https://www.kenku.fm/static/media/joinChannel.664b4edbddb0db7c0aba.mp4)`;
      try {
        await member.send(tokenMessage);
        await interaction.followUp(
          `${member} has been granted the Disc Monkey role, and the access token has been sent via DM!`,
        );
      } catch (error) {
        // DMs are likely disabled — send ephemerally so only they can see it
        console.warn(
          `Could not DM ${member.user.tag}, falling back to ephemeral reply:`,
          error.message,
        );
        await interaction.followUp({ content: tokenMessage, ephemeral: true });
        await interaction.followUp(
          `${member} has been granted the Disc Monkey role. Their DMs were closed, so the token was shown to them privately in this channel.`,
        );
      }

      collector.stop("approved");
    };);

    collector.on("end", (collected, reason) => {
      if (reason !== "approved" && collected.size === 0) {
        interaction.followUp("No Disc Gorilla approved the token request.");
      }
    });
  },
};
