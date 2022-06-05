import "dotenv/config.js";
import { Client, Intents } from 'discord.js';
import { DateTime } from 'luxon';

const isDebug = process.env.isDebug === "true"

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_PRESENCES,
        Intents.FLAGS.GUILD_MEMBERS,
    ],
    partials: ['MESSAGE', 'CHANNEL', 'REACTION']
});

client.once('ready', () => {
    console.log(`${new Date()} ready...`);
});


if (isDebug) {
    client.on("messageCreate", msg => {
        try {
            if (!msg.content?.startsWith("run ")) return Promise.resolve;

            const commend = msg.content.split(" ")[1];
            const args = msg.content.split(" ").filter((_, i) => i > 1)

            switch (commend) {
                case "sendMessageToChannel": return sendMessageToChannel(args[0], args.filter((_, i) => i > 0).reduce((a, c) => `${a}${c}`, ""));
                case "addUserWithRole": return addRole(msg.guild.members.cache.find(member => member.id === args[0]), args[1]);
                default: return Promise.reject;
            }
        }
        catch (e) {
            return errorLog(e);
        }
    });
}



client.on('guildMemberAdd', member => {
    try {
        return sendMessageToChannel(
            process.env.Eroinn_Channel_WelcomeChannelId,
            `[${getNowTime()}] 歡迎 <@${member.user.id}> 來到色色專區😳，請先至 <#${process.env.Eroinn_Channel_CheckJoinChannelId}> ❤️，才可以開始色色😳`);
    }
    catch (e) {
        return errorLog(e);
    }
});


client.on('guildMemberRemove', member => {
    try {
        return sendMessageToChannel(
            process.env.Eroinn_Channel_WelcomeChannelId,
            `[${getNowTime()}] <@${member.user.id}> 離開了我們😭😭😭`);
    }
    catch (e) {
        return errorLog(e);
    }
});


client.on('messageReactionAdd', async (reaction, user) => {
    try {
        if (reaction.message.id !== process.env.Eroinn_Message_To_Check_Join) return;

        switch (reaction.emoji.name) {
            case '❤️':
                await sendMessageToChannel(
                    process.env.Eroinn_Channel_WelcomeChannelId,
                    `[${getNowTime()}] <@${user.id}> 可以開始色色了❤️❤️❤️`);
                await addRole(
                    reaction.message.guild.members.cache.find(member => member.id === user.id),
                    process.env.Eroinn_Role_CanPornId);
                break;
            default: return;
        }

    } catch (e) {
        await errorLog(e);
    }
});




// Login to Discord with your client's token
client.login(process.env.myToken);


function sendMessageToChannel(channelId, content) {
    const channel = client.channels.cache.get(channelId);
    if (!channel) throw new Error(`no channel:${channelId}!`);
    return channel.send(content);
}

function addRole(member, roleId) {
    return member.roles.add(roleId);
}

/**
 * 
 * @param {Error} e 
 */
function errorLog(e) {
    try {
        const channel = client.channels.cache.get(process.env.ErrorLog_ChannelId);
        return channel.send(`[${getNowTime}]\n` + `message: \`${e.message}\`` + "\n" + "stack:```" + e.stack + "```");
    }
    catch {
        console.error(e);
        return Promise.resolve;
    }
}

/**
 * 
 * @returns string yyyy/MM/dd HH:mm:ss
 */
function getNowTime() {
    return DateTime.now().toFormat("yyyy/MM/dd HH:mm:ss");
}