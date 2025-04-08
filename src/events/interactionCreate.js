// interactionCreate.js
// Author: Jeremiah Stillman
// Date: 04/07/25

// This file defines the interactionCreate event, which is for slash commands. 
// I have chosen to give slash commands a more administrative nature on this bot, but that may change.  
// The current system in which they are executed could get somewhat tedious.

module.exports = {

    name: 'interactionCreate',
    async execute(interaction, client) {

        // Check if slash command, then process/respond to it. For now this is the only method needed but there may be more
        if (interaction.isChatInputCommand()) {
            await processSlashCommand(interaction, client);
        }

    }// end execute()

};


// Helper function to process a slash command
async function processSlashCommand(interaction, client)
{

    console.log("processing slash command...");

    // Respond to slash commands depending on their names
    switch(interaction.commandName) {
        case "info":
            await interaction.reply("I am a multi-purpose bot, most notably to enhance the character of your server :]\nPlease note I am still in Zeta, so no functionality is guaranteed.");
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
            await interaction.reply(`The sum of ${n1} and ${n2} is ${sum}.`);
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
                await interaction.reply(`${client.user.username}'s home channel has been set to ${interaction.channel}!`);

            }else{
                await interaction.reply(`You do not have permission to use this command.`);
            }

            
            break;
        case "setfavoriteword":
            // Command to create a counter for a specified word.
            // format "/setfavoriteword word"
            // It will set the bot's favorite word and 
            // Any time a user says this word, it will announce it and add it to the counter.
            // TODO Store favoriteWordCount in a json file so it does not reset between runs
            // TODO Find a way to make this word/count specific to each server.

            let favoriteWord = "";

            // Restrict the use of this command to admins only.
            // Code used to check if admin: https://stackoverflow.com/a/70563774
            if (interaction.member.permissionsIn(interaction.channel).has("ADMINISTRATOR")) {

                // Obtain the value of "word" option in the slash command
                const word = interaction.options.get("word").value;

                // Set favoriteWord to word an set favoriteWordCount to 0, only if it's a new, non-empty string 
                if (word == "") {
                    // The word is empty. Possibly impossible?
                    await interaction.reply(`Word Counter cannot be set to count empty strings.`);
                }else if (word.toLowerCase() == favoriteWord) {
                    // This word is already in use
                    await interaction.reply(`Word Counter is already set to count "${word}". Please choose another word.`);
                }else{
                    // Word is a new, non-empty string
                    favoriteWord = word.toLowerCase();
                    favoriteWordCount = 0;

                    await interaction.reply(`Word Counter has been set to count "${favoriteWord}"!`);
                }

            }else{

                // Caller is not an admin, so tell them the command cannot be used
                await interaction.reply(`You do not have permission to use this command.`);
            
            }
            
            break;
        default: 
            console.log("Error, this shouldn't happen.");
    }

}// end processSlashCommand()


// Helper function to retrieve the current server's save data
function getServerData(interaction, client) 
{
    // TODO turn this function into something usable throughout the program. Unsure of the structure still.
}// end getServerData()