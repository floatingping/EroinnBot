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
    client.on("messageCreate", async msg => {
        try {
            if (!msg.content?.startsWith("run ")) return;

            const commend = msg.content.split(" ")[1];
            const args = msg.content.split(" ").filter((_, i) => i > 1)

            switch (commend) {
                case "sendMessageToChannel":
                    await sendMessageToChannelAsync(args[0], args.filter((_, i) => i > 0).reduce((a, c) => `${a}${c}`, ""));
                    return;
                case "addUserWithRole":
                    await addRoleAsync(msg.guild.members.cache.find(member => member.id === args[0]), args[1]);
                    return;
                default: return;
            }
        }
        catch (e) {
            await errorLogAsync(e);
        }
    });
}



client.on('guildMemberAdd', async member => {
    try {
        await sendMessageToChannelAsync(
            process.env.Eroinn_Channel_WelcomeChannelId,
            `[${getNowTime()}] 歡迎 <@${member.user.id}> 來到色色專區😳，請先至 <#${process.env.Eroinn_Channel_CheckJoinChannelId}> ❤️，才可以開始色色😳`);
    }
    catch (e) {
        await errorLogAsync(e);
    }
});


client.on('guildMemberRemove', async member => {
    try {
        await sendMessageToChannelAsync(
            process.env.Eroinn_Channel_WelcomeChannelId,
            `[${getNowTime()}] <@${member.user.id}> 離開了我們😭😭😭`);

        await removeJoinReactionAsync(member.user.id);
    }
    catch (e) {
        await errorLogAsync(e);
    }
});


client.on('messageReactionAdd', async (reaction, user) => {
    try {
        if (reaction.message.id !== process.env.Eroinn_Message_To_Check_Join) return;

        switch (reaction.emoji.name) {
            case "❤️":
                await sendMessageToChannelAsync(
                    process.env.Eroinn_Channel_WelcomeChannelId,
                    `[${getNowTime()}] <@${user.id}> 可以開始色色了❤️❤️❤️`);
                await addRoleAsync(
                    reaction.message.guild.members.cache.find(member => member.id === user.id),
                    process.env.Eroinn_Role_CanPornId);
                return;
            default: return;
        }

    } catch (e) {
        await errorLogAsync(e);
    }
});




// Login to Discord with your client's token
client.login(process.env.myToken);


async function sendMessageToChannelAsync(channelId, content) {
    try {
        const channel = client.channels.cache.get(channelId);
        if (!channel) throw new Error(`no channel:${channelId}!`);
        await channel.send(content);
    }
    catch (e) {
        await errorLogAsync(e);
    }
}

async function addRoleAsync(member, roleId) {
    try {
        await member.roles.add(roleId);
    }
    catch (e) {
        await errorLogAsync(e);
    }
}

/**
 * 
 * @param {Error} e 
 */
async function errorLogAsync(e) {
    try {
        const channel = client.channels.cache.get(process.env.ErrorLog_ChannelId);
        await channel.send(`[${getNowTime}]\n` + `message: \`${e.message}\`` + "\n" + "stack:```" + e.stack + "```");
    }
    catch {
        console.error(e);
    }
}

/**
 * 
 * @returns string yyyy/MM/dd HH:mm:ss
 */
function getNowTime() {
    return DateTime.utc().plus({ hours: 8 }).toFormat("yyyy/MM/dd HH:mm:ss");
}

async function removeJoinReactionAsync(userId) {
    try {
        const channel = await client.channels.fetch(process.env.Eroinn_Channel_CheckJoinChannelId);
        const msg = await channel.messages.fetch(process.env.Eroinn_Message_To_Check_Join);
        await msg.reactions.cache.find(r => r.emoji.name === "❤️")?.users.remove(userId);
    }
    catch (e) {
        await errorLogAsync(e);
    }
}