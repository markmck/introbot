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
    .setDescription("Shows the list of available entrance and leave clips.")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Optionally filter by clip type (intro or outro)")
        .setRequired(false)
        .addChoices(
          { name: "Intro", value: "intro" },
          { name: "Outro", value: "outro" }
        )
    ),

  async execute(interaction) {
    const typeOption = interaction.options.getString("type");
    const type =
      typeOption === "intro" || typeOption === "outro" ? typeOption : null;
    let clipList = (await clips.getAllClips(type)).sort((a, b) => {
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

    const title = type ? `Available ${type.charAt(0).toUpperCase() + type.slice(1)} Clips` : "Available Audio Clips";
    const command = type === "outro" ? "/setoutro" : "/setintro";

    const embed = new EmbedBuilder()
      .setColor(0x00ff99)
      .setTitle(title)
      .setDescription(
        clipList
          .map((clip, i) => `**${i + 1}**. \`${clips.getClipTitle(clip)}\``)
          .join("\n")
      )
      .setFooter({
        text: `Use ${command} to set your ${type || "intro"} clip or /preview to preview a clip`,
      })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
