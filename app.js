import "dotenv/config.js";
import { Client, Intents } from 'discord.js';
import paras from "./paras.js";

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES]
});

client.once('ready', () => {
    console.log(`${new Date()} ready...`);
});


//當 Bot 接收到訊息時的事件
client.on('messageCreate', msg => {
    if (!msg.content?.startsWith("run ")) return;

    const commend = msg.content.split(" ")[1];
    const args = msg.content.split(" ").filter((_, i) => i > 1)

    switch (commend) {
        case "sendMessageToChannel": return sendMessageToChannel(args);
        default: break;
    }
});


// Login to Discord with your client's token
client.login(process.env.myToken);


function sendMessageToChannel(args) {
    try {
        const channelId = args[0];
        const content = args.filter((_, i) => i > 0).reduce((a, c) => `${a}${c}`, "");

        const channel = client.channels.cache.get(channelId);
        channel.send(content);
    }
    catch (e) {
        errorLog(e);
    }
}

/**
 * 
 * @param {Error} e 
 */
function errorLog(e) {
    try {
        const channel = client.channels.cache.get(paras.global.errorLogchannelId);
        channel.send(`message: \`${e.message}\`` + "\n" + "stack:```" + e.stack + "```");
    }
    catch {
        console.error(e);
    }
}