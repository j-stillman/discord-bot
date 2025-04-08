// help.js
// Author: Jeremiah Stillman
// Date: 04/07/25

// This file defines the "help" command which gives a list of all the possible commands (and descriptions?)
module.exports = {
    
    data: {
        name: 'help',
        description: "Gives a list of available commands."
    },

    async execute(message, args, client) {
        
        // TODO set it up so that commands appear in alphabetical order, but then again I think they already do
        let response = "**Here is a list of available commands:**\n";
        for (let command of client.commands) {
            console.log(command);
            let n = command[1].data.name;
            let d = command[1].data.description;
            response += `\`!${n}\` - ${d}\n`;
        }

        if (response != "") {
            message.channel.send(response);
        }
    
    }// end execute()

};