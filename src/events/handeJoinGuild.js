const { Events, EmbedBuilder } = require('discord.js');

const { servers } = require('../db');

// (async () => {
//     const guildData = await servers.get('1069232593280708658');

//     const text = guildData.greetings.text;
//     text.replace('{user}', '123');
//     text.replace('{server}', '123');

//     console.log(text);
// })();

module.exports = {
    name: Events.GuildMemberAdd,
    async execute(interaction) {
        const guildData = await servers.get(interaction.guild.id);

        if (guildData === undefined || !guildData.greetings) return;

        const channel = interaction.guild.channels.cache.get(guildData.greetings.channel);
        const text = guildData.greetings.text
            .replace('{user}', interaction.user)
            .replace('{server}', interaction.guild.name);

        await channel.send({ content: `**${text}**` });
    },
};
