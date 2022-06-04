import "dotenv/config.js";
import { Client, Intents } from 'discord.js';
import { DateTime } from 'luxon';

const isDebug = process.env.isDebug === "true"

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.once('ready', () => {
    console.log(`${new Date()} ready...`);
});


if (isDebug) {
    //當 Bot 接收到訊息時的事件
    client.on('messageCreate', msg => {
        if (!msg.content?.startsWith("run ")) return;

        const commend = msg.content.split(" ")[1];
        const args = msg.content.split(" ").filter((_, i) => i > 1)

        switch (commend) {
            case "sendMessageToChannel": return sendMessageToChannel(args);
            case "addUserWithRole": return addRole(msg.guild.members.cache.find(member => member.id === args[0]), args[1]);
            default: break;
        }
    });
}

client.on('messageReactionAdd', (reaction, user) => {
    if (reaction.message.id !== process.env.Eroinn_Message_To_Check_Join) return;
    switch (reaction.emoji.name) {
        case '❤️':
            return addRole(reaction.message.guild.members.cache.find(member => member.id === user.id), process.env.Eroinn_Role_CanPornId);
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
        if (!channel) throw new Error(`no channel:${channelId}!`);
        channel.send(content);
    }
    catch (e) {
        errorLog(e);
    }
}

function addRole(member, roleId) {
    member.roles.add(roleId);
}

/**
 * 
 * @param {Error} e 
 */
function errorLog(e) {
    try {
        const channel = client.channels.cache.get(process.env.ErrorLog_ChannelId);
        channel.send(`[${DateTime.now().toFormat("yyyy/MM/dd HH:mm:ss")}]\n` + `message: \`${e.message}\`` + "\n" + "stack:```" + e.stack + "```");
    }
    catch {
        console.error(e);
    }
}