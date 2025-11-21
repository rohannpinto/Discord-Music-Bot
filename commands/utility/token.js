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
      try {
        // Send the access token as a DM to the user who requested it
        await member.send(
          `Your access token is: ${token}. Open Kenku FM's settings menu and paste the token in. [Visual Guide](https://www.kenku.fm/static/media/joinChannel.664b4edbddb0db7c0aba.mp4)`
        );

        // Find or create the 'Disc Monkey' role and assign it to the user
        let role = guild.roles.cache.find(
          (role) => role.name === "Disc Monkey"
        );
        if (!role) {
          role = await guild.roles.create({
            name: "Disc Monkey",
            color: "BLUE",
          });
        }

        await member.roles.add(role); // Assign the role to the requesting user
        await interaction.followUp(
          `You have been granted the Disc Monkey role, and an access token has been sent to you!`
        );
      } catch (error) {
        console.error("Error sending DM or adding role:", error);
        await interaction.followUp(
          "There was an error sending the token or assigning the role."
        );
      }
    });

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        interaction.followUp("No Disc Gorilla approved the token request.");
      }
    });
  },
};
