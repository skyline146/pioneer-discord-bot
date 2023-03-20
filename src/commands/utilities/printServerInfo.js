const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

const { servers } = require('../../db');
const accessDenied = require('../../utils/accessDenied');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('print-server-info')
        .setDescription('Выводит всю информацию о сервере, которая хранится в базе данных.'),
    async execute(interaction) {
        if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            try {
                await interaction.deferReply({ ephemeral: true });

                const data = await servers.get(interaction.guild.id);
                if (Object.keys(data).length === 0) throw new Error();

                await interaction.editReply({ content: 'Файл генерируется, пожалуйста подождите...' });

                await interaction.editReply(
                    '**Данные сервера в формате JSON:**' + '```json\n' + JSON.stringify(data, null, ' ') + '\n```'
                );
            } catch (err) {
                console.log(err);
                await interaction.editReply('Возникла ошибка при получении данных либо данных вашего сервера нет.');
            }
        } else {
            accessDenied(interaction);
        }
    },
};
