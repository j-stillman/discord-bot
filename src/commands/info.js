// ping.js
// Author: Jeremiah Stillman
// Date: 04/07/25

const { loadServerData } = require("../fileFunctions");
const { getObjectKeys } = require("../s3Functions");

// This file defines the "ping" command and what gets executed when it is called
module.exports = {
    
    data: {
        name: 'info',
        description: "Some information about this bot. For more detailed info, type `!info long`."
    },

    async execute(message, args, client) {



        let serverData = await loadServerData(message.guild);
        let homeChannelName = "`undefined`";
        let homeChannel;
        if (serverData.homeChannel) {
            homeChannel = await client.channels.fetch(serverData.homeChannel);
            homeChannelName = homeChannel.name;
        }
        if (args[0] === "long") {
            await message.channel.send(
                `I wanted to type something really long and funny here but I couldn't think of anything. So it's actually shorter.\n` +
                `My current home channel is ${homeChannelName}, which is where you'll find me posting daily memes.`
            );
        }else if (args[0] === "memes") {

            // Start typing to indicate the bot is in the process of responding
            message.channel.sendTyping();

            // Get the data on how many memes are in the S3 folder
            const memeCounts = [
                {folder: 'random', count: 0},
                {folder: 'aesthetic', count: 0},
                {folder: 'seenit', count: 0},
                {folder: 'sunday', count: 0},
                {folder: 'monday', count: 0},
                {folder: 'tuesday', count: 0},
                {folder: 'wednesday', count: 0},
                {folder: 'thursday', count: 0},
                {folder: 'friday', count: 0},
                {folder: 'saturday', count: 0},
                {folder: 'gn', count: 0},
            ];

            var total = 0;
            for (let memeCount of memeCounts) {
                const keys = await getObjectKeys(process.env.BUCKET_NAME, 'images/' + memeCount.folder);
                memeCount.count = keys.length;
                total += memeCount.count;
            }

            // Tell the users about it
            responseString = `The images and videos sent by this bot are all hosted on an Amazon Web Services S3 bucket. To give you an idea of scale, below are the counts for each 'genre' of file:\n`;

            for (let memeCount of memeCounts) {
                responseString += '`' + `${memeCount.folder}` + '`' + ` - ${memeCount.count} files\n`;
            }
            responseString += `Total files: ${total}\n`;

            responseString += `\nThere are virtually no limits to the size of this pool. In the future there will hopefully be a way for users to add memes of their own. Stay tuned!`;

            // Send the message
            await message.channel.send(responseString);

        }else if (args[0] == "memetourney") {
            message.channel.sendTyping();
            await message.channel.send('`!memetourney` - Starts a meme tournament');
        }else{
            await message.channel.send('I am a multi-purpose bot, most notably to enhance the character of your server :]\nPlease note I am still in Zeta, so no functionality is guaranteed.');
        }
        
    }// end execute()

};