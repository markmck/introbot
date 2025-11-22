const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const clips = require("../../models/clips.js");
const entrance = require("../../models/entrance.js");
const { handleClipAutocomplete } = require("../../utils/autoComplete.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setvolume")
    .setDescription("Update volume of a clip.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("clip")
        .setDescription("The clip to update")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addNumberOption((option) =>
      option
        .setName("volume")
        .setDescription("Volume level (0.0 to 1.0)")
        .setRequired(true)
        .setMinValue(0.0)
        .setMaxValue(1.0)
    ),

  async execute(interaction) {
    const clipId = parseInt(interaction.options.getString("clip"));
    const volume = interaction.options.getNumber("volume");

    console.log(`Setting clip ${clipId} volume to ${volume}`);

    // Check if clip exists
    const clip = await clips.getClip(clipId);
    if (!clip) {
      await interaction.reply({
        content: "❌ Clip not found. Use `/listclips` to see available clips.",
        ephemeral: true,
      });
      return;
    }

    await clips.setClipVolume(clipId, volume);

    await interaction.reply({
      content: `✅ Volume for **${clip.audioFile}** set to ${volume}`,
      ephemeral: true,
    });
  },

  async autocomplete(interaction) {
    await handleClipAutocomplete(interaction);
  },
};
