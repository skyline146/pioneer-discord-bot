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
        .setName('ask-chat-gpt')
        .setDescription('Задать вопрос ChatGPT, нейросеть от OpenAI.')
        .addStringOption(option =>
            option
                .setName('query')
                .setDescription('Введите запрос(на английском работает лучше и быстрее).')
                .setRequired(true)
        ),
    async execute(interaction) {
        const query = interaction.options.getString('query');

        if ((await checkCooldown(cooldown, interaction, '30')).valueOf()) return;

        cooldown.set(interaction.user.id, Date.now() + 30000); // set user cooldown
        setTimeout(() => cooldown.delete(interaction.user.id), 30000);

        // await interaction.reply({ content: 'ChatGPT думает над ответом, пожалуйста подождите...' });

        try {
            const response = await openai.createCompletion({
                model: 'text-curie-001',
                prompt: query,
                temperature: 0.3,
                max_tokens: 1500,
                top_p: 0.8,
            });

            // console.log(response);

            const text = response.data.choices[0].text;

            await interaction.reply({ content: `**ChatGPT:** ${text.replace(`\n`, '')}` });
        } catch (err) {
            await interaction.editReply({
                content: `Не удалось обработать запрос, либо вы ввели данные, которые являются оскорбительного/сексуального/политического характера.`,
                ephemeral: true,
            });
        }
    },
};
