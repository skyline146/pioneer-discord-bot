const { SlashCommandBuilder, EmbedBuilder, Colors } = require('discord.js');
const convert = require('color-convert');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-embed')
        .setDescription('Создать эмбед со своими данными и отправить от имени бота.')
        .addStringOption(option => option.setName('title').setDescription('Заголовок эмбеда.').setRequired(true))
        .addStringOption(option => option.setName('text').setDescription('Текст внутри эмбеда.'))
        .addStringOption(option =>
            option.setName('color').setDescription('Цвет левой границы эмбеда в формате HEX или название.')
        )
        .addAttachmentOption(option => option.setName('attachment').setDescription('Прикрепить файл/картинку.')),
    async execute(interaction) {
        const user = interaction.user;

        //options
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('text') ?? null;
        const avatarLink = user.displayAvatarURL({ dynamic: true });
        let color = interaction.options.getString('color') ?? '#018c08';
        const attachment = interaction.options.getAttachment('attachment');

        let attachURL = null;
        let attachImage = true;
        if (attachment) {
            attachURL = attachment.url;
            attachImage = attachment.width !== null;
        }

        //testing if color isn't hex to convert
        const hex = /^#([0-9a-f]{3}){1,2}$/i;
        if (!hex.test(color)) {
            try {
                color = convert.keyword.hex(color);
            } catch {}
        }

        try {
            const customEmbed = new EmbedBuilder()
                .setAuthor({ name: `${user.username}#${user.discriminator}`, iconURL: avatarLink })
                .setColor(color)
                .setTitle(title)
                .setDescription(description)
                .setImage(attachURL)
                .setTimestamp();

            if (attachImage) {
                await interaction.reply({ embeds: [customEmbed] });
            } else {
                await interaction.reply({ embeds: [customEmbed], files: [attachURL] });
            }
        } catch (err) {
            await interaction.reply({ content: `Неверный формат цвета.`, ephemeral: true });
        }
    },
};
