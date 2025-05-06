// random.js
// Author: Jeremiah Stillman
// Date: 04/09/25
// This file defines the "random" command which sends a random meme from the "random" images folder
const { sendImageToChannel } = require('../utilFunctions');
const { getRandomImagePath, getRandomImageKey } = require('../fileFunctions');

module.exports = {
    
    data: {
        name: 'random',
        description: "Sends a random meme."
    },

    async execute(message, args, client) {

        // Start typing to indidcate that the bot is in the process of responding
        message.channel.sendTyping();

        // Get the path of the image to send, updating the server's 'last memes' cache in the process
        var imageKey = await getRandomImageKey('random', message.guild);

        // Finally send the image with a little message alongside it. 
        sendImageToChannel({
            channel: message.channel,
            s3Key: imageKey,
            attachmentName: 'randomeme'
        });

    }// end execute()

};