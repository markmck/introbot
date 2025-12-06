// commands/admin/addclip.js
const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const clipsList = require("../../models/clips");
const path = require("path");
const fs = require("fs").promises;
const https = require("https");
const http = require("http");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("addclip")
    .setDescription("Add a new audio clip")
    .addAttachmentOption((option) =>
      option
        .setName("file")
        .setDescription("Audio file to add (mp3, wav, ogg)")
        .setRequired(true)
    )
    .addNumberOption((option) =>
      option
        .setName("volume")
        .setDescription("Volume level (0.1 to 1.0)")
        .setMinValue(0.1)
        .setMaxValue(1.0)
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("description")
        .setDescription("Description of the audio clip")
        .setRequired(false)
    )

    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const attachment = interaction.options.getAttachment("file");
    const volume = interaction.options.getNumber("volume") || 0.8;
    const description = interaction.options.getString("description") || "";

    // Validate file type
    const validExtensions = [".mp3", ".wav"];
    const fileExt = path.extname(attachment.name).toLowerCase();

    if (!validExtensions.includes(fileExt)) {
      return interaction.editReply({
        content: `Invalid file type. Please upload one of: ${validExtensions.join(
          ", "
        )}`,
      });
    }

    try {
      // Download the file
      const audioDir = path.join(__dirname, "..", "..", "audio");
      await fs.mkdir(audioDir, { recursive: true });

      const fileName = attachment.name;
      const filePath = path.join(audioDir, fileName);

      // Download from Discord CDN
      await downloadFile(attachment.url, filePath);

      // Add to clips database
      const newClip = await clipsList.insertClip(fileName, volume, description);

      await interaction.editReply({
        content: `✅ Clip added successfully!\n**ID:** ${newClip.id}\n**File:** ${newClip.audioFile}\n**Volume:** ${newClip.volume}\n**Description:** ${newClip.description}`,
      });

      await interaction.channel.send({
        content: `🎵 **${
          newClip.description ?? newClip.audioFile
        }** was added!`,
        files: [{ attachment: filePath, name: newClip.audioFile }],
      });
    } catch (error) {
      console.error("Error adding clip:", error);
      await interaction.editReply({
        content: `❌ Error adding clip: ${error.message}`,
      });
    }
  },
};

// Helper function to download file
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = require("fs").createWriteStream(filePath);

    protocol
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve();
        });
      })
      .on("error", (err) => {
        require("fs").unlink(filePath, () => {}); // Delete partial file
        reject(err);
      });
  });
}
