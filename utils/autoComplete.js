const clipList = require('../models/clips.js');

async function handleClipAutocomplete(interaction) {
  try {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    
    const clips = await clipList.getAllClips() || [];
    
    const filtered = clips
      .filter(clip => clipList.getClipTitle(clip).toLowerCase().includes(focusedValue))
      .slice(0, 25); // Discord limits autocomplete to 25 options
    
    await interaction.respond(
      filtered.map(clip => ({ name: clipList.getClipTitle(clip), value: clip.id.toString() }))
    );
  } catch (error) {
    console.error('Error in autocomplete:', error);
    await interaction.respond([]);
  }
}

module.exports = {
  handleClipAutocomplete
};