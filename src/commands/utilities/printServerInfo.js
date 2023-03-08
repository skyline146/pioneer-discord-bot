const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');

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
                await interaction.editReply({ content: 'Файл генерируется, пожалуйста подождите...' });

                const data = await servers.get(interaction.guild.id);

                if (Object.keys(data).length === 0) throw new Error();

                fs.writeFileSync(`./src/db/${interaction.guild.id}.json`, JSON.stringify(data, null, ' '));

                const file = new AttachmentBuilder(`./src/db/${interaction.guild.id}.json`);

                const embed = new EmbedBuilder().setTitle('Данные сервера в формате JSON').setColor('#018c08');

                await interaction.editReply({
                    content: '',
                    embeds: [embed],
                    files: [file],
                });

                fs.unlinkSync(`./src/db/${interaction.guild.id}.json`);
            } catch {
                await interaction.editReply({
                    content: 'Возникла ошибка при получении данных либо данных вашего сервера нет.',
                    ephemeral: true,
                });
            }
        } else {
            accessDenied(interaction);
        }
    },
};
