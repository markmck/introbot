// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
} = require("@discordjs/voice");
const audioList = require("./audioEnterLeave.json");
const audioEntranceList = audioList.entrance;
const audioLeaveList = audioList.leave;
const path = require("path");
const { token } = require("./config.json");
require("dotenv").config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
  ],
});

const lastVoiceJoin = new Map();
const COOLDOWN_SECONDS = 10;

// Handle voice join/leave
client.on(Events.VoiceStateUpdate, async (oldState, newState) => {
  const member = newState.member;
  const now = Date.now();

  if (!oldState.channel && newState.channel && audioEntranceList[member.id]) {
    const lastTime = lastVoiceJoin.get(member.id) || 0;

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
    const { audioFile, volume } = audioEntranceList[member.id];
    await playAudio(
      newState.channel,
      path.join(__dirname, "audio", audioFile),
      volume
    );
  }

  if (oldState.channel && !newState.channel && audioLeaveList[member.id]) {
    console.log(
      `${member.user.tag} left voice channel: ${oldState.channel.name}`
    );
    const { audioFile, volume } = audioLeaveList[member.id];
    await playAudio(
      oldState.channel,
      path.join(__dirname, "audio", audioFile),
      volume
    );
  }
});

// Safe disconnect wrapper
async function safeDisconnect(guildId, reason) {
  const connection = getVoiceConnection(guildId);
  if (connection) {
    console.log(
      `[safeDisconnect] Disconnecting from ${connection.joinConfig.channelId} — Reason: ${reason}`
    );
    connection.destroy();
  } else {
    console.log(
      `[safeDisconnect] No active voice connection found for guild ${guildId}`
    );
  }
}

// Play audio in voice channel
async function playAudio(channel, filePath, volume = 0.5) {
  const guildId = channel.guild.id;
  await safeDisconnect(guildId, "before new audio playback");

  const connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: channel.guild.id,
    adapterCreator: channel.guild.voiceAdapterCreator,
  });

  try {
    await entersState(connection, VoiceConnectionStatus.Ready, 5000);
    console.log("[playAudio] Connection ready");
  } catch (error) {
    console.error("Failed to connect to voice channel:", error);
    connection.destroy();
    return;
  }

  const player = createAudioPlayer();

  try {
    const resource = createAudioResource(filePath, {
      inlineVolume: true,
    });
    resource.volume.setVolume(volume);

    console.log(`[playAudio] Playing audio: ${filePath}`);

    connection.subscribe(player);
    player.play(resource);

    return new Promise((resolve) => {
      // 30 second timeout in case audio never finishes
      const timeout = setTimeout(() => {
        console.log("[playAudio] Audio playback timeout - forcing disconnect");
        safeDisconnect(guildId, "timeout");
        resolve();
      }, 30000);

      player.on(AudioPlayerStatus.Playing, () => {
        console.log("[playAudio] Audio is now playing");
      });

      player.on(AudioPlayerStatus.Idle, () => {
        console.log("[playAudio] Audio finished (Idle status)");
        clearTimeout(timeout);

        // Wait longer before disconnecting so you can check
        setTimeout(() => {
          safeDisconnect(guildId, "after playback");
          resolve();
        }, 1000); // 1 second delay
      });

      player.on("error", (error) => {
        console.error(`[AudioPlayer] Error: ${error.message}`);
        console.error(error);
        clearTimeout(timeout);
        safeDisconnect(guildId, "playback error");
        resolve();
      });
    });
  } catch (error) {
    console.error("[playAudio] Error creating audio resource:", error);
    connection.destroy();
    return;
  }
}

client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

// Log in to Discord with your client's token
client.login(token);
