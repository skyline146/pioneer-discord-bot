const { Events, ActivityType, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(bot) {
        console.log(`Bot is ready to use!`);

        const activityList = {
            0: 'EVERLASTING SUMMER',
            1: 'BEST GAME EVER!',
        };

        bot.user.setActivity(`${bot.guilds.cache.size} Servers`, {
            type: ActivityType.Watching,
        });
    },
};
