// ping.js
// Author: Jeremiah Stillman
// Date: 04/07/25
// This file defines the "ping" command and what gets executed when it is called

const { getAttachmentFromS3, getObjectKeys } = require('../s3Functions');

module.exports = {
    
    data: {
        name: 'ping',
        description: "Replies with Pong!"
    },

    async execute(message, args, client) {
        

        /*
        await message.channel.send({
            content: "Pong!"
        });
        */


        await message.channel.send({
            content: "Here's Bob Ross:",
            files: [await getAttachmentFromS3(process.env.BUCKET_NAME, 'images/other/bob ross petting baby deer.gif', 'bobross')]
        });

        var keys = await getObjectKeys(process.env.BUCKET_NAME);
        console.log(keys);
        console.log('Here are just the keys in other:');
        keys = await getObjectKeys(process.env.BUCKET_NAME, 'images/other');
        console.log(keys);

    
    }// end execute()

};