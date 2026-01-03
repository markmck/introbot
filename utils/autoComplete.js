const clipList = require("../models/clips.js");

async function handleClipAutocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    const clipType = interaction.options["type"] || null;
    console.log(interaction.options);
    console.log(clipType);

    const clips =
      (await await clipList.getAllClips(clipType)).sort((a, b) => {
        const nameA = a.audioFile.toUpperCase();
        const nameB = b.audioFile.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }

        return 0;
      }) || [];

    const filtered = clips
      .filter((clip) =>
        clipList.getClipTitle(clip).toLowerCase().includes(focusedValue)
      )
      .slice(0, 25); // Discord limits autocomplete to 25 options

    await interaction.respond(
      filtered.map((clip) => ({
        name: clipList.getClipTitle(clip),
        value: clip.id.toString(),
      }))
    );
  } catch (error) {
    console.error("Error in autocomplete:", error);
    await interaction.respond([]);
  }
}

module.exports = {
  handleClipAutocomplete,
};
