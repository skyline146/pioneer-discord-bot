const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const servers = require('../../db');

module.exports = {
    data: new SlashCommandBuilder().setName('bot-ping').setDescription('Выводит задержку бота.'),
    async execute(interaction) {
        const infoEmbed = new EmbedBuilder()
            .setColor('#018c08')
            .setDescription(`**Пинг: ${Math.round(interaction.client.ws.ping)}ms**`);

        await interaction.reply({ embeds: [infoEmbed], ephemeral: true });
    },
};
