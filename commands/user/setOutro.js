const { SlashCommandBuilder } = require("discord.js");
const clips = require("../../models/clips.js");
const leave = require("../../models/leave.js");
const { handleClipAutocomplete } = require("../../utils/autoComplete.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setoutro")
    .setDescription("Set your outro/leave audio clip.")
    .addStringOption((option) =>
      option
        .setName("clip")
        .setDescription("The clip to set as your outro")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction) {
    const clipId = parseInt(interaction.options.getString("clip"));
    const userId = interaction.user.id;

    console.log(`User ${userId} is setting outro clip to ID: ${clipId}`);

    const clip = await clips.getClip(clipId);
    if (!clip) {
      await interaction.reply({
        content: "❌ Clip not found. Use `/listclips` to see available clips.",
        ephemeral: true,
      });
      return;
    }

    const existingOutro = await leave.getById(userId);
    
    if (existingOutro) {
      await leave.update(userId, clipId);
    } else {
      await leave.insert(userId, clipId, interaction.user.username);
    }

    await interaction.reply({
      content: `✅ Your outro clip has been set to: **${clips.getClipTitle(clip)}**`,
      ephemeral: true,
    });
  },

  async autocomplete(interaction) {
    await handleClipAutocomplete(interaction);
  },
};