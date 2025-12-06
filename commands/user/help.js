const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('List all available commands.'),
  
  async execute(interaction) {
    const commands = interaction.client.commands;
    
    if (!commands || commands.size === 0) {
      await interaction.reply({
        content: '📂 No commands available.',
        ephemeral: true
      });
      return;
    }

    const userCommands = Array.from(commands.values()).filter(cmd => {
      const perms = cmd.data.default_member_permissions;
      return perms === null || perms === undefined;
    });

    if (userCommands.length === 0) {
      await interaction.reply({
        content: '📂 No user commands available.',
        ephemeral: true
      });
      return;
    }

    // Use userCommands (the filtered list) instead of commands
    const commandList = userCommands
      .map(cmd => `**/${cmd.data.name}**: ${cmd.data.description}`)
      .join('\n');

    const embed = new EmbedBuilder()
      .setColor(0x00ff99)
      .setTitle('📋 Available Commands')
      .setDescription(commandList)
      .setFooter({ text: 'Use /command to execute' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};