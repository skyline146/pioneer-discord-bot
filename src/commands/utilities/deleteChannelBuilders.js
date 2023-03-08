const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { servers } = require('../../db');
const accessDenied = require('../../utils/accessDenied');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete-all-builders')
        .setDescription('Очищает все каналы из списка каналов "строителей".'),
    async execute(interaction) {
        if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            try {
                const currGuild = await servers.get(interaction.guild.id);

                delete currGuild['voiceChannelBuilders'];

                await servers.set(interaction.guild.id, currGuild);

                await interaction.reply({ content: 'Каналы были успешно очищены.', ephemeral: true });
            } catch {
                await interaction.reply({ content: 'Возникла ошибка при удалении.', ephemeral: true });
            }
        } else {
            accessDenied(interaction);
        }
    },
};
