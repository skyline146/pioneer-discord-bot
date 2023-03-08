const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    Events,
    EmbedBuilder,
    Colors,
} = require('discord.js');
const blacklist = require('../../../blacklist.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('report')
        .setDescription('Отправить разработчку отчёт о найденном баге или предложение по улучшению бота.')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Выберите тип отчёта.')
                .addChoices({ name: 'Баг', value: 'bug' }, { name: 'Улучшение', value: 'enhance' })
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('description').setDescription('Описание бага/улучшения.').setRequired(true)
        )
        .addAttachmentOption(option => option.setName('screenshot').setDescription('Прикрепите скриншот по желанию.')),

    async execute(interaction) {
        // interaction.user is the object representing the User who ran the command
        // interaction.member is the GuildMember object, which represents the user in the specific guild
        if (!blacklist.find(id => interaction.user.id === id)) {
            const reportType = interaction.options.getString('type');
            const description = interaction.options.getString('description');
            const screenshot = interaction.options.getAttachment('screenshot')
                ? interaction.options.getAttachment('screenshot').url
                : null;

            const devGuild = interaction.client.guilds.cache.get(process.env.DEV_GUILD);
            const reportChannel = devGuild.channels.cache.get(
                reportType === 'bug' ? '1072124564764626994' : '1072124903307890778'
            );

            const confirmButton = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('confirmReport')
                    .setLabel('Отправить отчёт')
                    .setStyle(ButtonStyle.Primary)
            );

            let reportCmd;

            await interaction.client.application.commands.fetch().then(commands => {
                reportCmd = commands.find(cmd => cmd.name === 'report');
            });

            await interaction.deferReply({ ephemeral: true });
            interaction
                .editReply({
                    content: `**ВНИМАНИЕ!**\nУбедительная просьба использовать команду </${reportCmd.name}:${reportCmd.id}> по её назначению, иначе вы больше не сможете её использовать!\nСпасибо за понимание! :wink:`,
                    ephemeral: true,
                    components: [confirmButton],
                })
                .then(msg => {
                    interaction.client.on(Events.InteractionCreate, async confirmed => {
                        if (confirmed.isButton() && confirmed.customId === 'confirmReport') {
                            const reportEmded = new EmbedBuilder()
                                .setTitle(
                                    reportType === 'bug'
                                        ? ':bangbang: Отчёт об ошибке.'
                                        : ':yellow_circle: Предложение об улучшении.'
                                )
                                .setColor(reportType === 'bug' ? Colors.Red : Colors.Gold)
                                .addFields(
                                    {
                                        name: 'Пользователь:',
                                        value: `${confirmed.user}`,
                                    },
                                    {
                                        name: 'ID:',
                                        value: `${confirmed.user.id}`,
                                    },
                                    { name: 'Сервер:', value: `${confirmed.guild}` },
                                    { name: 'Описание:', value: `${description}` }
                                )
                                .setImage(screenshot)
                                .setTimestamp();

                            await reportChannel.send({ embeds: [reportEmded] });

                            interaction.editReply({
                                content: `Отчёт успешно отправлен! Спасибо за то что помогаете сделать бота ещё лучше!`,
                                ephemeral: true,
                                components: [],
                            });
                        }
                    });
                });
        } else {
            interaction.reply({ content: '⛔ У вас нет прав использовать эту команду.', ephemeral: true });
        }
    },
};
