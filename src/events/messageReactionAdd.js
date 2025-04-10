// messageReactionAdd.js
// Author: Jeremiah Stillman
// Date: 04/09/25

// This file defines the messageCreate event for the discord bot
// Parses messages and responds accordingly. Ex: responding to !commands or counting instances of a certain pre-defined word

const { resolveCommandAlias, loadServerData, saveServerData } = require("../fileFunctions");
const { capitalizeFirstLetter, chooseRandom } = require("../utilFunctions");

const commandPrefix = '!';

module.exports = {
    
    name: 'messageReactionAdd',
    async execute(reaction, user) {

        console.log(`Message Reaction Add event triggered`);

        // Check if the reaction is partial (incomplete?) 
        if (reaction.partial) {
            // Try to fetch the message reaction
            try{
                await reaction.fetch();
            }catch (error){
                console.log("Error caught: ", error);
                return;
            }

        }

        // Access the reaction properties
        const { message, emoji } = reaction;
        const { name: emojiName, id: emojiId } = emoji;

        // Perform actions based on reaction
        if (emojiName == '👏') {
            console.log(`Someone reacted with ${emojiName}`);
        }

    }// end execute()

};


