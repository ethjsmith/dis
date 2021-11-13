// Require the necessary discord.js classes
const { Client, Intents } = require('discord.js');
const { joinVoiceChannel } = require('@discordjs/voice');
const { prefix,
				token,
			 } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.login(token);

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
});
client.once('reconnecting', () => {
 console.log('Reconnecting!');
});
client.once('disconnect', () => {
 console.log('Disconnect!');
});
// Login to Discord with your client's token

client.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;
	const serverQueue = queue.get(message.guild.id);

if (message.content.startsWith(`${prefix}play`)) {
    execute(message, serverQueue);
    return;
} else if (message.content.startsWith(`${prefix}skip`)) {
    skip(message, serverQueue);
    return;
} else if (message.content.startsWith(`${prefix}stop`)) {
    stop(message, serverQueue);
    return;
} else {
    message.channel.send("You need to enter a valid command!");
}
})
// const connection = joinVoiceChannel({
// 	channelId: 367858582546546694,
// 	guildId: channel.guild.id,
// 	adapterCreator: channel.guild.voiceAdapterCreator,
// });
