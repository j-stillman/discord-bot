// messageCreate.js
// Author: Jeremiah Stillman
// Date: 04/07/25

// This file defines the messageCreate event for the discord bot
// Parses messages and responds accordingly. Ex: responding to !commands or counting instances of a certain pre-defined word

const { ResolveCommandAlias } = require("../fileFunctions");

const commandPrefix = '!';

module.exports = {
    
    name: 'messageCreate',
    async execute(message, client) {

        // Prevent infinite bot loops 
        if (message.author.bot) { return; }
        
        // Check if a bot command, or if a regular message
        if (message.content.startsWith(commandPrefix)) {
            await processCommand(message, client);
        }else{
            await processMessage(message, client);
        }

    }// end execute()

};


// Helper function to process a !command if detected
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
        const resolvedAlias = await ResolveCommandAlias(commandName);
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
        message.reply(`Command not recognized. Use ${commandPrefix}help to see a list of valid commands.`);
    }

}// end processCommand()


// Helper function to process a regular message, such as to find important words
async function processMessage(message, client) 
{

    console.log("processing a message...");

}// end processMessage()