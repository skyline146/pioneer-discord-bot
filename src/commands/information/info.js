const { SlashCommandBuilder, EmbedBuilder, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Выводит основную информацию про пользователя.')
        .addUserOption(option => option.setName('user').setDescription('Тэг пользователя.')),
    async execute(interaction) {
        const user = interaction.options.getUser('user') ?? interaction.user;

        // console.log(interaction.guild.members);
        // interaction.guild.channels.cache.filter(channel => channel.type === ChannelType.GuildText).map(channel => {
        //     channel.messages.fetch().then(messages => messages.map(msg => {
        //         if (msg.content !== '' && msg.author.id === user.id) {
        //             console.log(msg.content);
        //         }
        //     }))
        // })

        // channel.messages.fetch()
        //     .then(messages => messages.map(msg => {
        //         if (msg.author.id === user.id) {
        //             console.log(msg.content);
        //         }
        //     }));
        const infoEmbed = new EmbedBuilder()
            .setColor('#018c08')
            .setTitle(`🔎 Информация о пользователе ${user.username}#${user.discriminator}`)
            .setThumbnail(`${user.displayAvatarURL({ dynamic: true })}`)
            .addFields(
                { name: 'ID:', value: `${user.id}` },
                {
                    name: 'Дата присоединения на сервер:',
                    value: `<t:${Math.floor(interaction.member.joinedTimestamp / 1000)}:D>`,
                },
                {
                    name: 'Дата регистрации в Discord:',
                    value: `<t:${Math.floor(user.createdAt.getTime() / 1000)}:D>`,
                },
                {
                    name: 'Роли на сервере:',
                    value:
                        interaction.member.roles.cache.size > 1
                            ? interaction.member.roles.cache
                                  .filter(role => role.name !== '@everyone')
                                  .map(role => `${role}`)
                                  .join(' ')
                            : 'Нет ролей',
                }
            )
            .setTimestamp();

        await interaction.reply({ embeds: [infoEmbed] });
    },
};
