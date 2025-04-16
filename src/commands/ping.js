// ping.js
// Author: Jeremiah Stillman
// Date: 04/07/25

// This file defines the "ping" command and what gets executed when it is called
module.exports = {
    
    data: {
        name: 'ping',
        description: "Replies with Pong!"
    },

    async execute(message, args, client) {
        
        await message.channel.send({
            content: "Pong!"
        });
    
    }// end execute()

};