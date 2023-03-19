const {
    SlashCommandBuilder,
    ButtonBuilder,
    ButtonStyle,
    ActionRowBuilder,
    EmbedBuilder,
    Colors,
} = require('discord.js');
const accessDenied = require('../../utils/accessDenied');
const blacklist = require('../../../blacklist.json');

const reportChannels = {
    bug: '1072124564764626994',
    enhance: '1072124903307890778',
};

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
        //find if user in blacklist
        if (blacklist.find(id => interaction.user.id === id)) {
            accessDenied(interaction);
            return;
        }

        const reportType = interaction.options.getString('type');
        const description = interaction.options.getString('description');
        const screenshot = interaction.options.getAttachment('screenshot')
            ? interaction.options.getAttachment('screenshot').url
            : null;

        const confirmButton = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId('confirmReport').setLabel('Отправить отчёт').setStyle(ButtonStyle.Primary)
        );

        let reportCmd;

        await interaction.client.application.commands.fetch().then(commands => {
            reportCmd = commands.find(cmd => cmd.name === 'report');
        });

        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply({
            content: `**ВНИМАНИЕ!**\nУбедительная просьба использовать команду </${reportCmd.name}:${reportCmd.id}> по её назначению, иначе вы больше не сможете её использовать!\nСпасибо за понимание! :wink:`,
            components: [confirmButton],
        });

        const filter = button => button.customId === 'confirmReport' && button.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1 });

        collector.on('collect', async confirmed => {
            const devGuild = await confirmed.client.guilds.cache.get(process.env.DEV_GUILD);
            const reportChannel = await devGuild.channels.cache.get(reportChannels[reportType]);

            const reportEmded = new EmbedBuilder()
                .setTitle(
                    reportType === 'bug' ? ':bangbang: Отчёт об ошибке.' : ':yellow_circle: Предложение об улучшении.'
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
            await interaction.editReply({
                content: `Отчёт успешно отправлен! Спасибо за то что помогаете сделать бота ещё лучше!`,
                components: [],
            });
        });
    },
};
