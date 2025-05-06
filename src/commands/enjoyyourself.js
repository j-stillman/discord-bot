// enjoyyourself.js
// Author: Jeremiah Stillman
// Date: 04/09/25

const { sendImageToChannel } = require("../utilFunctions");

// This file defines the "enjoyyourself" command which sends the music video for SAINT PEPSI - Enjoy Yourself
module.exports = {
    
    data: {
        name: 'enjoyyourself',
        description: "SAINT PEPSI - Enjoy Yourself 🌜"
    },

    async execute(message, args, client) {
        
        // Start typing to indicate the bot is in the process of responding
        message.channel.sendTyping();

        sendImageToChannel({
            channel: message.channel,
            s3Key: 'images/other/other_6196790140.mp4',
            message: `SAINT PEPSI - Enjoy Yourself 🌜🌜🌜`,
            attachmentName: 'enjoy',
            replyTo: message
        });
    
    }// end execute()

};