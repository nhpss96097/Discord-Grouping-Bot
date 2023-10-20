const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  ComponentType,
} = require("discord.js");

const teams = {};
const memberPosition = [];

module.exports = {
  teams,
  memberPosition,
  name: "create-team",
  description: "creating a team.",
  // devOnly: Boolean,
  // testOnly: true,
  // options: Object[],
  // deleted: Boolean,

  options: [
    {
      name: "隊伍名稱",
      description: "隊伍的名稱",
      required: true,
      type: ApplicationCommandOptionType.String,
    },
    {
      name: "組員數量",
      description: "組員的數量",
      required: true,
      type: ApplicationCommandOptionType.Number,
    },
  ],
  required: true,

  // 自定義需要的功能
  callback: async (client, interaction) => {
    const roles = [
      {
        id: "Dps",
        label: "Dps",
      },
      {
        id: "Tank",
        label: "Tank",
      },
      {
        id: "Sup",
        label: "Sup",
      },
      {
        id: "Healer",
        label: "Healer",
      },
    ];

    const teamName = interaction.options.get("隊伍名稱").value;
    console.log(`teamName: ${teamName}`);

    const teamMember = interaction.options.get("組員數量").value;
    console.log(`teamMember: ${teamMember}`);

    const inTeamMember = [];

    teams[teamName] = inTeamMember;

    try {
      const row = new ActionRowBuilder();

      roles.forEach((role) => {
        row.components.push(
          new ButtonBuilder()
            .setCustomId(role.id)
            .setLabel(role.label)
            .setStyle(ButtonStyle.Primary)
        );
      });

      const response = await interaction.reply({
        content:
          `隊伍名稱: ${teamName}\n組員數量: ${teamMember}` +
          `\n目前隊伍成員: ${inTeamMember}` +
          "\n**選擇欲加入的職位:**",
        components: [row],
      });

      const collectorFilter = (i) => i.user.id === interaction.user.id;

      const userName = interaction.user.globalName;

      // response.awaitMessageComponent
      // response.createMessageComponentCollector
      try {
        const confirmation = await response.createMessageComponentCollector({
          filter: collectorFilter,
          componentType: ComponentType.Button,
          time: 60_000, // 60 sec
        });

        // console.log(confirmation.customId);

        // 檢查是否在隊伍中
        async function checkUserInTeam(user, i) {
          console.log("checkStart");
          console.log(inTeamMember);

          const isUserInTeam = inTeamMember.includes(user);
          if (isUserInTeam) {
            const index = inTeamMember.indexOf(user);
            if (index !== -1) {
              inTeamMember.splice(index, 1);
              await i.reply({
                ephemeral: true,
                content: `以退出${teamName}的隊伍`,
              });
            }
          } else {
            console.log("User is not in the team.");
          }

          console.log("checkEnd");
          console.log(inTeamMember);

          return isUserInTeam;
        }

        // 確認是否超過設定的隊伍成員數量
        async function checkTeamMember(i) {
          console.log("checkTeamMember");
          if (inTeamMember.length >= teamMember) {
            console.log("超過設定的成員數量");
            await i.reply({
              ephemeral: true,
              content: `超過設定的隊伍成員數量，無法加入`,
            });
            return false;
          }
          return true;
        }

        confirmation.on("collect", async (i) => {
          const userInTeam = await checkUserInTeam(userName, i);

          if (!userInTeam) {
            if (checkTeamMember(i)) {
              switch (i.customId) {
                case "Dps":
                case "Tank":
                case "Sup":
                case "Healer":
                  inTeamMember.push(userName);
                  console.log(inTeamMember);
                  memberPosition.push(i.customId);
                  await i.reply({
                    ephemeral: true,
                    content: `以${
                      i.customId
                    }的職位加入**${teamName}**的隊伍\n目前隊伍成員:\n **${inTeamMember.join(
                      "\n"
                    )}**：**${i.customId}** \n`,
                    components: [],
                  });
                  console.log("teams:");
                  console.log(teams);
                  return;
              }
            }
          }
        });
      } catch (e) {
        await interaction.editReply({
          content: "Confirmation not received within 1 minute, cancelling",
          components: [],
        });
      }

      // process.exit();
    } catch (error) {
      console.log(`There was an error: ${error}`);
    }
  },
};
