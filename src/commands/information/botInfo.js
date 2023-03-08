const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder().setName('bot-info').setDescription('Выводит основную информацию про бота.'),
    async execute(interaction) {
        let dev;
        await interaction.client.users.fetch('340447087642673153').then(user => (dev = user));
        const botGuild = interaction.guild.members.cache.get('749596995836182587');

        const infoEmbed = new EmbedBuilder()
            .setColor('#018c08')
            .setTitle(`🔎 Информация о боте Pioneer`)
            .setThumbnail(`${interaction.client.user.displayAvatarURL({ dynamic: true })}`)
            .addFields(
                {
                    name: '📲 Дата присоединения на сервер:',
                    value: `<t:${Math.floor(botGuild.joinedTimestamp / 1000)}:D>`,
                },
                {
                    name: '📅 Дата начала разработки:',
                    value: `<t:1675010340:D>`,
                },
                {
                    name: '🔬 Технологии:',
                    value: `JavaScript, Node.js, discord.js`,
                },
                {
                    name: '🛠 Разработчик:',
                    value: `${dev}`,
                },
                {
                    name: '\u200b',
                    value: ' ',
                },
                {
                    name: `🌐 Количество серверов: ${interaction.client.guilds.cache.size}`,
                    value: ` `,
                },
                {
                    name: ' ',
                    value: `**Бот запущен:** <t:${Math.round(
                        interaction.client.readyTimestamp / 1000
                    )}:R>\n**Пинг: ${Math.round(interaction.client.ws.ping)}ms**`,
                }
            )
            .setFooter({
                text: `Pioneer - 2023`,
                iconURL: interaction.client.user.displayAvatarURL({ dynamic: true }),
            });

        const addButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setLabel('Добавить бота')
                .setURL(
                    'https://discord.com/api/oauth2/authorize?client_id=749596995836182587&permissions=8&scope=bot%20applications.commands'
                )
                .setStyle(ButtonStyle.Link)
        );

        await interaction.reply({ embeds: [infoEmbed], components: [addButton] });
    },
};
