const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const { playAudio } = require("../../utils/audioPlayer");
const path = require("path");
const clipList = require("../../models/clips.js");
const { handleClipAutocomplete } = require("../../utils/autoComplete.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("preview")
    .setDescription("Preview an audio clip")
    .addStringOption((option) =>
      option
        .setName("clip")
        .setDescription("The clip to preview")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction) {
    const clipId = parseInt(interaction.options.getString("clip"));

    const clip = await clipList.getClip(clipId.toString());

    if (!clip) {
      await interaction.reply({
        content: `❌ Clip not found. Use /listclips to see available clips.`,
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const audioPath = path.join(__dirname, "../../audio", clip.audioFile);

    const member = interaction.member;
    const voiceChannel = member.voice.channel;

    if (!voiceChannel) {
      // Send as file attachment instead
      await interaction.reply({
        content: `Preview **${clipList.getClipTitle(clip)}**:`,
        files: [{ attachment: audioPath, name: clip.audioFile }],
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Defer reply since audio playback might take a moment
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    try {
      // Play the audio with default volume
      await playAudio(voiceChannel, audioPath, clip.volume);

      await interaction.editReply({
        content: `🔊 Playing preview: **${clipList.getClipTitle(clip)}**`,
      });
    } catch (error) {
      console.error("Error previewing clip:", error);
      await interaction.editReply({
        content: "❌ An error occurred while trying to preview the clip.",
      });
    }
  },

  // Autocomplete handler for clip names
  async autocomplete(interaction) {
    await handleClipAutocomplete(interaction);
  },
};