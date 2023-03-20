const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

const accessDenied = require('../../utils/accessDenied');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Для удаления сообщений.')
        .addIntegerOption(option =>
            option.setName('amount').setDescription('Количество сообщений(2-100) для удаления. По умолчанию - 100.')
        ),
    async execute(interaction) {
        const limit = interaction.options.getInteger('amount') ?? 100;
        const channel = interaction.channel;

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            accessDenied(interaction);
            return;
        }

        channel.messages.fetch().then(messages => {
            if (messages.size === 0) {
                interaction.reply({
                    content: 'В этом канале нет сообщений. Что ты пытаешься удалить?:face_with_raised_eyebrow:',
                    ephemeral: true,
                });
            } else {
                if (limit < 2 || limit > 100) {
                    if (limit === 0) {
                        interaction.reply({
                            content: 'Ты серьёзно пытаешься удалить **0** сообщений?:joy:',
                            ephemeral: true,
                        });
                    } else {
                        interaction.reply({
                            content: 'Количество сообщений для удаления **от 2 до 100**.',
                            ephemeral: true,
                        });
                    }
                } else {
                    interaction.channel.bulkDelete(limit).then(() => {
                        const deleteEmbed = new EmbedBuilder()
                            .setColor('#018c08')
                            .setTitle(
                                `🗑 Удалено последние **${
                                    limit > messages.size ? messages.size : limit
                                }** сообщений в этом канале.`
                            )
                            .setTimestamp();
                        interaction.reply({ embeds: [deleteEmbed], ephemeral: true });
                    });
                }
            }
        });
    },
};
