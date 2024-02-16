// registerCommands.js
// Author: Jeremiah Stillman
// Date: 12/08/23

// This file registers the slash commands for the bot. Since I'm following a tutorial ( https://www.youtube.com/watch?v=2CsSJshmadg )
// I'm not sure if I will be using these down the line, but perhaps they will be useful later.

// 12/10/23: They might be useful for customizing the bot itself. Personally I'd like users to call commands with "!" rather than "/"
// See https://www.youtube.com/watch?v=_lP90FOYfbA for info.
// In this scenario, slash commands must first check if the caller is an admin before allowing customization.

// We need to draw values from .env again (CLIENT_ID and GUILD_ID), so require it
require('dotenv').config();

// Include REST, Routes, and option types for app commands
const { REST, 
        Routes, 
        ApplicationCommandOptionType } = require('discord.js');

// Below we create the actual metadata for the commands, notably their names and descriptions
const commands = [
    {
        name: "info",
        description: "Information about the bot"
    },
    {
        name: "add",
        description: "Adds two numbers",

        // These are the options (or arguments/parameters for the slash command)
        // Setting require to true is important, otherwise the user wouldn't need to supply every argument when they really should.
        options: [
            {
                name: "first-number",
                description: "The first number",
                type: ApplicationCommandOptionType.Number,
                required: true
            },
            {
                name: "second-number",
                description: "The second number",
                type: ApplicationCommandOptionType.Number,
                required: true
            }
        ]
    },
    {
        name: "sethomechannel",
        description: "(Admin use only) Sets the bot's home channel to the channel in which this command is called."
    },
    {
        name: "setwordcounter",
        description: "(Admin use only) Sets a counter that ticks every time a specified word is used",

        options: [
            {
                name: "word",
                description: "The word that will be counted",
                type: ApplicationCommandOptionType.String,
                required: true
            }
        ]
    },
];

// Initialize REST to the bot token in env
const rest = new REST ({version: "10"}).setToken(process.env.TOKEN); 

// Actually register the commands to the bot via anonymous function
(async () => {
    try{

        console.log("Registering slash commands...");

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        )

        console.log("Slash commands registered successfully!");

    }catch (error) {
        console.log(`Register commands: error caught: ${error}`);
    }
})();


