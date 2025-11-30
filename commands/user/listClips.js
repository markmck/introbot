const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const clips = require("../../models/clips.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listclips")
    .setDefaultMemberPermissions(null)
    .setDescription("Shows the list of available entrance and leave clips."),

  async execute(interaction) {
    let clipList = await clips.getAllClips();
    if (!clipList || clipList.length === 0) {
      await interaction.reply({
        content: "📂 No audio clips available yet.",
        ephemeral: true,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("🎵 Available Audio Clips")
      .setDescription(
        clipList.map((clip) => `**${clip.id}**: ${clip.audioFile}`).join("\n")
      )
      .setFooter({
        text: "Use /setintro to set your intro clip or /preview to preview a clip",
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
