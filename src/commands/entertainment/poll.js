const { SlashCommandBuilder, EmbedBuilder, ReactionEmoji } = require('discord.js');

const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('poll')
        .setDescription('Создать простой опрос с реакциями.')
        .addStringOption(option => option.setName('topic').setDescription('Тема опроса.').setRequired(true))
        .addStringOption(option => option.setName('option1').setDescription('Вариант 1.').setRequired(true))
        .addStringOption(option => option.setName('option2').setDescription('Вариант 2.').setRequired(true))
        .addStringOption(option => option.setName('option3').setDescription('Вариант 3.'))
        .addStringOption(option => option.setName('option4').setDescription('Вариант 4.'))
        .addStringOption(option => option.setName('option5').setDescription('Вариант 5.'))
        .addStringOption(option => option.setName('option6').setDescription('Вариант 6.'))
        .addStringOption(option => option.setName('option7').setDescription('Вариант 7.'))
        .addStringOption(option => option.setName('option8').setDescription('Вариант 8.'))
        .addStringOption(option => option.setName('option9').setDescription('Вариант 9.'))
        .addStringOption(option => option.setName('option10').setDescription('Вариант 10.')),

    async execute(interaction) {
        const title = interaction.options.getString('topic');
        const options = [];

        for (let i = 0; i < 10; i++) {
            let option = interaction.options.getString(`option${i + 1}`);
            if (option) options.push(option);
        }

        const optionsWithNumbers = [];

        for (let i = 0; i < options.length; i++) {
            optionsWithNumbers.push({ name: `${emojis[i]} ${options[i]}`, value: ' ' });
        }

        const pollEmbded = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.username}`,
                iconURL: interaction.user.displayAvatarURL({ dynamic: true }),
            })
            .setColor('#018c08')
            .setTitle(title)
            .addFields(optionsWithNumbers);

        const message = await interaction.reply({ embeds: [pollEmbded], fetchReply: true });
        for (let i = 0; i < options.length; i++) {
            await message.react(emojis[i]);
        }
    },
};
