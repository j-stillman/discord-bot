// ping.js
// Author: Jeremiah Stillman
// Date: 04/07/25
// This file defines the "ping" command and what gets executed when it is called

const { getAttachmentFromS3, getObjectKeys } = require('../s3Functions');
const { sendImageToChannel } = require('../utilFunctions');

module.exports = {
    
    data: {
        name: 'ping',
        description: "Replies with Pong!"
    },

    async execute(message, args, client) {
        
        // Start typing to indicate that the bot is about to respond
        message.channel.sendTyping();
        
        await message.channel.send({
            content: "Pong!"
        });
        
/*
        try {
            var attachment = await getAttachmentFromS3(process.env.BUCKET_NAME, 'images/other/other_6196790140.mp4', 'file');
        }catch (err) {
            console.log('error caught on discord:', err);
            console.timeEnd("discordReply");
        }
*/
/*        
        await sendImageToChannel({
            channel: message.channel,
            s3Key: 'images/other/other_6196790140.mp4',
            message: 'Here is your file sir:'
        });
*/
        /*
        console.log("message sent!");

        var keys = await getObjectKeys(process.env.BUCKET_NAME);
        console.log(keys);
        console.log('Here are just the keys in other:');
        keys = await getObjectKeys(process.env.BUCKET_NAME, 'images/other');
        console.log(keys);
*/
    
    }// end execute()

};