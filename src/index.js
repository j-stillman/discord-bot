// index.js
// Author: Jeremiah Stillman
// Date: 12/07/23

// This is the main entrypoint program for what is currently called "Meme Bot". 
// For now I'm following a tutorial series ( https://www.youtube.com/watch?v=KZ3tIGHU314 )
// And once I think I have a good foundation I will start moving the pieces around to 
// make it do something more unique.
// Once I'm done with the tutorial, it might be a good idea to check this resource: 
// https://discordjs.guide/creating-your-bot/event-handling.html#individual-event-files
// to separate the event handlers into their own files so it's cleaner and easier to understand. 

// For now all the bot does is log the message metadata for anyone who isn't a bot,
// and responds with "That's me!" whenever someone types "Meme Bot" in the chat.
// It also responds to a very basic slash command per the tutorial.

// We must require 'dotenv' to be able to access the token. The token must stay private in .env
require('dotenv').config();

// Notes: Intents are "permissions" for a bot. They take the form of constants e.g. "GUILD_CREATE", "GUILD_UPDATE".
// If you look at the line "IntentsBitField.Flags.Guilds", that means all the consts beginning with "GUILD" are allowed. 
// See the Discord documentation on Intents here: https://discord.com/developers/docs/topics/gateway#list-of-intents
const { Client, IntentsBitField } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

// Login the client. The client needs a token to login which acts as a sort of identifier/password to allow for development.
// The token is stored in the file .env, which is specific to the environment. .env was added to .gitignore which prevents
// it from being put on github. We don't want the token shared because it is a security risk. If it were leaked, someone could
// use the token to program the bot without permission. Unsure what would happen if there were two programs that used 
// client.login() with the same token. Would they run simultaneously? I kinda don't see why not. 
client.login(process.env.TOKEN);

// Event listener when client is ready
client.on("ready", (c) => {
    console.log(`${c.user.username} is online!`);   // Note the use of ` as quotes. This allows the ${} formatting which lets us directly reference the bot's screen name. 
                                                    // You can also use c.user.tag to get the username with the 4 digit discord code.
                                                    // Go to discord.js.org and look up Message in the documentation for more info
});

// Event listener when a slash command is sent
client.on("interactionCreate", (interaction) => {
    // Only continue if the interaction is a slash command (denoted as a ChatInputCommand here apparently)
    // Otherwise, return from the block immediately
    if (!interaction.isChatInputCommand()) { return; }

    // Respond to slash commands depending on their names
    switch(interaction.commandName) {
        case "info":
            interaction.reply("I am a multi-purpose bot, most notably to enhance the character of your server :]");
            break;
        default: 
            console.log("Error, this shouldn't happen.");
    }

});

// Event listener when a message is created
client.on("messageCreate", (message) => {

    // Below is a control to prevent the bot from manipulating its own messages.
    if (message.author.bot) { return; }

    console.log(message);           // Give this a good look in the console whenever a message is sent.
                                    // There are a lot of attributes to a discord message. You can use it as a sort of reference too I think.
    
    if (message.content === "Meme Bot") {
        message.reply("That's me!");
    }

});

// Tutorial guy said to npm install -g nodemon. When you call nodemon (instead of "node ." or "node src/index.js"),
// the program updates automatically as changes are made. I personally don't wanna mess with this but I did install it
// Maybe it'll come in handy later.
