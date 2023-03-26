const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
require('dotenv').config();

const openai = require('../openai');

const { gptSettings, chat } = require('../db');

const allowedChannels = ['1073572140693073970', '1073572243013124196', '1073609425996226581'];

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        if (message.author.bot) return;

        if (message.guildId === process.env.DEV_GUILD) {
            const channel = message.channel;

            if (!allowedChannels.includes(channel.id)) return;

            const newMessage = await channel.send({ content: '...' });

            try {
                switch (channel.id) {
                    //chatgpt
                    case '1073572140693073970': {
                        await newMessage.edit({ content: 'ChatGPT думает над ответом...' });

                        const chatLog = (await chat.get(message.guildId)) ?? [];

                        chatLog.push({ role: 'user', content: message.content });

                        const response = await openai.createChatCompletion({
                            model: 'gpt-3.5-turbo',
                            messages: chatLog,
                        });

                        //stream output, but sadly doesn't work correctly in discord :(

                        // let outputStream = '';

                        // response.data.on('data', async data => {
                        //     const lines = data
                        //         .toString()
                        //         .split('\n')
                        //         .filter(line => line.trim() !== '');

                        //     for (const line of lines) {
                        //         const message = line.replace(/^data: /, '');
                        //         if (message === '[DONE]') {
                        //             return; // Stream finished
                        //         }
                        //         try {
                        //             const parsed = JSON.parse(message);

                        //             if (parsed.choices[0].delta.content) {
                        //                 outputStream += parsed.choices[0].delta.content;
                        //                 console.log(outputStream);
                        //                 newMessage.edit({
                        //                     content: outputStream,
                        //                 });
                        //             }
                        //         } catch (error) {
                        //             console.error('Could not JSON parse stream message', message, error);
                        //         }
                        //     }
                        // });

                        const output = response.data.choices[0].message.content;
                        const totalTokens = response.data.usage.total_tokens;

                        await newMessage.edit(output);

                        chatLog.push({ role: 'assistant', content: output });

                        if (totalTokens > 600) {
                            await chat.delete(message.guildId);
                        } else {
                            await chat.set(message.guildId, chatLog);
                        }

                        console.log('Total tokens: ' + totalTokens);

                        break;
                    }
                    //всратый chatgpt
                    case '1073572243013124196': {
                        await newMessage.edit({ content: 'ChatGPT думает над ответом... ' });

                        const { curie } = await gptSettings.get(message.guildId);
                        const { temperature, max_tokens, frequency_penalty, presence_penalty } = curie;

                        const response = await openai.createCompletion({
                            model: 'text-curie-001',
                            prompt: message.content,
                            temperature,
                            max_tokens,
                            frequency_penalty,
                            presence_penalty,
                        });

                        // console.log(response.data);

                        const text = response.data.choices[0].text.trimStart();

                        // console.log(response.data.choices);

                        await newMessage.edit({ content: `**ChatGPT:** ${text}` });
                        break;
                    }
                    //image-generation
                    case '1073609425996226581': {
                        await newMessage.edit({ content: 'Картинка генерируется... ' });

                        const response = await openai.createImage({
                            prompt: message.content,
                            n: 1,
                            size: '1024x1024',
                        });

                        const image_url = response.data.data[0].url;

                        const embed = new EmbedBuilder()
                            .setColor('#018c08')
                            .setTitle(`Сгенерированная картинка по запросу ${message.content}:`)
                            .setImage(image_url)
                            .setFooter({ text: 'OpenAI' });

                        const linkButton = new ActionRowBuilder().addComponents(
                            new ButtonBuilder().setStyle(ButtonStyle.Link).setURL(image_url).setLabel('Ссылка')
                        );

                        await newMessage.edit({ content: '', embeds: [embed], components: [linkButton] });
                        break;
                    }
                }
            } catch (err) {
                await newMessage.delete();

                console.log(err);
                if (err.response?.data?.error) {
                    await message.reply(err.response.data.error.message);
                } else {
                    await message.reply(`Возникла ошибка при обработке запроса.`);
                }
            }
        }
    },
};
