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

// Register the slash command
client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  try {
    const rest = new REST({ version: "10" }).setToken(
      process.env.DISCORD_TOKEN
    );

    //clear global commands
    //uncomment + run the code when we need to clear global level commands
    // await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), {
    //   body: [],
    // });

    //all servers
    const servers = [process.env.SERVER_ID, process.env.SERVER_ID2];

    // First clear existing guild level commands to remove cached commands
    for (const serverId of servers) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.APPLICATION_ID, serverId),
        { body: [] }
      );
    }

    //register new commands
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

    //add the commands to each server
    for (const serverId of servers) {
      await rest.put(
        Routes.applicationGuildCommands(process.env.APPLICATION_ID, serverId),
        { body: commands }
      );
    }
  } catch {
    console.log("Something went wrong, please try again");
  }
});

// // Slash command interaction
client.on("interactionCreate", async (interaction) => {
  if (interaction.isChatInputCommand() && interaction.commandName === "trade") {
    const modal = new ModalBuilder()
      .setCustomId(`tradeModal-${interaction.options.getString("direction")}`)
      .setTitle("Log Your Trade");

    // const direction = new TextInputBuilder()
    //   .setCustomId("direction")
    //   .setLabel("Direction (long/short)")
    //   .setStyle(TextInputStyle.Short)
    //   .setRequired(false);

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
      // new ActionRowBuilder().addComponents(direction),
      new ActionRowBuilder().addComponents(entry),
      new ActionRowBuilder().addComponents(tp),
      new ActionRowBuilder().addComponents(sl),
      new ActionRowBuilder().addComponents(notes)
    );

    await interaction.showModal(modal);
  }

  if (
    interaction.isModalSubmit() &&
    interaction.customId.startsWith("tradeModal-")
  ) {
    // const direction =
    //   interaction.fields.getTextInputValue("direction") || "N/A";

    const direction = interaction.customId.split("-")[1];

    const entry = interaction.fields.getTextInputValue("entry") || "N/A";

    const tp = interaction.fields.getTextInputValue("tp") || "N/A";

    const sl = interaction.fields.getTextInputValue("sl") || "N/A";

    const notes = interaction.fields.getTextInputValue("notes") || "N/A";

    await interaction.reply({
      content: `<@&${process.env.ROLE_ID}>\nNew Trade Submitted by ${
        interaction.user.username
      }\n\n${direction === "long" ? "📈" : "📉"} Direction: ${
        direction[0].toUpperCase() + direction.slice(1)
      }\n\n📊 Entry: ${entry}\n\n🎯 Target: ${tp}\n\n🛑 Stop Loss: ${sl}\n\n📝 Notes: ${notes}`,
      allowedMentions: {
        roles: [process.env.ROLE_ID],
      },
    });
  }
});
