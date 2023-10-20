require("dotenv").config();

const {
  Client,
  IntentsBitField,
  Message,
  EmbedBuilder,
  ActivityType, // 活動狀態類型
} = require("discord.js");
const eventHandler = require("./handlers/eventHandler");

// 設定機器人擁有的權限
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

eventHandler(client);

// 登入機器人
client.login(process.env.DISCORD_TOKEN);
