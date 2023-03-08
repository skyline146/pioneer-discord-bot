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

            if (allowedChannels.lastIndexOf(channel.id) === -1) return;

            const newMessage = await channel.send({ content: '...' });

            try {
                switch (channel.id) {
                    //chatgpt
                    case '1073572140693073970': {
                        await newMessage.edit({ content: 'ChatGPT думает над ответом... ' });

                        // let text = await chat.get(message.author.id);
                        // if (!text) text = '';

                        // text += `Human: ${message.content}\n`;

                        const { davinci } = await gptSettings.get(message.guildId);

                        const chatLog = (await chat.get(message.guildId)) ?? [];

                        chatLog.push({ role: 'user', content: message.content });

                        const response = await openai.createChatCompletion({
                            model: 'gpt-3.5-turbo',
                            messages: chatLog,
                        });

                        // const response = await openai.createCompletion({
                        //     model: 'text-davinci-003',
                        //     prompt: message.content,
                        //     temperature: davinci.temperature,
                        //     max_tokens: davinci.max_tokens,
                        //     frequency_penalty: davinci.frequency_penalty,
                        //     presence_penalty: davinci.presence_penalty,
                        // });

                        // console.log(response.data.choices[0]);

                        const output = response.data.choices[0].message.content;
                        const totalTokens = response.data.usage.total_tokens;

                        await newMessage.edit({ content: `**ChatGPT:** ${output}` });

                        chatLog.push({ role: 'assistant', content: output });

                        if (totalTokens > 600) {
                            await chat.delete(message.guildId);
                            // chatLog.push({
                            //     role: 'user',
                            //     content:
                            //         'Summarize this dialog into 6 replicas, 3 from user and 3 from assistant. Output it in javascript array of objects, like [{role: "user", content: "First replica from user"}, {role: "assistant", content: "First replica from assistant"}]',
                            // });
                            // const summarizedChatLog = await openai.createChatCompletion({
                            //     model: 'gpt-3.5-turbo',
                            //     messages: chatLog,
                            // });
                            // console.log(JSON.stringify(summarizedChatLog.data.choices[0].message.content));
                        } else {
                            await chat.set(message.guildId, chatLog);
                        }

                        // console.log(chatLog.length);

                        // await newMessage.edit({
                        //     content: `**ChatGPT:** ${output
                        //         .replace('Robot: ', '')
                        //         .replace('Computer: ', '')
                        //         .replace('Bot: ', '')}`,
                        // });

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
                console.log(err.response);

                await newMessage.delete();

                await message.reply({
                    content: `Возникла ошибка при обработке запроса, либо вы ввели данные, которые являются оскорбительного/сексуального/политического характера.`,
                    ephemeral: true,
                });

                await message.delete();
            }
        }
    },
};
