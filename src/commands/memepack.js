// memepack.js
// Author: Jeremiah Stillman
// Date: 05/13/25
// This file defines the "memepack" command and what gets executed when it is called

const { getRandomImageKey } = require('../fileFunctions');
const { getAttachmentFromS3, getObjectKeys } = require('../s3Functions');
const { sendImageToChannel } = require('../utilFunctions');

const BUCKET_NAME = process.env.BUCKET_NAME;
const NUM_MEMES = 10;

module.exports = {
    
    data: {
        name: 'memepack',
        description: `**LIMITED TIME!** Get ${NUM_MEMES} FREE memes sent directly to you!`
    },

    async execute(message, args, client) {

        // Indicate that the bot will respond to the message
        message.channel.sendTyping();

        // Tell the user that the meme pack will be sent
        let msgText = `I will DM you ${NUM_MEMES} memes momentarily. Please wait...\n`;
        const msg = await message.reply({
            content: msgText
        });

        // Gather the keys and retrieve 10 meme keys
        var attachments = [];
        const objectKeys = await getObjectKeys(BUCKET_NAME, 'images/random');
        const len = objectKeys.length;

        for (let i = 0; i < NUM_MEMES; i++) {

            let rand = Math.floor(Math.random() * len);
            let attachment = await getAttachmentFromS3(BUCKET_NAME, objectKeys[rand], `meme_${i+1}`);
            attachments.push(attachment);

        }

        // DM that array of attachments to the original sender
        try {
            const sender = message.author;
            await sender.send({
                content: "Here are your memes:",
                files: attachments
            });

            await msg.edit(msgText + `Memes sent successfully!`);
        }catch (error) {
            console.log(`Error sending DM:`, error);
            await msg.edit(msgText + `There seems to have been an error.`);
        }
        

    }// end execute()

};