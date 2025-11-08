// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  getVoiceConnection,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus
} = require('@discordjs/voice');
const { token } = require('./config.json');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

// Add the user ID(s) you want to track
const TRACKED_USERS = ['355177890045755395', 'USER_ID_2']; // Replace with actual Discord user IDs

client.on('voiceStateUpdate', async (oldState, newState) => {
    // Check if this is a tracked user
    if (!TRACKED_USERS.includes(newState.member.id)) return;

    // User joined a voice channel
    if (!oldState.channelId && newState.channelId) {
        console.log(`${newState.member.user.tag} joined voice channel`);
        playAudio(newState.channel, './audio/join.mp3'); // Your join sound
    }

    // User left a voice channel
    if (oldState.channelId && !newState.channelId) {
        console.log(`${oldState.member.user.tag} left voice channel`);
        playAudio(oldState.channel, './audio/leave.mp3'); // Your leave sound
    }
});

async function playAudio(channel, audioPath) {
    try {
        const connection = joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });

        const player = createAudioPlayer();
        const resource = createAudioResource(audioPath);

        player.play(resource);
        connection.subscribe(player);

        // Leave after audio finishes
        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });

    } catch (error) {
        console.error('Error playing audio:', error);
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

// Log in to Discord with your client's token
client.login(token);