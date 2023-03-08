const { SlashCommandBuilder } = require('discord.js');

const accessDenied = require('../../utils/accessDenied');
const { gptSettings } = require('../../db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('set-gpt-settings')
        .setDescription('Удаляет всю информацию о сервере из базы данных.')
        .addStringOption(option =>
            option
                .setName('model')
                .setDescription('Model type.')
                .addChoices({ name: 'Davinci', value: 'davinci' }, { name: 'Curie', value: 'curie' })
                .setRequired(true)
        )
        .addNumberOption(option => option.setName('temperature').setDescription('Temperature.'))
        .addNumberOption(option => option.setName('max-tokens').setDescription('Max tokens for response.'))
        .addNumberOption(option => option.setName('frequency-penalty').setDescription('Exclude repeated sentences.'))
        .addNumberOption(option => option.setName('presence-penalty').setDescription('Include new topics.')),
    async execute(interaction) {
        if (interaction.user.id === '340447087642673153') {
            try {
                const model = interaction.options.getString('model');
                const temperature = interaction.options.getNumber('temperature') ?? 1;
                const max_tokens = interaction.options.getNumber('max-tokens') ?? 16;
                const frequency_penalty = interaction.options.getNumber('frequency-penalty') ?? 0;
                const presence_penalty = interaction.options.getNumber('presence-penalty') ?? 0;

                let settings = await gptSettings.get(interaction.guild.id);

                if (!settings) {
                    settings = {
                        davinci: {},
                        curie: {},
                    };
                }

                switch (model) {
                    case 'davinci': {
                        settings.davinci = {
                            temperature,
                            max_tokens,
                            frequency_penalty,
                            presence_penalty,
                        };

                        break;
                    }

                    case 'curie': {
                        settings.curie = {
                            temperature,
                            max_tokens,
                            frequency_penalty,
                            presence_penalty,
                        };

                        break;
                    }
                }

                await gptSettings.set(interaction.guild.id, settings);

                await interaction.reply({
                    content: `Настройки были успешно изменены.\n${JSON.stringify(settings)}`,
                    ephemeral: true,
                });
            } catch (err) {
                console.log(err);
                await interaction.reply({ content: 'Возникла ошибка при изменении настроек.', ephemeral: true });
            }
        } else {
            accessDenied(interaction);
        }
    },
};
