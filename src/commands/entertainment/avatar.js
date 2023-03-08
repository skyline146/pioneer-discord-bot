const { SlashCommandBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('avatar')
        .setDescription('Получить аватар пользователя.')
        .addUserOption(option =>
            option
                .setName('usertag')
                .setDescription('Если хотите получить не свой аватар, введите тег нужного пользователя.')
        ),
    async execute(interaction) {
        // interaction.user is the object representing the User who ran the command
        // interaction.member is the GuildMember object, which represents the user in the specific guild
        const user = interaction.options.getUser('usertag') ?? interaction.user;
        const avatarLink = user.displayAvatarURL({ dynamic: true, size: 2048 });

        const embed = new EmbedBuilder()
            .setTitle(`**:white_check_mark: Аватар ${user.username}#${user.discriminator}**`)
            .setColor('#018c08')
            .setImage(avatarLink);

        const linkBtn = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setLabel('Cсылка').setURL(avatarLink).setStyle(ButtonStyle.Link)
        );

        await interaction.reply({ embeds: [embed], components: [linkBtn] });
    },
};
