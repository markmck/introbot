const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const clips = require("../../models/clips.js");
const { handleClipAutocomplete } = require("../../utils/autoComplete.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setdescription")
    .setDescription("Update description of a clip.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("clip")
        .setDescription("The clip to update")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("New description for the clip")
        .setMaxLength(250)
        .setRequired(true)
    ),

  async execute(interaction) {
    const clipId = parseInt(interaction.options.getString("clip"));
    const description = interaction.options.getString("description");

    console.log(`Setting clip ${clipId} description to ${description}`);

    // Check if clip exists
    const clip = await clips.getClip(clipId);
    if (!clip) {
      await interaction.reply({
        content: "❌ Clip not found. Use `/listclips` to see available clips.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    await clips.setClipDescription(clipId, description);

    await interaction.reply({
      content: `✅ Description for **${clip.audioFile}** set to ${description}`,
      flags: MessageFlags.Ephemeral,
    });
  },

  async autocomplete(interaction) {
    await handleClipAutocomplete(interaction);
  },
};
