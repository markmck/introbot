const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  MessageFlags,
} = require("discord.js");
const clips = require("../../models/clips.js");
const entrance = require("../../models/entrance.js");
const { handleClipAutocomplete } = require("../../utils/autoComplete.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("setintroforuser")
    .setDescription("Set the intro audio clip for a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to set the intro for")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("clip")
        .setDescription("The clip to set as your intro")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const clipId = parseInt(interaction.options.getString("clip"));
    const user = interaction.options.getUser("user");
    const userId = user.id;

    console.log(`User ${userId} is setting intro clip to ID: ${clipId}`);

    // Check if clip exists
    const clip = await clips.getClip(clipId);
    if (!clip) {
      await interaction.reply({
        content: "❌ Clip not found. Use `/listclips` to see available clips.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    // Check if user already has an intro
    const existingIntro = await entrance.getById(userId);

    if (existingIntro) {
      await entrance.update(userId, clipId);
    } else {
      await entrance.insert(userId, clipId, user.username);
    }

    await interaction.reply({
      content: `The Intro clip for the <@${userId}> is set to **${clips.getClipTitle(
        clip
      )}**`,
      flags: MessageFlags.Ephemeral,
    });
  },

  // Autocomplete handler for clip names
  async autocomplete(interaction) {
    await handleClipAutocomplete(interaction);
  },
};
