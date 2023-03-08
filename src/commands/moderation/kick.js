const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

const accessDenied = require('../../utils/accessDenied');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Выгнать участника с сервера.')
        .addUserOption(option => option.setName('user').setDescription('Участник сервера.').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Причина кика участника.'))
        .addStringOption(option =>
            option
                .setName('notify')
                .setDescription('Уведомить участника в личном сообщении.')
                .addChoices({ name: 'Уведомлять', value: 'true' }, { name: 'Не уведомлять', value: 'false' })
        ),
    async execute(interaction) {
        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') ?? '';
        const notify = interaction.options.getString('notify') ?? false;

        try {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
                accessDenied(interaction);
            } else if (user.id === interaction.client.user.id) {
                await interaction.reply({
                    content: `Я не могу кикнуть сам себя.`,
                    ephemeral: true,
                });
            } else if (!interaction.guild.members.cache.get(user.id).manageable) {
                await interaction.reply({
                    content: `Я не могу кикнуть этого участника.`,
                    ephemeral: true,
                });
            } else {
                const memberToKick = interaction.guild.members.cache.get(user.id);
                memberToKick.kick();

                await interaction.reply({
                    content: `${user} был исключен из сервера.\nПричина: ${reason ? reason : '-'}`,
                    ephemeral: true,
                });

                if (notify === 'true') {
                    user.send(`Вы были исключены из ${interaction.guild.name}.\nПричина: ${reason ? reason : '-'}`);
                }
            }
        } catch {
            await interaction.reply({
                content: `Данного пользователя нет на сервере.`,
                ephemeral: true,
            });
        }
    },
};
