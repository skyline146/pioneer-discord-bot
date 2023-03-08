const { SlashCommandBuilder } = require('discord.js');
const { chat } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder().setName('clear-chat').setDescription('Очищает чат-лог и базы данных.'),
    async execute(interaction) {
        interaction.guild.fetchOwner().then(async owner => {
            if (owner.user.id === interaction.user.id) {
                try {
                    await chat.delete(interaction.guild.id);

                    await interaction.reply({ content: 'Чат-лог был успешно очищен.', ephemeral: true });
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
