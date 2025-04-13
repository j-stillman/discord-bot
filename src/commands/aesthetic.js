// aesthetic.js
// Author: Jeremiah Stillman
// Date: 04/11/25
// This file defines the "random" command which sends a random meme from the "random" images folder
const { sendImageToChannel } = require('../utilFunctions');
const { getRandomImagePath } = require('../fileFunctions');

module.exports = {
    
    data: {
        name: 'aesthetic',
        description: "Sends a random aesthetic image/video."
    },

    async execute(message, args, client) {

        // Get the path of the image to send, updating the server's 'last memes' cache in the process
        var imagePath = await getRandomImagePath('aesthetic', message.guild);

        // Finally send the image with a little message alongside it. 
        sendImageToChannel({
            channel: message.channel,
            path: imagePath,
        });

    }// end execute()

};