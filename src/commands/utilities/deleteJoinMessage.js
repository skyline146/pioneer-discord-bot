const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');

const { servers } = require('../../db');
const accessDenied = require('../../utils/accessDenied');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join-message-delete')
        .setDescription('Удалить приветствие от бота, когда пользователь заходит на сервер.'),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            accessDenied(interaction);
            return;
        }

        try {
            const guild = await servers.get(interaction.guild.id);

            delete guild['greetings'];

            servers.set(interaction.guild.id, guild);

            await interaction.reply({
                content: 'Приветствие от бота успешно удалено.',
                ephemeral: true,
            });
        } catch {
            await interaction.reply({
                content: 'Возникла ошибка при удалении.',
                ephemeral: true,
            });
        }
    },
};
