// seenit.js
// Author: Jeremiah Stillman
// Date: 04/09/25
// This file defines the "seenit" command which is used as a response to a meme one has already seen.
// Functionally equivalent to the "random" command which sends a random meme, but draws from a different, 
// more topical meme directory where all the memes are about "already seeing that meme" 
const { sendImageToChannel } = require('../utilFunctions');
const { getRandomImagePath, getRandomImageKey } = require('../fileFunctions');

module.exports = {
    
    data: {
        name: 'seenit',
        description: "For when you've already seen that meme. Let em know with style."
    },

    async execute(message, args, client) {

        // Start typing to indidcate that the bot is in the process of responding
        message.channel.sendTyping();

        var reference;

        // See if the message is a reply. If it is, the bot can reply directly to that same meme for comedic effect 
        if (message.reference) {
            try {
                reference = await message.channel.messages.fetch(message.reference.messageId);
            }catch (error) {
                console.log("Error fetching message reference: ", error);
            }

            if (reference) { reference.react('417863853154500610'); }
        }

        // Get the path of the image to send, updating the server's 'last memes' cache in the process
        var imageKey = await getRandomImageKey('seenit', message.guild);

        // Finally send the image with a little message alongside it. 
        sendImageToChannel({
            channel: message.channel,
            s3Key: imageKey,
            message: `Uh-oh! **${message.author.globalName}** has already seen that meme!`,
            attachmentName: 'seenit',
            replyTo: reference
        });

    }// end execute()

};