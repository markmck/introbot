const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const clips = require("../../models/clips.js");
const entrance = require("../../models/entrance.js");
const { handleClipAutocomplete } = require("../../utils/autoComplete.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setintro")
    .setDescription("Set your introduction audio clip.")
    .addStringOption((option) =>
      option
        .setName("clip")
        .setDescription("The clip to set as your intro")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction) {
    const clipId = parseInt(interaction.options.getString("clip"));
    const userId = interaction.user.id;

    console.log(`User ${userId} is setting intro clip to ID: ${clipId}`);

    // Check if clip exists
    const clip = await clips.getClip(clipId);
    if (!clip) {
      await interaction.reply({
        content: "❌ Clip not found. Use `/listclips` to see available clips.",
        ephemeral: true,
      });
      return;
    }

    // Check if user already has an intro
    const existingIntro = await entrance.getById(userId);
    
    if (existingIntro) {
      await entrance.update(userId, clipId);
    } else {
      await entrance.insert(userId, clipId);
    }

    await interaction.reply({
      content: `✅ Your intro clip has been set to: **${clips.getClipTitle(clip)}**`,
      ephemeral: true,
    });
  },

  // Autocomplete handler for clip names
  async autocomplete(interaction) {
    await handleClipAutocomplete(interaction);
  },
};
