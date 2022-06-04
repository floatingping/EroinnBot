require('dotenv').config();


const { Client, Intents } = require('discord.js');

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES]
});

client.once('ready', () => {
    console.log(`${new Date()} ready...`);
});


// 當 Bot 接收到訊息時的事件
client.on('messageCreate', msg => {
    console.log(msg.content);
    // 如果訊息的內容是 'ping'
    if (msg.content === 'ping') {
        // 則 Bot 回應 'Pong'
        msg.reply('pong');
    }
});

// Login to Discord with your client's token
client.login(process.env.myToken);
