const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('task-manager')
        .setDescription('Веб-приложение для управления задачами в проекте, созданное моим разработчиком.'),
    async execute(interaction) {
        let dev;
        await interaction.client.users.fetch('340447087642673153').then(user => (dev = user));

        const previewImage = new AttachmentBuilder('./src/assets/images/task-manager/task-manager-preview.png');
        const infoEmbed = new EmbedBuilder()
            .setColor('#018c08')
            .setTitle(`Task Manager App`)
            .setURL('https://tasks-project-manager.vercel.app/')
            .setDescription(
                'Веб-приложение для управления задачами в проектах, перемещение их между колонками активности.'
            )
            .setImage(`attachment://task-manager-preview.png`)
            .setFooter({
                text: `Developed by ${dev.username}#${dev.discriminator}`,
                iconURL: dev.displayAvatarURL({ dynamic: true }),
            });

        await interaction.reply({ embeds: [infoEmbed], files: [previewImage] });
    },
};
