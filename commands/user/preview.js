const { SlashCommandBuilder } = require('discord.js');
const { playAudio } = require('../../utils/audioPlayer');
const path = require('path');
const clipList = require('../../models/clips.js');
const { handleClipAutocomplete } = require('../../utils/autoComplete.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('preview')
    .setDescription('Preview an audio clip')
    .addStringOption(option =>
      option
        .setName('clip')
        .setDescription('The clip to preview')
        .setRequired(true)
        .setAutocomplete(true)
    ),
  
  async execute(interaction) {
    const clipId = parseInt(interaction.options.getString('clip'));
    
    // Check if user is in a voice channel
    const member = interaction.member;
    const voiceChannel = member.voice.channel;
    
    if (!voiceChannel) {
      await interaction.reply({
        content: '❌ You need to be in a voice channel to preview a clip!',
        ephemeral: true
      });
      return;
    }

    const clip = await clipList.getClip(clipId.toString());

    // Check if clip exists in the list
    if (!clip) {
      await interaction.reply({
        content: `❌ Clip "${clip.audioFile}" not found. Use /listclips to see available clips.`,
        ephemeral: true
      });
      return;
    }

    // Defer reply since audio playback might take a moment
    await interaction.deferReply({ ephemeral: true });

    try {
      const audioPath = path.join(__dirname, '../../audio', clip.audioFile);
      
      // Play the audio with default volume
      await playAudio(voiceChannel, audioPath, 0.5);
      
      await interaction.editReply({
        content: `🔊 Playing preview: **${clip.audioFile}**`
      });
      
    } catch (error) {
      console.error('Error previewing clip:', error);
      await interaction.editReply({
        content: '❌ An error occurred while trying to preview the clip.'
      });
    }
  },

  // Autocomplete handler for clip names
  async autocomplete(interaction) {
    await handleClipAutocomplete(interaction);
  },
};