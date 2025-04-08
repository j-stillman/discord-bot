// ping.js
// Author: Jeremiah Stillman
// Date: 04/07/25

// This file defines the "ping" command and what gets executed when it is called
module.exports = {
    
    data: {
        name: 'info',
        description: "Some information about this bot. For more detailed info, type `!info long`."
    },

    async execute(message, args, client) {
        
        if (args[0] === "long") {
            await message.channel.send(`I wanted to type something really long and funny here but I couldn't think of anything. So it's actually shorter.`);
        }else{
            await message.channel.send('I am a multi-purpose bot, most notably to enhance the character of your server :]\nPlease note I am still in Zeta, so no functionality is guaranteed.');
        }
    }// end execute()

};