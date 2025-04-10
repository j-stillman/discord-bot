// index.js
// Author: Jeremiah Stillman
// Date: 04/07/25

// This file is the main entrypoint for the discord bot. It loads event and command files, then logs in.

// We must require 'dotenv' to be able to access the token. The token must stay private in .env
require('dotenv').config();

// Notes: Intents are "permissions" for a bot. They take the form of constants e.g. "GUILD_CREATE", "GUILD_UPDATE".
// If you look at the line "IntentsBitField.Flags.Guilds", that means all the consts beginning with "GUILD" are allowed. 
// See the Discord documentation on Intents here: https://discord.com/developers/docs/topics/gateway#list-of-intents
const { Client, 
        Collection,
        IntentsBitField,
        Partials } = require('discord.js');

// Require fs to be able to access other js files
const fs = require('fs').promises;

// Create the bot
const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
        IntentsBitField.Flags.GuildMessageReactions,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction]
});

// Collection of commands for client
client.commands = new Collection();

// Function to load each command from the files in the commands subfolder
async function loadCommands()
{

    const commandFiles = (await fs.readdir('./src/commands')).filter(file => file.endsWith('.js'));

    // For each command file, add it to the collection with its name as the key
    for(const file of commandFiles) {
        const command = require(`./commands/${file}`);
        client.commands.set(command.data.name, command);
    }

} // end loadCommands()


// Function to load each event from the files in the events subfolder
async function loadEvents()
{

    const eventFiles = (await fs.readdir('./src/events')).filter(file => file.endsWith('.js'));

    // For each event file, add it to the collection with its name as the key
    for (const file of eventFiles) {
        const event = require(`./events/${file}`);
        client.on(event.name, (...args) => event.execute(...args, client));
    }

}// end loadEvents()


// Function to load the commands/events then login
async function startBot() 
{

    console.log('starting bot...');
    try {

        await loadCommands();
        await loadEvents();
        client.login(process.env.TOKEN);

    }catch (error) {
        console.log('Error starting bot: ', error);
    }

}// end startBot()

startBot();
