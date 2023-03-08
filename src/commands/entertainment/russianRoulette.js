const { SlashCommandBuilder, Collection } = require('discord.js');

const checkCooldown = require('../../utils/checkCooldown');
const sleep = require('../../utils/sleep');
const cooldown = new Collection();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('russian-roulette')
        .setDescription('Сыграть в русскую рулетку.')
        .addIntegerOption(option =>
            option.setName('bullet').setDescription('Введите номер счастливой пули.').setRequired(true)
        ),
    async execute(interaction) {
        const userBullet = interaction.options.getInteger('bullet');
        const deathBullet = Math.floor(Math.random() * (6 - 1 + 1) + 1);

        if ((await checkCooldown(cooldown, interaction, '15')).valueOf()) return;

        if (userBullet < 1 || userBullet > 6) {
            await interaction.reply({
                content: 'Значение можно ввести от 1 до 6. Думаешь самый умный здесь? :nerd:',
                ephemeral: true,
            });
        } else {
            cooldown.set(interaction.user.id, Date.now() + 15000); // set user cooldown
            setTimeout(() => cooldown.delete(interaction.user.id), 15000);

            await interaction.deferReply();
            await interaction.editReply({
                content: 'Выбор сделан! Ну что же, посмотрим на твою удачу...',
            });

            let rouletteLog;
            await interaction.channel.messages.fetch({ limit: 100 }).then(messages => {
                rouletteLog = messages.filter(message => message.author.bot).first();
            });

            for (let i = 1; i <= 6; i++) {
                if (i === deathBullet) {
                    await sleep(1200);
                    await interaction.editReply({
                        content: rouletteLog.content + `\n**Выстрел #${i} - пуля вылетела!**`,
                    });
                    if (userBullet === deathBullet) {
                        interaction.followUp({
                            content: `**Увы и ах, но похоже что ${interaction.user.username} только что умер(-ла)...**`,
                        });
                    } else {
                        interaction.followUp({
                            content: `**${interaction.user.username}, на этот раз тебе повезло, но это не на долго!**`,
                        });
                    }
                    break;
                }
                await sleep(1200);
                await interaction.editReply({
                    content: rouletteLog.content + `\nВыстрел #**${i}** - осечка!`,
                });
            }
        }
    },
};
