const clips = [
  { id: 1, audioFile: "gila.mp3", volume: 0.6 },
  { id: 2, audioFile: "mustard.mp3", volume: 0.7 },
  { id: 3, audioFile: "money_machine.mp3", volume: 0.7 },
  { id: 4, audioFile: "bg3_theme.mp3", volume: 0.7 },
  { id: 5, audioFile: "blink.mp3", volume: 0.8 },
  { id: 6, audioFile: "cage_norest.mp3", volume: 0.8 },
  { id: 7, audioFile: "happydays.mp3", volume: 0.8 },
  { id: 8, audioFile: "no_broke_boys.mp3", volume: 0.8 },
  { id: 9, audioFile: "yungbae.mp3", volume: 0.6 },
  { id: 10, audioFile: "hullabaloo.mp3", volume: 0.8 },
];

function getAllClips() {
  return clips;
}

function insertClip(audioFile, volume = 0.8) {
  const newId = clips.length > 0 ? Math.max(...clips.map((c) => c.id)) + 1 : 1;
  const newClip = { id: newId, audioFile, volume };
  clips.push(newClip);
  return newClip;
}

function getClip(id) {
  return clips.find((c) => c.id === id);
}

function setClipVolume(id, volume) {
  const clip = getClip(id);
  if (clip) {
    clip.volume = volume;
    return 1;
  }
}

module.exports = {
  getAllClips,
  insertClip,
  setClipVolume,
  getClip,
};
