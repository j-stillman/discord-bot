// registerCommands.js
// Author: Jeremiah Stillman
// Date: 12/08/23

// This file registers the slash commands for the bot. Since I'm following a tutorial ( https://www.youtube.com/watch?v=2CsSJshmadg )
// I'm not sure if I will be using these down the line, but perhaps they will be useful later.

// We need to draw values from .env again (CLIENT_ID and GUILD_ID), so require it
require('dotenv').config();

// We need to include REST as well
const { REST, Routes } = require('discord.js');

// Below we create the actual metadata for the commands, notably their names and descriptions
const commands = [
    {
        name: "info",
        description: "Information about the bot"
    }
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


