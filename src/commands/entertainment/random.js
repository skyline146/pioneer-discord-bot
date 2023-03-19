const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Генерирует случайное число в заданном диапазоне.')
        .addIntegerOption(option => option.setName('from').setDescription('От:').setRequired(true))
        .addIntegerOption(option => option.setName('to').setDescription('До:').setRequired(true)),
    async execute(interaction) {
        const from = interaction.options.getInteger('from'),
            to = interaction.options.getInteger('to');

        const max = Math.max(from, to),
            min = Math.min(from, to);

        const random = Math.floor(Math.random() * (max - min + 1) + min);

        const embed = new EmbedBuilder()
            .setColor('#018c08')
            .setTitle(`Случайное число от ${min} до ${max}:`)
            .setDescription(`${random}`);

        await interaction.reply({ embeds: [embed] });
    },
};
