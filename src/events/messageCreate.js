// messageCreate.js
// Author: Jeremiah Stillman
// Date: 04/07/25

// This file defines the messageCreate event for the discord bot
// Parses messages and responds accordingly. Ex: responding to !commands or counting instances of a certain pre-defined word

const { resolveCommandAlias, loadServerData, saveServerData } = require("../fileFunctions");
const { capitalizeFirstLetter, chooseRandom } = require("../utilFunctions");

const commandPrefix = '!';

module.exports = {
    
    name: 'messageCreate',
    async execute(message, client) {

        // Prevent infinite bot loops 
        if (message.author.bot) { return; }
        
        // Check if a bot command, or if a regular message
        // TODO this check needs to be more specific. If one were to type "! message text here"
        // or maybe they're exclaiming "!!! omg wow" then the bot will think it is a command
        // This poses a problem where if they say a word that's being counted, then it won't trigger
        // because it already thinks it is processing a command.
        if (message.content.startsWith(commandPrefix)) {
            await processCommand(message, client);
        }else{
            await processMessage(message, client);
        }

    }// end execute()

};


// Function to process a !command if detected
async function processCommand(message, client)
{

    console.log("processing a command...")
    const args = message.content.slice(commandPrefix.length).trim().split(/\s+/);
    const commandName = args.shift().toLowerCase();
    
    // Retrieve the command from the client's commands Collection using commandName as a key
    var command = client.commands.get(commandName);

    if (!command) {
        // If the command wasn't found, check if it is an alias and resolve
        console.log("command wasn't found so attempting to resolve alias")
        const resolvedAlias = await resolveCommandAlias(commandName);
        if (resolvedAlias) {
            console.log("alias resolved!");
            command = client.commands.get(resolvedAlias);
        }
    }

    if (command) {
        
        try {

            await command.execute(message, args, client);

        }catch (error) {
            console.log("Error encountered running command: ", error);
            message.reply('There was an error executing that command.');
        }

    }else{
        // Unrecognized command, direct users to use !help command?
        // This is actually somewhat annoying especially if you have another bot which also takes commands with the same prefix
        //message.reply(`Command not recognized. Use ${commandPrefix}help to see a list of valid commands.`);
    }

}// end processCommand()


// Function to process a regular message, such as to find important words
async function processMessage(message, client) 
{

    console.log("processing a message...");
    await processWordCounts(message);
    

}// end processMessage()


// Helper function to compare a message against the word counters
async function processWordCounts(message)
{

    // Get the message string in lowercase
    var msg = message.content.toLowerCase();
    var msgTokens = msg.split(/\s+/);

    // Load the server data to get the word counters
    var serverData = await loadServerData(message.guild);
    var wordCounts = serverData.wordCounts;
    var wordIncreases = {};

    // For each active counter, check to see if that word appears in the string
    Object.keys(wordCounts).forEach(word => {
 
        wordIncreases[word] = 0;
        for (token of msgTokens) {
            if (token.includes(word)) {
                wordIncreases[word]++;
            }
        }

    });

    // Loop through the word counters and update/save the server data if applicable and announce the increases as a message
    var counterTriggered = false;
    var counterResponse = "**Ding!** " + chooseRandom([':bellhop:', ':bell:', ':tada:']);

    Object.keys(wordIncreases).forEach(word => {
        let increase = wordIncreases[word];
        if (increase > 0) {
            wordCounts[word] += increase;

            let upperCaseWord = capitalizeFirstLetter(word);
            counterResponse = counterResponse + `\n\`${upperCaseWord}\` counter: ${wordCounts[word]}`;
            
            // Set it so the counters will be saved at the end of this process
            counterTriggered = true;
        }
    });

    // If words were found, then save it to the json, and also announce it to the server with a fun message
    if (counterTriggered) {

        serverData.wordCounts = wordCounts;
        
        // Only send counterResponse if the server admin has enabled it (enabled by default)
        if (!serverData.hasOwnProperty("counterDingsEnabled")) {
            serverData.counterDingsEnabled = true;
        }

        if (serverData.counterDingsEnabled) {
            await message.channel.send(counterResponse);
        }
        
        await saveServerData(message.guild, serverData);

    }

}// end processWordCounts()

