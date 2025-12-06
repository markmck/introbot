const {
  SlashCommandBuilder,
  MessageFlags,
  EmbedBuilder,
} = require("discord.js");
const clips = require("../../models/clips.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("listclips")
    .setDefaultMemberPermissions(null)
    .setDescription("Shows the list of available entrance and leave clips."),

  async execute(interaction) {
    let clipList = (await clips.getAllClips()).sort((a, b) => {
      const nameA = a.audioFile.toUpperCase();
      const nameB = b.audioFile.toUpperCase();
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }

      return 0;
    });

    if (!clipList || clipList.length === 0) {
      await interaction.reply({
        content: "📂 No audio clips available yet.",
        flags: MessageFlags.Ephemeral,
      });
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(0x00ff99)
      .setTitle("Available Audio Clips")
      .setDescription(
        clipList
          .map((clip, i) => `**${i + 1}**. \`${clips.getClipTitle(clip)}\``)
          .join("\n")
      )
      .setFooter({
        text: "Use /setintro to set your intro clip or /preview to preview a clip",
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
