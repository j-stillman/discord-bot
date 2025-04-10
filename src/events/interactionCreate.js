// interactionCreate.js
// Author: Jeremiah Stillman
// Date: 04/07/25

const { loadServerData, saveServerData } = require("../fileFunctions");

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

                
                // Load the save data for the guild, set the homeChannel, then save it back
                let serverData = await loadServerData(interaction.guild); 
                serverData.homeChannel = interaction.channel.id;
                await saveServerData(interaction.guild, serverData);

                // Reply that the home channel has been set
                // TODO Optimize this such that it isn't hardcoded
                await interaction.reply(`${client.user.username}'s home channel has been set to ${interaction.channel}!`);

            }else{
                await interaction.reply(`You do not have permission to use this command.`);
            }

            
            break;
        case "addwordcounter":
            // Command to create a counter for a specified word.
            // format "/addwordcounter word"

            // Restrict the use of this command to admins only.
            if (interaction.member.permissionsIn(interaction.channel).has("ADMINISTRATOR")) {
                // Caller is admin, so go forward with the addition of the counter
                await addWordCounter(interaction);

            }else{
                // Caller is not an admin, so tell them the command cannot be used
                await interaction.reply(`You do not have permission to use this command.`);
            
            }
            
            break;
        case "removewordcounter":

            // Restrict the use of this command to admins only.
            if (interaction.member.permissionsIn(interaction.channel).has("ADMINISTRATOR")) {
                // Caller is admin, so go forward with the addition of the counter
                await removeWordCounter(interaction);

            }else{
                // Caller is not an admin, so tell them the command cannot be used
                await interaction.reply(`You do not have permission to use this command.`);
            
            }

            break;
        default: 
            console.log("Error, this shouldn't happen.");
    }

}// end processSlashCommand()


// Helper function to create a word counter. Ensures the capacity is not reached and duplicates are not created
async function addWordCounter(interaction)
{

    // Obtain the server data, specifically the wordCounts attribute of the data
    let serverData = await loadServerData(interaction.guild);
    let wordCounts = serverData.wordCounts;

    // Get the word then ensure it is a valid addition to the set
    let word = interaction.options.get("word").value.toLowerCase();

    if (word == "") {
        // Can't have an empty string, but this will never happen since the argument is specified as 'required' elsewhere
        await interaction.reply(`Word Counter cannot be set to count empty strings.`);
    
    }else if (wordCountsContains(wordCounts, word)) {
        // The word is already being counted in the server
        await interaction.reply(`There is already a counter set for "${word}".`);
    
    }else if (Object.keys(wordCounts).length >= 10) {
        // There are too many words being counted, this cannot be added
        await interaction.reply(`Too many word counters are active. Please remove one using \`/removewordcounter\`.`);
    
    }else{

        // All other checks passed, so the word counter can be added
        wordCounts[word] = 0;
        serverData.wordCounts = wordCounts;
        await saveServerData(interaction.guild, serverData);

        await interaction.reply(`Word counter has been set to count "${word}"!`);

    }

}// end addWordCounter()


// Helper function to remove a word counter. Ensures the word counter exists before deletion
async function removeWordCounter(interaction)
{

    // Obtain the server data, specifically the wordCounts attribute of the data
    let serverData = await loadServerData(interaction.guild);
    let wordCounts = serverData.wordCounts;

    // Get the word then ensure it is a valid addition to the set
    let word = interaction.options.get("word").value.toLowerCase();

    if (word == "") {
        // Can't have an empty string, but this will never happen since the argument is specified as 'required' elsewhere
        await interaction.reply(`Please enter a word whose counter you wish to delete.`);
    
    }else if (wordCountsContains(wordCounts, word)) {
        // The word is already being counted in the server
           
        delete wordCounts[word];
        serverData.wordCounts = wordCounts;
        await saveServerData(interaction.guild, serverData);

        await interaction.reply(`Word counter for "${word}" has been deleted.`);
    
    }else{
        // No counter for that word has been found
        await interaction.reply(`No word counter was found for "${word}".`);

    }

}// end removeWordCounter()


// Helper function to check if a given word exists within a wordCounts list
function wordCountsContains(wordCounts, word)
{

    let lowerWord = word.toLowerCase();
    let result = false;

    // Go through the wordCounts and find if the word matches
    Object.keys(wordCounts).forEach(w => {
        if (w == lowerWord) { 
            result = true; 
        }
    });

    return result;

}// end wordCountsContains()


