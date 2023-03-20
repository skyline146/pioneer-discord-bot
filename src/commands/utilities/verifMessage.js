const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    PermissionsBitField,
} = require('discord.js');

const { servers } = require('../../db');
const accessDenied = require('../../utils/accessDenied');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verification-message')
        .setDescription('Выводит сообщение от бота в этом канале для верификации.')
        .addRoleOption(option =>
            option
                .setName('role')
                .setDescription('Роль которая будет выдана после успешной верификации.')
                .setRequired(true)
        ),
    async execute(interaction) {
        // render bots message for verifing users
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            accessDenied(interaction);
            return;
        }

        const verifRole = interaction.options.getRole('role');

        const customEmbed = new EmbedBuilder().setTitle('Для верификации нажмите на кнопку.').setColor('#018c08');

        const verifButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Верификация').setCustomId('verification').setStyle(ButtonStyle.Primary)
        );

        const currGuild = (await servers.get(interaction.guild.id)) ?? {};

        await servers.set(interaction.guild.id, {
            ...currGuild,
            verifiedRoleID: verifRole.id,
        });

        await interaction.channel.send({ embeds: [customEmbed], components: [verifButton] });

        interaction.reply({
            content: `Успешно создано верификационное сообщение в канале ${interaction.channel}.`,
            ephemeral: true,
        });
    },
};
