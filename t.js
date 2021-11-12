const { Client, Intents } = require('discord.js');
const { prefix, token } = require("./config.json");
const { join } = require('path');
const { joinVoiceChannel, createAudioResource, createAudioPlayer, StreamType  } = require('@discordjs/voice');
const ytdl = require("ytdl-core");
const prism = require("prism-media");
var fs = require('fs');
var portAudio = require('naudiodon');


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

const queue = new Map();
console.log(portAudio.getHostAPIs());
console.log("DEVICES!!_______________________");
console.log(portAudio.getDevices());
client.once("ready", () => {
  console.log("Ready!");
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
    execute(message);
    return;
   } else {
     message.channel.send("You need to enter a valid command!");
   }
});


async function execute(message) {
  console.log(message);
  const connection = joinVoiceChannel({channelId: message.member.voice.channel.id,guildId: message.guild.id,adapterCreator: message.guild.voiceAdapterCreator,}); // condensed the declarations that work
  var ai = new portAudio.AudioIO({
  inOptions: {
    channelCount: 2,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 44100,
    deviceId: 6, // Use -1 or omit the deviceId to select the default device
    closeOnError: true // Close the stream if an audio error is detected, if set false then just log the error
  }});
// https://amishshah.github.io/prism-media/?api#opus.encodeURIComponent // PRISM DOCS
// Create a write stream to write out to a raw audio file
//var ws = fs.createWriteStream('rawAudio.raw');

//Start streaming
//ai.pipe(ws);
const transcoder = new prism.FFmpeg({
  args: [
    '-analyzeduration', '0',
    '-loglevel', '0',
    '-f', 's16le',
    '-ar', '48000',
    '-ac', '2',
  ],
});
const opus = new prism.opus.Encoder({ rate: 48000, channels: 2, frameSize: 960 });
ai.pipe(transcoder).pipe(opus);
ai.start();

resource = createAudioResource(ai.pipe(transcoder).pipe(opus));
const player = createAudioPlayer();
player.play(resource); // maybe ?
}


client.login(token);
