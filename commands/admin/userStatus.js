const {
  SlashCommandBuilder,
  EmbedBuilder,
  MessageFlags,
  PermissionFlagsBits,
} = require("discord.js");
const clips = require("../../models/clips.js");
const entrance = require("../../models/entrance.js");
const leave = require("../../models/leave.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("userstatus")
    .setDescription("Get current intro and outro clips for specified user")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to check the status for")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const userId = user.id;

    // Get user's intro and outro
    const userIntro = await entrance.getById(userId);
    const userOutro = await leave.getById(userId);

    // Get the actual clip details
    const introClip = userIntro
      ? await clips.getClip(userIntro.audioFileId)
      : null;
    const outroClip = userOutro
      ? await clips.getClip(userOutro.audioFileId)
      : null;

    // Create embed
    const embed = new EmbedBuilder()
      .setColor(0x00ff99)
      .setTitle(`🎵 ${user.username}'s Clips`)
      .addFields(
        {
          name: "Intro",
          value: introClip
            ? `**${clips.getClipTitle(introClip)}** (File: ${
                introClip.audioFile
              })`
            : "_Not set_",
          inline: false,
        },
        {
          name: "Outro",
          value: outroClip
            ? `**${clips.getClipTitle(outroClip)}** (File: ${
                outroClip.audioFile
              })`
            : "_Not set_",
          inline: false,
        }
      );

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  },
};
