const {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const clips = require("../../models/clips.js");
const { handleClipAutocomplete } = require("../../utils/autoComplete.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("clipdetails")
    .setDescription("Get the details of a specific clip.")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addStringOption((option) =>
      option
        .setName("clip")
        .setDescription("The clip to get details for")
        .setRequired(true)
        .setAutocomplete(true)
    ),
  async execute(interaction) {
    const clipId = parseInt(interaction.options.getString("clip"));

    // Check if clip exists
    const clip = await clips.getClip(clipId);
    if (!clip) {
      await interaction.reply({
        content: "❌ Clip not found. Use `/listclips` to see available clips.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff99)
      .setTitle(`Details for Clip: ${clip.audioFile}`)
      .addFields(
        { name: "ID", value: clip.id.toString(), inline: true },
        { name: "File", value: clip.audioFile, inline: true },
        { name: "Volume", value: clip.volume.toString(), inline: true },
        {
          name: "Description",
          value: clip.description || `_No description_`,
          inline: false,
        }
      )
      .setFooter({
        text: `Use /setintro to set your intro to this clip or /preview to preview it.`,
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },

  async autocomplete(interaction) {
    await handleClipAutocomplete(interaction);
  },
};
