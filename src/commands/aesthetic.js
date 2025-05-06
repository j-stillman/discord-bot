// aesthetic.js
// Author: Jeremiah Stillman
// Date: 04/11/25
// This file defines the "aesthetic" command which sends a random aesthetic image from the "aesthetic" images folder
const { sendImageToChannel } = require('../utilFunctions');
const { getRandomImagePath, getRandomImageKey } = require('../fileFunctions');

module.exports = {
    
    data: {
        name: 'aesthetic',
        description: "Sends a random aesthetic image/video."
    },

    async execute(message, args, client) {

        // Start typing to indidcate that the bot is in the process of responding
        message.channel.sendTyping();

        // Get the path of the image to send, updating the server's 'last memes' cache in the process
        var imageKey = await getRandomImageKey('aesthetic', message.guild);

        // Finally send the image with a little message alongside it. 
        sendImageToChannel({
            channel: message.channel,
            s3Key: imageKey,
            attachmentName: 'aesthetic'
        });

    }// end execute()

};