const { ApplicationCommandOptionType } = require("discord.js");

const { teams, memberPosition } = require("./team");

module.exports = {
  name: "check-team",
  description: "check team.",
  // deleted: true,
  options: [
    {
      name: "隊伍名稱",
      description: "要查看的隊伍",
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],

  callback: async (client, interaction) => {
    const teamName = interaction.options.getString("隊伍名稱");

    const teamMembers = teams[teamName];

    if (teamMembers) {
      await interaction.reply({
        content: `隊伍名稱: ${teamName}\n隊伍成員:\n **${teamMembers.join(
          "\n"
        )}** : **${memberPosition}**`,
      });
    } else {
      await interaction.reply({
        content: `找不到名稱為${teamName}的隊伍`,
      });
    }
  },
};
