require('module-alias/register');

const { Client } = require('discord.js');
const prism = require('prism-media');
const config = require('./config.json');
const {
	NoSubscriberBehavior,
	StreamType,
	createAudioPlayer,
	createAudioResource,
	entersState,
	AudioPlayerStatus,
	VoiceConnectionStatus,
	joinVoiceChannel,
} = require('@discordjs/voice');

const player = createAudioPlayer({
	behaviors: {
		noSubscriber: NoSubscriberBehavior.Play,
		maxMissedFrames: Math.round(config.maxTransmissionGap / 20),
	},
});

player.on('stateChange', (oldState, newState) => {
	if (oldState.status === AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Playing) {
		console.log('Playing audio output on audio player');
	} else if (newState.status === AudioPlayerStatus.Idle) {
		//console.log('Playback has stopped. Attempting to restart.');
		attachRecorder();
	}
});

function attachRecorder() {
	player.play(
		createAudioResource(
			new prism.FFmpeg({
				args: [
					'-analyzeduration',
					'0',
					'-loglevel',
					'0',
					'-f',
					config.type,
					'-i',
					config.type === 'dshow' ? `audio=${config.device}` : config.device,
					'-acodec',
					'libopus',
					'-f',
					'opus',
					'-ar',
					'48000',
					'-ac',
					'2',
				],
			}),
			{
				inputType: StreamType.OggOpus,
			},
		),
	);
	//console.log('Attached recorder - ready to go!');
}

async function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
}

const client = new Client({ intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'] });

client.on('ready', async () => {
	console.log('discord.js client is ready!');
	attachRecorder();
});
let lastTime = new Date("April 24, 2022")
client.on('messageCreate', async (message) => {
	if (!message.guild) return;
	if (message.content === '-join') {
		const channel = message.member?.voice.channel;
		if (channel) {
			try {
				const connection = await connectToChannel(channel);
				connection.subscribe(player);
				await message.reply('Playing now!');
			} catch (error) {
				console.error(error);
			}
		} else {
			await message.reply('Join a voice channel then try again!');
		}
	} else if (message.content === '-days') {
		let today = new Date()
		let days = (today.getTime() - lastTime.getTime()) / (1000* 3600 * 24)
		console.log(days)
		await message.reply(`It has been ${parseInt(days)} days since we have played dallins campaign ( ${lastTime.toLocaleDateString("en-US")} )`);
	}
	else if (message.content === '-newday') {
		lastTime = new Date()
		await message.reply("New day set ")
	}
});

void client.login(config.token);
