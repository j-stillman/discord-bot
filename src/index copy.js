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

// DISCORD IMPORTS ====================================================================================================

// We must require 'dotenv' to be able to access the token. The token must stay private in .env
require('dotenv').config();

// Notes: Intents are "permissions" for a bot. They take the form of constants e.g. "GUILD_CREATE", "GUILD_UPDATE".
// If you look at the line "IntentsBitField.Flags.Guilds", that means all the consts beginning with "GUILD" are allowed. 
// See the Discord documentation on Intents here: https://discord.com/developers/docs/topics/gateway#list-of-intents
const { Client, 
        IntentsBitField,
        ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ],
});

// FILESTREAM IMPORTS =================================================================================================

const fs = require('fs');
client.data = require("../data/data.json"); 


// BOT-SPECIFIC VARIABLES =============================================================================================

// TODO set it up so that favoriteWord and count are stored in a JSON file
// Have the bot load favoriteWord and favoriteWordCount from the JSON, and save it 
// to the JSON when either are updated. (count is updated in the messageCreate event
// while favoriteWord is changed via the slash command)
// This way the bot can keep the count running even if it crashes and must be reloaded 
favoriteWord = "";                                  // Word that the bot will keep count of (temporary?)
favoriteWordCount = 0;                              // Amount of times that word has been said (temporary)


// Finally login the client. The client needs a token to login which acts as a sort of identifier/password to allow for development.
// The token is stored in the file .env, which is specific to the environment. .env was added to .gitignore which prevents
// it from being put on github. We don't want the token shared because it is a security risk. If it were leaked, someone could
// use the token to program the bot without permission. Unsure what would happen if there were two programs that used 
// client.login() with the same token. Would they run simultaneously? I kinda don't see why not. 
client.login(process.env.TOKEN);

// Tutorial guy said to npm install -g nodemon. When you call nodemon (instead of "node ." or "node src/index.js"),
// the program updates automatically as changes are made. I personally don't wanna mess with this but I did install it
// Maybe it'll come in handy later.


// CLIENT EVENT LISTENERS =============================================================================================

// Event listener when client is ready
client.on("ready", (c) => {
    console.log(`${c.user.username} is online!`);   // Note the use of ` as quotes. This allows the ${} formatting which lets us directly reference the bot's screen name. 
                                                    // You can also use c.user.tag to get the username with the 4 digit discord code.
                                                    // Go to discord.js.org and look up Message in the documentation for more info
    client.user.setActivity({
        name: "Plauche",
        type: ActivityType.Custom,
    });
    

    // Announce to the server (in #bot-spam) that the bot is now online (mostly for debugging)
    // TODO probably delete this later, especially if other servers intend to use this bot (they won't)
    var g = client.guilds.cache.get("628638523771322388");
    var chan = g.channels.cache.get("1182552828292644956");
    //chan.send(`${client.user.displayName} is online! Hello, everyone!`);

});

