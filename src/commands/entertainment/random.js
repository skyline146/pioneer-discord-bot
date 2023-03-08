const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Генерирует случайное число в заданном диапазоне.')
        .addIntegerOption(option => option.setName('from').setDescription('От:').setRequired(true))
        .addIntegerOption(option => option.setName('to').setDescription('До:').setRequired(true)),
    async execute(interaction) {
        const from = interaction.options.getInteger('from');
        const to = interaction.options.getInteger('to');

        const random = Math.floor(Math.random() * (to - from + 1) + from);

        const embed = new EmbedBuilder()
            .setColor('#018c08')
            .setTitle(`Случайное число от ${from} до ${to}:`)
            .setDescription(`${random}`);

        await interaction.reply({ embeds: [embed] });
    },
};
