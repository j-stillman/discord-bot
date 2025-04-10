// random.js
// Author: Jeremiah Stillman
// Date: 04/09/25
// This file defines the "random" command which sends a random meme from the "random" images folder
const { sendImageToChannel } = require('../utilFunctions');
const { getRandomImagePath } = require('../fileFunctions');

module.exports = {
    
    data: {
        name: 'random',
        description: "Sends a random meme."
    },

    async execute(message, args, client) {

        // Get the path of the image to send, updating the server's 'last memes' cache in the process
        var imagePath = await getRandomImagePath('random', message.guild);

        // Finally send the image with a little message alongside it. 
        sendImageToChannel({
            channel: message.channel,
            path: imagePath,
        });

    }// end execute()

};