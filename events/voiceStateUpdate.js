const { Events } = require("discord.js");
const { playAudio } = require("../utils/audioPlayer");
const path = require("path");

const entranceList = require("../models/entrance.js");
const leaveList = require("../models/leave.js");
const clipsList = require("../models/clips.js");

const lastVoiceJoin = new Map();
const COOLDOWN_SECONDS = 10;

module.exports = {
  name: Events.VoiceStateUpdate,
  async execute(oldState, newState) {
    const member = newState.member;
    const now = Date.now();
    const enterAudio = clipsList.getClip(
      entranceList.getById(member.id)?.audioFileId ?? -1
    );
    const leaveAudio = clipsList.getClip(
      leaveList.getById(member.id)?.audioFileId ?? -1
    );

    // User joined a voice channel
    if (!oldState.channel && newState.channel && enterAudio) {
      const lastTime = lastVoiceJoin.get(member.id) || 0;

      // Check cooldown
      if (now - lastTime < COOLDOWN_SECONDS * 1000) {
        const timeRemaining = Math.ceil(
          (COOLDOWN_SECONDS * 1000 - (now - lastTime)) / 1000
        );
        console.log(`Cooldown active: ${timeRemaining} second(s) remaining`);
        return;
      }
      lastVoiceJoin.set(member.id, now);

      console.log(
        `${member.user.tag} joined voice channel: ${newState.channel.name}`
      );
      const { audioFile, volume } = enterAudio;
      await playAudio(
        newState.channel,
        path.join(__dirname, "../audio", audioFile),
        volume
      );
    }

    // User left a voice channel
    if (oldState.channel && !newState.channel && leaveAudio) {
      console.log(
        `${member.user.tag} left voice channel: ${oldState.channel.name}`
      );
      const { audioFile, volume } = leaveAudio;
      await playAudio(
        oldState.channel,
        path.join(__dirname, "../audio", audioFile),
        volume
      );
    }
  },
};
