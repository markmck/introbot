const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("adminhelp")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .setDescription("List all available admin commands."),

  async execute(interaction) {
    const commands = interaction.client.commands;

    if (!commands || commands.size === 0) {
      await interaction.reply({
        content: "📂 No commands available.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const adminCommands = Array.from(commands.values()).filter((cmd) => {
      const perms = cmd.data.default_member_permissions;
      return perms !== null && perms !== undefined;
    });

    if (adminCommands.length === 0) {
      await interaction.reply({
        content: "📂 No user commands available.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Use userCommands (the filtered list) instead of commands
    const commandList = adminCommands
      .map((cmd) => `**/${cmd.data.name}**: ${cmd.data.description}`)
      .join("\n");

    const embed = new EmbedBuilder()
      .setColor(0x00ff99)
      .setTitle("📋 Available Commands")
      .setDescription(commandList)
      .setFooter({ text: "Use /command to execute" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