// Event listener when a slash command is sent
client.on("interactionCreate", (interaction) => {
    // Only continue if the interaction is a slash command (denoted as a ChatInputCommand here apparently)
    // Otherwise, return from the block immediately
    if (!interaction.isChatInputCommand()) { return; }
    
    // Respond to slash commands depending on their names
    switch(interaction.commandName) {
        case "info":
            interaction.reply("I am a multi-purpose bot, most notably to enhance the character of your server :]\nPlease note I am still in Zeta, so no functionality is guaranteed.");
            break;
        case "add":
            // Retrieve the two arguments first-number and second-number from the slash command
            const n1 = interaction.options.get("first-number").value;
            const n2 = interaction.options.get("second-number").value;
            var sum = 0;
            
            // Funny joke easter egg 9 + 10 = 21
            if ((n1 == 9 && n2 == 10) || (n1 == 10 && n2 == 9)) {
                sum = 21;
            }else{
                sum = n1 + n2;
            }   

            // Reply with their sum
            interaction.reply(`The sum of ${n1} and ${n2} is ${sum}.`);
            break;
        case "sethomechannel":
            // Command to set the "home" channel of the bot to the channel in which this command was called

            // Restrict the use of this command to admins only.
            // Code used to check if admin: https://stackoverflow.com/a/70563774
            if (interaction.member.permissionsIn(interaction.channel).has("ADMINISTRATOR")) {

                // TODO Create a variable that defines the home channel and save it in the JSON profile for whichever
                // server it was called.
                // The JSON should have different "profiles" for each server, where the home channel, favorite word counts, etc 
                // are stored. 

                // Reply that the home channel has been set
                // TODO Optimize this such that it isn't hardcoded
                interaction.reply(`${client.user.username}'s home channel has been set to ${interaction.channel.id}!`);

            }else{
                interaction.reply(`You do not have permission to use this command.`);
            }

            
            break;
        case "setfavoriteword":
            // Command to create a counter for a specified word.
            // format "/setfavoriteword word"
            // It will set the bot's favorite word and 
            // Any time a user says this word, it will announce it and add it to the counter.
            // TODO Store favoriteWordCount in a json file so it does not reset between runs
            // TODO Find a way to make this word/count specific to each server.

            // Restrict the use of this command to admins only.
            // Code used to check if admin: https://stackoverflow.com/a/70563774
            if (interaction.member.permissionsIn(interaction.channel).has("ADMINISTRATOR")) {

                // Obtain the value of "word" option in the slash command
                const word = interaction.options.get("word").value;

                // Set favoriteWord to word an set favoriteWordCount to 0, only if it's a new, non-empty string 
                if (word == "") {
                    // The word is empty. Possibly impossible?
                    interaction.reply(`Word Counter cannot be set to count empty strings.`);
                }else if (word.toLowerCase() == favoriteWord) {
                    // This word is already in use
                    interaction.reply(`Word Counter is already set to count "${word}". Please choose another word.`);
                }else{
                    // Word is a new, non-empty string
                    favoriteWord = word.toLowerCase();
                    favoriteWordCount = 0;

                    interaction.reply(`Word Counter has been set to count "${favoriteWord}"!`);
                }

            }else{

                // Caller is not an admin, so tell them the command cannot be used
                interaction.reply(`You do not have permission to use this command.`);
            
            }
            
            break;
        default: 
            console.log("Error, this shouldn't happen.");
    }

});

// Event listener when a message is created
client.on("messageCreate", (message) => {

    // Prevent the bot from manipulating its own messages.
    if (message.author.bot) { return; }

    console.log(message);           // Give this a good look in the console whenever a message is sent.
                                    // There are a lot of attributes to a discord message. You can use it as a sort of reference too I think.
    
    // Obtain the guild ID of the message and relate it back to the server profile in the JSON file
    let serverProfile = client.data["servers"][message.guild.id];

    // Begin parsing the message to determine the response, if any.
    let lowerMessage = message.content.toLowerCase();       // The message in lowercase
    let messageWords = lowerMessage.split(' ');             // Array of words of the message, in lowercase
    let favoriteWordsDetected = 0;                          // Amount of times favoriteWord was detected

    // Start looking for instances of favoriteWord if it has been set
    if (favoriteWord != "") {

        // For each word in messageWord, see if favoriteWord comes up and increment favoriteWordsDetected if it does
        for(i = 0; i < messageWords.length; i++) {

            if (messageWords[i].includes(favoriteWord)) {
                favoriteWordsDetected++;
            }

        }

        // Once crawling the message is complete, add to the counter and announce it to the server
        if (favoriteWordsDetected > 0) {
            favoriteWordCount += favoriteWordsDetected;

            // Set the first letter uppercase for message. Code found at: https://stackoverflow.com/a/1026087
            let upperCaseWord = favoriteWord.charAt(0).toUpperCase() + favoriteWord.slice(1);
            message.channel.send(`**Ding!**\n${upperCaseWord} counter: ${favoriteWordCount}`);

        }

    }

});


