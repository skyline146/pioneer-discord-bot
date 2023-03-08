const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');

const { servers } = require('../../db');
const accessDenied = require('../../utils/accessDenied');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('voice-channel-builder')
        .setDescription('Создать канал для динамической генерации временных голосовых каналов.')
        .addChannelOption(option =>
            option
                .setName('channel-builder')
                .setDescription('Канал, при заходе в который будет создаваться временный голосовой канал.')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildVoice)
        )
        .addChannelOption(option =>
            option
                .setName('category')
                .setDescription('Категория где будет создаваться временный голосовой канал.')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildCategory)
        )
        .addStringOption(option =>
            option
                .setName('name')
                .setDescription('Имя создаваемого канала. {user} - имя пользователя.')
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName('users').setDescription('Максимальное кол-во пользователей в канале. По умолчанию 99.')
        ),
    async execute(interaction) {
        // render bots message for verifing users only for server owner
        if (interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const channelBuilder = interaction.options.getChannel('channel-builder');
            const category = interaction.options.getChannel('category');
            const channelName = interaction.options.getString('name');
            const users = interaction.options.getInteger('users') ?? 99;

            const currGuild = (await servers.get(interaction.guild.id)) ?? {};

            const channelBuilders = currGuild.voiceChannelBuilders ?? [];

            if (!channelBuilders.filter(channel => channel.id === channelBuilder.id)[0]) {
                const newChannel = {
                    id: channelBuilder.id,
                    categoryWhereCreate: category.id,
                    createdChannelName: channelName,
                    userLimit: users,
                };

                servers.set(interaction.guild.id, {
                    ...currGuild,
                    voiceChannelBuilders: [...channelBuilders, newChannel],
                });

                interaction.reply({
                    content: `Успешно создан канал ${channelBuilder}, который создаёт временные каналы в категории ${category}.`,
                    ephemeral: true,
                });
            } else {
                interaction.reply({
                    content: `Этот канал уже зарезервирован!`,
                    ephemeral: true,
                });
            }
        } else {
            accessDenied(interaction);
        }
    },
};
