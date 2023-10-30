const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ApplicationCommandOptionType,
  ComponentType,
} = require("discord.js");

let teams = {};
let memberPosition = [];
let memberNumber = [];

module.exports = {
  teams,
  memberPosition,
  memberNumber,
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

    let userTeamStatus = {}; // 追蹤使用者的隊伍狀態

    // 創新隊伍時重製參數
    if (interaction.commandName === "create-team") {
      // teams = {};

      if (teamMember === 0) {
        await interaction.reply({
          content: `隊伍成員不能為 0 `,
        });
        return;
      }

      memberPosition = [];
      memberNumber = [];
    }

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
        content: `隊伍名稱: ${teamName}\n組員數量: ${teamMember}\n**選擇欲加入的職位:**`,
        components: [row],
      });

      /* --------------------------------- 建立監聽事件 --------------------------------- */
      // const collectorFilter = (i) => i.user.id === interaction.user.id;
      const collectorFilter = (i) => i.isButton() && i.customId; // 排除非按鈕事件，並確保有 customId（按下的按鈕）

      // response.awaitMessageComponent
      // response.createMessageComponentCollector
      try {
        const confirmation = await response.createMessageComponentCollector({
          filter: collectorFilter,
          componentType: ComponentType.Button,
          // time: 60_000, // 60 sec
        });

        // console.log(confirmation.customId);

        /* -------------------------------- 檢查是否在隊伍中 -------------------------------- */
        async function checkUserInTeam(user, i, position, memberIndex) {
          console.log("checkStart");
          console.log(inTeamMember);

          // 檢查使用者與其職位
          // const isUserInTeam = inTeamMember.includes(
          //   `${memberIndex} ${user} (${position})`
          // );

          const userIsInTeam = inTeamMember.some((member) => {
            const pattern = new RegExp(`^${memberIndex} ${user}`);
            return pattern.test(member);
          });

          if (userIsInTeam) {
            // 如果已經在隊伍中，則從隊伍中移除
            // const index = inTeamMember.indexOf(
            //   `${memberIndex} ${user} (${position})`
            // );

            // if (index !== -1) {
            //   inTeamMember.splice(index, 1);
            //   memberPosition.splice(index, 1);
            //   memberNumber.splice(index, 1);
            //   await i.reply({
            //     // ephemeral: true,
            //     content: `以退出${teamName}的隊伍`,
            //   });
            // }

            const userIsInTeamIndex = inTeamMember.findIndex((member) => {
              const pattern = new RegExp(`^${memberIndex} ${user}`);
              return pattern.test(member);
            });

            if (userIsInTeamIndex !== -1) {
              inTeamMember.splice(userIsInTeamIndex, 1);
              memberPosition.splice(userIsInTeamIndex, 1);
              memberNumber.splice(userIsInTeamIndex, 1);
              await i.reply({
                // ephemeral: true,
                content: `以退出${teamName}的隊伍`,
              });
            }
          } else {
            console.log("User is not in the team.");
          }

          console.log("checkEnd");
          console.log(inTeamMember);

          // return isUserInTeam;
          return userIsInTeam;
        }

        /* ----------------------------- 確認是否超過設定的隊伍成員數量 ---------------------------- */
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

        /* --------------------------------- 取得成員編號 --------------------------------- */
        function getNextMemberNumber() {
          // 找最大的成員編號
          const maxNumber = Math.max(...memberNumber);
          // 空的設為 1，否則增加 1
          return isFinite(maxNumber) ? maxNumber + 1 : 1;
        }

        /* ---------------------------------- 監聽事件處理 ---------------------------------- */
        confirmation.on("collect", async (i) => {
          const userDisplayName = i.user.displayName;
          // const userInTeam = await checkUserInTeam(
          //   userDisplayName,
          //   i,
          //   i.customId,
          //   memberNumber
          // );

          const userInTeam = userTeamStatus[i.user.id]; // 將使用者 id 資訊存入
          if (userInTeam) {
            const userIndex = inTeamMember.findIndex((member) => {
              member.startsWith(`${userInTeam.number} ${userDisplayName}`);
            });

            if (userInTeam !== -1) {
              inTeamMember.splice(userIndex, 1);
              memberPosition.splice(userIndex, 1);
              memberNumber.splice(userIndex, 1);
              userTeamStatus[i.user.id] = null;
              await i.reply({
                // ephemeral: true,
                content: `${userDisplayName}以退出${teamName}的隊伍`,
              });
            }
          } else if (!userInTeam && checkTeamMember(i)) {
            switch (i.customId) {
              case "Dps":
              case "Tank":
              case "Sup":
              case "Healer":
                // console.log(i.user);
                memberPosition.push(i.customId);
                const memberNum = getNextMemberNumber();
                memberNumber.push(memberNum);
                const positionIndex = memberPosition.indexOf(i.customId);
                if (positionIndex !== -1) {
                  inTeamMember.push(
                    `${memberNum} ${userDisplayName} (${i.customId})`
                  );
                  userTeamStatus[i.user.id] = {
                    position: i.customId,
                    number: memberNum,
                  };
                  // console.log(inTeamMember);
                }

                await i.reply({
                  // ephemeral: true,
                  content: `${userDisplayName}以${
                    i.customId
                  }的職位加入**${teamName}**的隊伍\n目前隊伍成員:\n**${inTeamMember.join(
                    "\n"
                  )}**`,
                  components: [],
                });
                console.log("teams:");
                console.log(teams);

                return;
            }
          }
        });
      } catch (e) {
        await interaction.editReply({
          content: "Confirmation not received within 1 minute, cancelling",
          components: [],
        });
      }
    } catch (error) {
      console.log(`There was an error: ${error}`);
    }
  },
};
