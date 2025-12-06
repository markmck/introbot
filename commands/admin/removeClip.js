const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const clips = require("../../models/clips.js");
const { handleClipAutocomplete } = require("../../utils/autoComplete.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("removeclip")
    .setDescription("Remove a clip.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("clip")
        .setDescription("The clip to remove")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction) {
    const clipId = parseInt(interaction.options.getString("clip"));

    console.log(`Removing clip ${clipId}`);

    // Check if clip exists
    const clip = await clips.getClip(clipId);
    if (!clip) {
      await interaction.reply({
        content: "❌ Clip not found. Use `/listclips` to see available clips.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await clips.removeClip(clipId);

    await interaction.reply({
      content: `✅ Clip **${clip.audioFile}** has been removed.`,
      flags: MessageFlags.Ephemeral,
    });
  },

  async autocomplete(interaction) {
    await handleClipAutocomplete(interaction);
  },
};
