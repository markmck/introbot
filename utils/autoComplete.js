  const clipList = require('../models/clips.js');
  
  // Autocomplete handler for clip names
  async function handleClipAutocomplete(interaction) {
    const focusedValue = interaction.options.getFocused().toLowerCase();
    
    // Get all available clips
    const clips = clipList.getAllClips() || [];
    
    // Filter clips based on what the user is typing
    const filtered = clips
      .filter(clip => clip.audioFile.toLowerCase().includes(focusedValue))
      .slice(0, 25); // Discord limits autocomplete to 25 options
    
    await interaction.respond(
      filtered.map(clip => ({ name: clip.audioFile, value: clip.id.toString() }))
    );
  }

module.exports = {
    handleClipAutocomplete
};