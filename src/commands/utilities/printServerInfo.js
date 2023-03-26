const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

const { servers } = require('../../db');
const accessDenied = require('../../utils/accessDenied');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('print-server-info')
        .setDescription('Выводит всю информацию о сервере, которая хранится в базе данных.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            accessDenied(interaction);
            return;
        }

        try {
            await interaction.deferReply({ ephemeral: true });

            const data = await servers.get(interaction.guild.id);
            if (!data || Object.keys(data).length === 0) {
                await interaction.editReply('Данных вашего сервера нет в базе.');
                return;
            }

            await interaction.editReply({ content: 'Файл генерируется, пожалуйста подождите...' });

            await interaction.editReply(
                '**Данные сервера в формате JSON:**' + '```json\n' + JSON.stringify(data, null, 2) + '\n```'
            );
        } catch (err) {
            console.log(err);
            await interaction.editReply('Возникла ошибка при получении данных.');
        }
    },
};
