const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// keyv.on('error', err => console.log('Connection Error', err));

const discordBot = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

discordBot.commands = new Collection();

// const commandsPath = path.join(__dirname, 'src/commands');

// const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

fs.readdirSync('./src/commands').map(dir => {
    fs.readdirSync(`./src/commands/${dir}`)
        .filter(file => file.endsWith('.js'))
        .map(file => {
            const command = require(`./src/commands/${dir}/${file}`);
            if ('data' in command && 'execute' in command) {
                // Set a new item in the Collection with the key as the command name and the value as the exported module
                discordBot.commands.set(command.data.name, command);
            } else {
                console.log(
                    `[WARNING] The command at ./src/commands/${dir}/${file} is missing a required "data" or "execute" property.`
                );
            }
        });
});

const eventsPath = path.join(__dirname, 'src/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        discordBot.once(event.name, (...args) => event.execute(...args));
    } else {
        discordBot.on(event.name, (...args) => event.execute(...args));
    }
}

discordBot.login(process.env.TOKEN);

// discordBot.on('debug', console.log).on('warn', console.log);
