const { Events, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js');
// const servers = require('../../serversData.json');
const { servers } = require('../db');

const correctAnswers = new Collection();

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;
        //getting current guild from db
        const currGuild = await servers.get(interaction.guild.id);
        try {
            if (interaction.customId === 'verification') {
                //check if user has verified role
                if (!interaction.member.roles.cache.has(currGuild.verifiedRoleID)) {
                    const a = Math.floor(Math.random() * (20 - 5 + 1) + 5);
                    const b = Math.floor(Math.random() * (20 - 5 + 1) + 5);

                    //clear users previous answer if clicks verif button again
                    correctAnswers.delete(interaction.user.id);

                    correctAnswers.set(interaction.user.id, a + b);

                    const rndButtons = [];

                    const rndIndex = Math.floor(Math.random() * (2 - 0 + 1) + 0); //random index for correct button

                    //build 3 buttons in random positions but with 1 correct answer
                    for (let i = 0; i < 3; i++) {
                        if (i === rndIndex) {
                            //create right button
                            rndButtons.push(
                                new ButtonBuilder()
                                    .setLabel(`${a + b}`)
                                    .setCustomId(`verifBtn${a + b}`)
                                    .setStyle(ButtonStyle.Primary)
                            );
                        } else {
                            //create false button
                            const rndAnswer = Math.floor(Math.random() * (35 - 10 + 1) + 10);

                            rndButtons.push(
                                new ButtonBuilder()
                                    .setLabel(`${rndAnswer === a + b ? rndAnswer - 5 : rndAnswer}`)
                                    .setCustomId(`verifBtn${rndAnswer === a + b ? rndAnswer - 5 : rndAnswer}`)
                                    .setStyle(ButtonStyle.Primary)
                            );
                        }
                    }

                    const buttonsRow = new ActionRowBuilder().addComponents(...rndButtons);

                    interaction.reply({
                        content: `Сколько будет **${a} + ${b}**? У вас есть 1 попытка.`,
                        ephemeral: true,
                        components: [buttonsRow],
                    });
                } else {
                    interaction.reply({
                        content: `Вы уже верифицированы на этом сервере.`,
                        ephemeral: true,
                    });
                }
            } else if (interaction.customId.startsWith('verifBtn')) {
                const receivedAnswer = parseInt(interaction.customId.substring(8));
                const userCorrectAnswer = correctAnswers.get(interaction.user.id);
                //check if correct answer exists
                if (userCorrectAnswer) {
                    if (receivedAnswer === userCorrectAnswer) {
                        interaction.member.roles.add(interaction.guild.roles.cache.get(currGuild.verifiedRoleID));

                        interaction.reply({
                            content: `Правильно! :partying_face:`,
                            ephemeral: true,
                        });
                        interaction.user.send(
                            `${interaction.user}, да ты гений математики! Добро пожаловать на **${interaction.guild.name}**!`
                        );

                        correctAnswers.delete(interaction.user.id);
                    } else {
                        interaction.reply({
                            content: `Ну мог хотя-бы калькулятор использовать что-ли... Попробуй ещё раз.`,
                            ephemeral: true,
                        });

                        correctAnswers.delete(interaction.user.id);
                    }
                } else {
                    interaction.reply({
                        content: `Жульничать не хорошо:nerd: Начните верификацию заново, так как только 1 попытка.`,
                        ephemeral: true,
                    });
                }
            }
        } catch {
            interaction.reply({
                content: `Возникла ошибка при получении данных, пересоздайте верификационное сообщение, либо обратитесь к администрации.`,
                ephemeral: true,
            });
        }
    },
};
