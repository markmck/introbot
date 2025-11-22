const { Events, REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Logged in as ${client.user.tag}!`);

    // Auto-deploy slash commands
    try {
      const commands = [];
      const commandsPath = path.join(__dirname, '../commands');
      const commandItems = fs.readdirSync(commandsPath);

      for (const item of commandItems) {
        const itemPath = path.join(commandsPath, item);
        const stat = fs.statSync(itemPath);
        
        if (stat.isDirectory()) {
          // It's a folder, scan for .js files inside
          const commandFiles = fs.readdirSync(itemPath).filter(file => file.endsWith('.js'));
          
          for (const file of commandFiles) {
            const command = require(path.join(itemPath, file));
            if ('data' in command) {
              commands.push(command.data.toJSON());
            }
          }
        } else if (item.endsWith('.js')) {
          // It's a .js file directly in commands/
          const command = require(itemPath);
          if ('data' in command) {
            commands.push(command.data.toJSON());
          }
        }
      }

      const { clientId, guildId, token } = require('../config.json');
      const rest = new REST().setToken(token);

      console.log(`Refreshing ${commands.length} slash commands...`);
      
      // Deploy to specific guild (faster for testing)
      await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );

      console.log('✓ Slash commands registered successfully!');
    } catch (error) {
      console.error('Error deploying commands:', error);
    }
  },
};