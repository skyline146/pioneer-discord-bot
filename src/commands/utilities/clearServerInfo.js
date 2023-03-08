const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { servers } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear-server-info')
        .setDescription('Удаляет всю информацию о сервере из базы данных.'),
    async execute(interaction) {
        interaction.guild.fetchOwner().then(async owner => {
            if (owner.user.id === interaction.user.id) {
                try {
                    await servers.delete(interaction.guild.id);

                    await interaction.reply({ content: 'Информация была успешно очищена.', ephemeral: true });
                } catch {
                    await interaction.reply({ content: 'Возникла ошибка при удалении.', ephemeral: true });
                }
            } else {
                interaction.reply({
                    content: `Эту команду может выполнять только владелец сервера!`,
                    ephemeral: true,
                });
            }
        });
    },
};
