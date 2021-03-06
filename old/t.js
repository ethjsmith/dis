const { Client, Intents } = require('discord.js');
const { prefix, token, type, device } = require("./config.json");
//const { join } = require('path');
const ytdl = require("ytdl-core");
const prism = require("prism-media");
var fs = require('fs');
var portAudio = require('naudiodon');
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
		maxMissedFrames: Math.round(5000 / 20),
	},
});
player.on('stateChange', (oldState, newState) => {
	if (oldState.status === AudioPlayerStatus.Idle && newState.status === AudioPlayerStatus.Playing) {
		console.log('Playing audio output on audio player');
	} else if (newState.status === AudioPlayerStatus.Idle) {
		console.log('Playback has stopped. Attempting to restart.');
		attachRecorder();
	}
});
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const queue = new Map();
//console.log(portAudio.getHostAPIs());
//console.log("DEVICES!!_______________________");
//console.log(portAudio.getDevices

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
					type,
					'-i',
					type === 'dshow' ? `audio=${device}` : device,
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
	console.log('Attached recorder - ready to go!');
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

client.once("ready", () => {
  console.log("Ready!");
	attachRecorder();
});

client.once("reconnecting", () => {
  console.log("Reconnecting!");
});

client.once("disconnect", () => {
  console.log("Disconnect!");
});
// https://gist.github.com/koad/316b265a91d933fd1b62dddfcc3ff584

client.on("messageCreate", async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const serverQueue = queue.get(message.guild.id);

  if (message.content.startsWith(`${prefix}play`)) {
    //execute(message);
		join(message);
    return;
   } else {
     message.channel.send("You need to enter a valid command!");
   }
});

async function join(msg) {
	console.log("joining!");
	const channel = msg.member?.voice.channel;
	if (channel) {
		try {
				const connection = await connectToChannel(channel);
				connection.subscribe(player);
				await msg.reply('Playing now!');
			} catch (error) {
				console.error(error);
			}
		} else {
			await message.reply('Join a voice channel then try again!');
		}
	}

async function execute(message) {
  console.log(message);
//  const connection = joinVoiceChannel({channelId: message.member.voice.channel.id,guildId: message.guild.id,adapterCreator: message.guild.voiceAdapterCreator,}); // condensed the declarations that work
//  var ai = new portAudio.AudioIO({
//  inOptions: {
//    channelCount: 2,
//    sampleFormat: portAudio.SampleFormat16Bit,
//    sampleRate: 44100,
//    deviceId: 6, // Use -1 or omit the deviceId to select the default device
//    closeOnError: true // Close the stream if an audio error is detected, if set false then just log the error
//  }});
// https://amishshah.github.io/prism-media/?api#opus.encodeURIComponent // PRISM DOCS
// Create a write stream to write out to a raw audio file
//var ws = fs.createWriteStream('rawAudio.raw');

//Start streaming
//ai.pipe(ws);
// const transcoder = new prism.FFmpeg({
//   args: [
//     '-analyzeduration', '0',
//     '-loglevel', '0',
//     '-f', 's16le',
//     '-ar', '48000',
//     '-ac', '2',
//   ],
// });
// const opus = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 });
// ai.pipe(transcoder).pipe(opus);
// ai.start();
// // things are getting piped around twice here
// var resource = createAudioResource(ai.pipe(transcoder).pipe(opus));
// const player = createAudioPlayer();
// player.play(resource); // maybe ?
//attachRecorder();
}


client.login(token);
