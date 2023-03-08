const { Events, ChannelType } = require('discord.js');
const { servers } = require('../db');

let tempVoiceChannels = [];

function deleteTempChannel(oldState) {
    // const currGuild = servers.get(oldState.guild.id);
    //delete temp channel when all users left
    try {
        const channelId = tempVoiceChannels.filter(id => id === oldState.channelId)[0];

        if (!channelId) return;

        const index = tempVoiceChannels.indexOf(channelId);
        const currChannel = oldState.guild.channels.cache.get(channelId);

        if (currChannel.members.size !== 0) return;

        currChannel.delete();
        tempVoiceChannels.splice(index, 1);
    } catch {
        console.log('Не получилось удалить временный канал.');
    }
}

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        const currGuild = (await servers.get(oldState.guild.id)) ?? {};

        if (Object.keys(currGuild).length === 0) return;

        //creating voice channel when join specific channel
        if (currGuild.voiceChannelBuilders) {
            const specificChannel = currGuild.voiceChannelBuilders.filter(
                channel => channel.id === newState.channelId
            )[0];

            // console.log(newState.member);

            if (specificChannel) {
                //delete temp channel when user join to specific channel and here 0 users in channel left
                deleteTempChannel(oldState);

                const voiceCategory = newState.guild.channels.cache.get(specificChannel.categoryWhereCreate);
                await voiceCategory.children
                    .create({
                        name: `${specificChannel.createdChannelName.replace('{user}', newState.member.user.username)}`,
                        type: ChannelType.GuildVoice,
                    })
                    .then(channel => {
                        channel.setUserLimit(specificChannel.userLimit);
                        newState.member.voice.setChannel(channel);
                        tempVoiceChannels.push(channel.id);
                    });
            } else {
                //delete temp channel when all users left
                deleteTempChannel(oldState);
            }
        }
    },
};
