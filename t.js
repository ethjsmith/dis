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
  // } else if (message.content.startsWith(`${prefix}skip`)) {
  //   console.log("got skip");
  //   skip(message, serverQueue);
  //   return;
  // } else if (message.content.startsWith(`${prefix}stop`)) {
  //   stop(message, serverQueue);
  //   return;
   } else {
     message.channel.send("You need to enter a valid command!");
   }
});
// client.on("messageCreate", (message) => {
//   if (message.author.bot) return false;
//
//   console.log(`Message from ${message.author.username}: ${message.content}`);
// });
async function execute(message) {
  console.log(message);
  const connection = joinVoiceChannel({
  	channelId: message.member.voice.channel.id,
  	guildId: message.guild.id,
  	adapterCreator: message.guild.voiceAdapterCreator,
  });
  var ai = new portAudio.AudioIO({
  inOptions: {
    channelCount: 2,
    sampleFormat: portAudio.SampleFormat16Bit,
    sampleRate: 44100,
    deviceId: 6, // Use -1 or omit the deviceId to select the default device
    closeOnError: true // Close the stream if an audio error is detected, if set false then just log the error
  }
});

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
console.log("just checking where it gets to");
resource = createAudioResource(ai.pipe(transcoder).pipe(opus));
//ai.start();
const player = createAudioPlayer();
player.play(resource); // maybe ? 
console.log("The code does hit");
}
async function execute2(message, serverQueue) {
  const args = message.content.split(" ");
  console.log(message.member);
  const voiceChannel = message.member.voice.channel;
  if (!voiceChannel)
    return message.channel.send(
      "You need to be in a voice channel to play music!"
    );
  const permissions = voiceChannel.permissionsFor(message.client.user);
  if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
    return message.channel.send(
      "I need the permissions to join and speak in your voice channel!"
    );
  }
  //
  // const songInfo = await ytdl.getInfo(args[1]);
  // const song = {
  //       title: songInfo.videoDetails.title,
  //       url: songInfo.videoDetails.video_url,
  //  };
  //
  if (!serverQueue) {
    const queueContruct = {
      textChannel: message.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };

    queue.set(message.guild.id, queueContruct);

    queueContruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueContruct.connection = connection;
      play(message.guild, queueContruct.songs[0]);
    } catch (err) {
      console.log(err);
      queue.delete(message.guild.id);
      return message.channel.send(err);
    }
  } else {
    serverQueue.songs.push(song);
    return message.channel.send(`${song.title} has been added to the queue!`);
  }
}

function skip(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );
  if (!serverQueue)
    return message.channel.send("There is no song that I could skip!");
  serverQueue.connection.dispatcher.end();
}

function stop(message, serverQueue) {
  if (!message.member.voice.channel)
    return message.channel.send(
      "You have to be in a voice channel to stop the music!"
    );

  if (!serverQueue)
    return message.channel.send("There is no song that I could stop!");

  serverQueue.songs = [];
  serverQueue.connection.dispatcher.end();
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);
  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }

  const dispatcher = serverQueue.connection
    .play(ytdl(song.url))
    .on("finish", () => {
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
  serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

client.login(token);
