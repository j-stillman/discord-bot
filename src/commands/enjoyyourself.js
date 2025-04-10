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
        
        sendImageToChannel({
            channel: message.channel,
            path: './images/other/enjoy.mp4',
            message: `SAINT PEPSI - Enjoy Yourself 🌜🌜🌜`,
            replyTo: message
        });
    
    }// end execute()

};