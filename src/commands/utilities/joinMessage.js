const { SlashCommandBuilder, ChannelType, PermissionsBitField } = require('discord.js');

const { servers } = require('../../db');
const accessDenied = require('../../utils/accessDenied');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('join-message')
        .setDescription('Создать приветствие от бота, когда пользователь заходит на сервер.')
        .addStringOption(option =>
            option
                .setName('text')
                .setDescription(
                    'Текст привествия. Упоминание пользователя, название сервера: {user}, {server}. Канал через #.'
                )
                .setRequired(true)
        )
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Канал в котором будет выводиться приветствие.')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        ),
    async execute(interaction) {
        const text = interaction.options.getString('text');
        const channel = interaction.options.getChannel('channel');

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            accessDenied(interaction);
            return;
        }

        try {
            const guild = await servers.get(interaction.guild.id);

            servers.set(interaction.guild.id, {
                ...guild,
                greetings: {
                    text,
                    channel: channel.id,
                },
            });

            await interaction.reply({
                content: 'Приветствие на сервере успешно создано.',
                ephemeral: true,
            });
        } catch {
            await interaction.reply({
                content: 'Возникла ошибка при отправке данных.',
                ephemeral: true,
            });
        }
    },
};
