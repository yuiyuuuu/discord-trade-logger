require("dotenv");

const { Client, GatewayIntentBits } = require("discord.js");

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once("ready", () => {
  console.log(`Logged in as user ${client.user.tag}`);
});

client.login(process.env.DISCORD_TOKEN);
