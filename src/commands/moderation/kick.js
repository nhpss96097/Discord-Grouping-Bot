const {
  Client,
  Interaction,
  ApplicationCommandOptionType,
  PermissionFlagsBits,
} = require("discord.js");

module.exports = {
  /**
   *
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    const targetUserId = interaction.options.get("target-user").value;
    const reason =
      interaction.options.get("reason")?.value || "No reason provided.";

    await interaction.deferReply();

    const targetUser = await interaction.guild.members.fetch(targetUserId);

    if (!targetUser) {
      await interaction.editReply("That user doesn't exist in this server.");
      return;
    }

    if (targetUser.id === interaction.guild.ownerId) {
      await interaction.editReply("You can't kick that user.");
      return;
    }

    const targetUserRolePosition = targetUser.roles.highest.position; // Highest role of the target user
    const requestUserRolePosition = interaction.member.roles.highest.position; // Highest role of the user running the cmd
    const botRolePosition = interaction.guild.members.me.roles.highest.position; // Highest role of the bot

    if (targetUserRolePosition >= requestUserRolePosition) {
      await interaction.editReply(
        "You can't kick that user because they have the same/higher role than you."
      );
      return;
    }
    if (targetUserRolePosition >= botRolePosition) {
      await interaction.editReply(
        "I can't kick that user because they have the same/higher role than me."
      );
      return;
    }

    // kick the targetUser
    try {
      await targetUser.kick({ reason });
      await interaction.editReply(
        `User ${targetUser} was kick\nReason: ${reason}`
      );
    } catch (error) {
      console.log(`There was an error when kickning: ${error} `);
    }
  },

  /* --------------------------------- command -------------------------------- */
  name: "kick",
  description: "kicks a member from the server.",
  devOnly: true,
  // deleted: true,
  testOnly: true,

  options: [
    {
      name: "target-user",
      description: "The user to kick.",
      required: true,
      type: ApplicationCommandOptionType.Mentionable, //可提及
    },
    {
      name: "reason",
      description: "The reason for kick.",
      type: ApplicationCommandOptionType.String,
    },
  ],
  // permissionsRequired: [PermissionFlagsBits.Administrator], // 要求的人員權限
  // botPermissions: [PermissionFlagsBits.Administrator], // 要求的Bot權限
  permissionsRequired: [PermissionFlagsBits.kickMembers],
  botPermissions: [PermissionFlagsBits.kickMembers],
};
