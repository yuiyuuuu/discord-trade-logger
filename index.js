// index.js
const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
  SlashCommandBuilder,
} = require("discord.js");
require("dotenv").config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds],
  partials: [Partials.Message, Partials.Channel],
});

console.log(process.env.DISCORD_TOKEN);

client.login(process.env.DISCORD_TOKEN);

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// Register the slash command
client.on("ready", async () => {
  const commands = [
    new SlashCommandBuilder()
      .setName("trade")
      .setDescription("Log a futures trade")
      .addStringOption((opt) =>
        opt
          .setName("direction")
          .setDescription("Long or Short")
          .setRequired(true)
          .addChoices(
            { name: "Long", value: "long" },
            { name: "Short", value: "short" }
          )
      ),
  ].map((cmd) => cmd.toJSON());

  console.log("2", commands);

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  await rest.put(
    Routes.applicationGuildCommands(
      process.env.APPLICATION_ID,
      process.env.SERVER_ID
    ),
    {
      body: commands,
    }
  );
});

// // Slash command interaction
client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === "trade") {
    const modal = new ModalBuilder()
      .setCustomId("tradeModal")
      .setTitle("Log Your Trade");

    const direction = new TextInputBuilder()
      .setCustomId("direction")
      .setLabel("Direction (long/short)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const entry = new TextInputBuilder()
      .setCustomId("entry")
      .setLabel("Entry price (required)")
      .setStyle(TextInputStyle.Short)
      .setRequired(true);

    const tp = new TextInputBuilder()
      .setCustomId("tp")
      .setLabel("Take Profit (optional)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const sl = new TextInputBuilder()
      .setCustomId("sl")
      .setLabel("Stop Loss (optional)")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

    const notes = new TextInputBuilder()
      .setCustomId("notes")
      .setLabel("Extra notes (optional)")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    modal.addComponents(
      new ActionRowBuilder().addComponents(direction),
      new ActionRowBuilder().addComponents(entry),
      new ActionRowBuilder().addComponents(tp),
      new ActionRowBuilder().addComponents(sl),
      new ActionRowBuilder().addComponents(notes)
    );

    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === "tradeModal") {
    const direction =
      interaction.fields.getTextInputValue("direction") || "N/A";

    const entry = interaction.fields.getTextInputValue("entry") || "N/A";

    const tp = interaction.fields.getTextInputValue("tp") || "N/A";

    const sl = interaction.fields.getTextInputValue("sl") || "N/A";

    const notes = interaction.fields.getTextInputValue("notes") || "N/A";

    await interaction.reply({
      content: `New Trade Submitted by ${interaction.user.username}\nDirection: ${direction}\nEntry: ${entry}\nTarget: ${tp}\nStop Loss: ${sl}\nNotes: ${notes}`,
    });
  }
});
