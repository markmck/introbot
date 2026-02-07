const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus,
  getVoiceConnection,
} = require('@discordjs/voice');

/**
 * Safely disconnect from a voice channel
 */
function safeDisconnect(guildId, reason) {
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

const activeGuilds = new Set();

/**
 * Play audio in a voice channel.
 * If audio is already playing in the guild, the request is silently skipped.
 */
async function playAudio(channel, filePath, volume = 0.5) {
  const guildId = channel.guild.id;

  if (activeGuilds.has(guildId)) {
    console.log(`[playAudio] Audio already active in guild ${guildId}, skipping`);
    return;
  }

  activeGuilds.add(guildId);

  try {
    const connection = joinVoiceChannel({
      channelId: channel.id,
      guildId: channel.guild.id,
      adapterCreator: channel.guild.voiceAdapterCreator,
    });

    await entersState(connection, VoiceConnectionStatus.Ready, 5000);
    console.log("[playAudio] Connection ready");

    const player = createAudioPlayer();
    const resource = createAudioResource(filePath, {
      inlineVolume: true,
    });
    resource.volume.setVolume(volume);

    console.log(`[playAudio] Playing audio: ${filePath}`);

    connection.subscribe(player);
    player.play(resource);

    await new Promise((resolve) => {
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

        setTimeout(() => {
          safeDisconnect(guildId, "after playback");
          resolve();
        }, 1000);
      });

      player.on("error", (error) => {
        console.error(`[AudioPlayer] Error: ${error.message}`);
        console.error(error);
        clearTimeout(timeout);
        safeDisconnect(guildId, "playback error");
        resolve();
      });
    });
  } catch (err) {
    console.error('[playAudio] Voice connection failed:', err);
    safeDisconnect(guildId, "error");
  } finally {
    activeGuilds.delete(guildId);
  }
}

module.exports = {
  playAudio,
  safeDisconnect,
};
