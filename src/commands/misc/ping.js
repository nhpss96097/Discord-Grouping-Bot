module.exports = {
  name: "ping",
  description: "Pong!",
  // devOnly: Boolean,
  // testOnly: true,
  // options: Object[],
  // deleted: Boolean,

  // 自定義需要的功能
  callback: async (client, interaction) => {
    await interaction.deferReply();

    const reply = await interaction.fetchReply();

    const ping = reply.createdTimestamp - interaction.createdTimestamp;

    interaction.editReply(
      `Pong! Client ${ping}ms | Websocket: ${client.ws.ping}ms`
    );
  },
};
