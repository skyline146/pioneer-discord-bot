const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Collection,
} = require('discord.js');

const openai = require('../../openai');
const checkCooldown = require('../../utils/checkCooldown');

const cooldown = new Collection();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('image-generation')
        .setDescription('Генерирует картинку по запросу, с помощью OpenAI.')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('Введите описание картинки(на английском работает лучше).')
                .setRequired(true)
        ),
    async execute(interaction) {
        const query = interaction.options.getString('query');

        if ((await checkCooldown(cooldown, interaction, '30')).valueOf()) return;

        cooldown.set(interaction.user.id, Date.now() + 30000); // set user cooldown
        setTimeout(() => cooldown.delete(interaction.user.id), 30000);

        await interaction.deferReply();
        await interaction.editReply({ content: 'Картинка генерируется, пожалуйста подождите...' });

        try {
            const response = await openai.createImage({
                prompt: query,
                n: 1,
                size: '1024x1024',
            });

            const image_url = response.data.data[0].url;

            const embed = new EmbedBuilder()
                .setColor('#018c08')
                .setTitle(`Сгенерированная картинка по запросу ${query}:`)
                .setImage(image_url)
                .setFooter({ text: 'OpenAI' });

            const linkButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(image_url).setLabel('Ссылка')
            );

            await interaction.editReply({ content: '', embeds: [embed], components: [linkButton] });
        } catch (err) {
            await interaction.editReply({
                content: `Не удалось обработать запрос, либо вы ввели данные, которые являются оскорбительного/сексуального/политического характера.`,
                ephemeral: true,
            });
        }
    },
};
