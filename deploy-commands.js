const { REST, Routes } = require('discord.js');
const fs = require('fs');
require('dotenv').config();

const commands = [];
// Grab all the command files from the commands directory you created earlier
fs.readdirSync('./src/commands').map(dir => {
    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    fs.readdirSync(`./src/commands/${dir}`)
        .filter(file => file.endsWith('.js'))
        .map(file => {
            const command = require(`./src/commands/${dir}/${file}`);
            commands.push(command.data.toJSON());
        });
});

// Construct and prepare an instance of the REST module
const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

// and deploy your commands!
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        // The put method is used to fully refresh all commands in the guild with the current set
        const data = await rest.put(Routes.applicationCommands(process.env.APP_ID), { body: commands });

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        // And of course, make sure you catch and log any errors!
        console.error(error);
    }
})();
