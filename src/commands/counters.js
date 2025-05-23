// counters.js
// Author: Jeremiah Stillman
// Date: 04/08/25

const { loadServerData } = require("../fileFunctions");
const { capitalizeFirstLetter } = require("../utilFunctions");

// This file defines the "counters" command which gives a list of all the active word counters
module.exports = {
    
    data: {
        name: 'counters',
        description: "Displays counts for all active word counters in the server."
    },

    async execute(message, args, client) {
        
        // Get the server data then extract the word counters from it
        let serverData = await loadServerData(message.guild);
        let wordCounts = serverData.wordCounts;
        let numCounters = 0;
        let response = `**Here are the current word counts:**`;

        Object.keys(wordCounts).forEach(word => {
            let upperCaseWord = capitalizeFirstLetter(word);
            response += `\n\`${upperCaseWord}\` = ${wordCounts[word]}`;
            numCounters++;
        });

        if (numCounters == 0) {
            response = "No word counters have been set yet. Admins may use /addwordcounter to create one";
        }

        await message.channel.send(response);
    
    }// end execute()

};