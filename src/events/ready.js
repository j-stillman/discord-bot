// ready.js
// Author: Jeremiah Stillman
// Date: 04/07/25

// This file defines the 'ready' event for the bot, basically just the initial setup when logged in

const fs = require('fs').promises;

const { ActivityType } = require('discord.js');
const { resolveCommandAlias, loadServerData, getRandomImagePath, getRandomImageKey, saveServerData } = require('../fileFunctions');
const { sendImageToChannel, chooseRandom, capitalizeFirstLetter } = require('../utilFunctions');
const { saveJSONS3, getObjectKeys } = require('../s3Functions');

// Use node-cron to schedule sending daily memes
const cron = require('node-cron');

// Use moment-timezone to get a list of valid timezones that node-cron uses
const moment = require('moment-timezone');

// Enum of the types of daily memes, used for checking what kind of meme to send this hour, if any
const dailyMemeTypes = {
    NONE: 0,
    GM: 1,
    GN: 2
};

// Enum of the times that daily memes will be sent 
const dailyMemeTimes = {
    MORNING: 9,
    NIGHT: 22
};

// Enum of the type of daily memes to be sent: random or curated to weekday
const gmCuration = {
    WEEKDAY: 1,
    RANDOM: 2
};

// Array of the group monikers which the bot may use to address the server
const groupMonikers = [
    "everyone", 
    "y'all", 
    "friends", 
    "fellas", 
    "companions", 
    "crew", 
    "buddies",
    "compatriots",
    "associates",
    "loved ones",
    "homies",
    "accomplices",
    "homeslices",
    "fidus Achates",
    "bezzies",
    "confidants"
];

module.exports = {

    name: 'ready',
    async execute (client) {

        client.user.setActivity({
            name: "!help for more info",
            type: ActivityType.Custom,
        });

        // Create a schedule using node-cron to send daily memes (probably better/cleaner than using a timer and checking the date/time each minute)
        cron.schedule('0 * * * *', async () => {

            const now = new Date();
            console.log("Beginning of hour. Current time:", now);

            // Every hour at 00 minutes, this will run. Go through each server's data.json file and retrieve their home channel if set
            //const dataFiles = (await fs.readdir('./data/')).filter(file => (file.includes('data_') && file.endsWith('.json')));
            //const dataFolder = await getObjectKeys(process.env.BUCKET_NAME, 'data/');
            //const dataFiles = dataFolder.filter(file => (file.includes('data_') && file.endsWith('.json')));

            // Get a list of all the guilds the bot is currently in
            var guildList = [];
            client.guilds.cache.forEach(guild => {
                guildList.push(guild);
            });

            // For each guild, determine if it is time to send that daily meme
            //for (const file of dataFiles) {
            for (const guild of guildList) {

                // Obtain the guild via the filename (TODO this is a REALLY lousy solution, maybe change it somehow)
                /*let prefixTemplate = 'data/data_';
                let guildIDTemplate = '123456789123456789';
                let guildID = file.substring(prefixTemplate.length).substring(0, guildIDTemplate.length);
                let guild;
                try {
                    guild = await client.guilds.fetch(guildID);
                }catch(error) {
                    console.log(`Guild for ID ${guildID} not found. Skipping...`);
                    continue;
                }*/
                
                let serverData = await loadServerData(guild);

                let memeToSend = await checkServerTime(serverData);

                console.log(`  guild ${guild.id}: memeToSend =`, memeToSend);

                // Send the meme to the server based on what checkServerTime returned (if valid)
                if (memeToSend != dailyMemeTypes.NONE) {
                    sendDailyMeme(client, serverData, guild, memeToSend);
                }

            }

        });

        console.log(`${client.user.username} is online!`);

    }// end execute()

};


// Function to examine a server's json data to see if it's time to send a daily meme whether that's good morning or good night
async function checkServerTime(serverData)
{

    // Obtain the timezone from serverData, if it exists
    let timezone = getServerTimezone(serverData);

    // Check if it might be time to send a meme, according to that timezone
    const currentTimeUTC = moment.utc();
    const currentTimeLocal = currentTimeUTC.clone().tz(timezone);

    // Determine if gm/gn messages are enabled
    let gmEnabled = false;
    let gnEnabled = false;
    if (serverData.hasOwnProperty("goodMorningsEnabled")) {
        if (serverData.goodMorningsEnabled) {
            gmEnabled = true;
        }
    }
    if (serverData.hasOwnProperty("goodNightsEnabled")) {
        if (serverData.goodNightsEnabled) {
            gnEnabled = true;
        }
    }

    // Check if the hour is either morning or night and return accordingly if gm/gn messages are enabled
    if (currentTimeLocal.hour() == dailyMemeTimes.MORNING) {
        if (gmEnabled) {
            return dailyMemeTypes.GM; 
        }
    }else if (currentTimeLocal.hour() == dailyMemeTimes.NIGHT) {
        if (gnEnabled) {
            return dailyMemeTypes.GN;
        }
    }

    // Otherwise, return none and move on
    return dailyMemeTypes.NONE;

}// end checkServerTime()


// Function to send a daily meme. This is triggered when the proper conditions are met during the hourly check
async function sendDailyMeme(client, serverData, guild, memeType)
{

    // Obtain the home channel of the given serverData. If invalid or not set, return without sending anything
    var homeChannel; 
    try {
        if (serverData.hasOwnProperty("homeChannel")) {
            homeChannel = await client.channels.fetch(serverData.homeChannel);
        }
    }catch (error) {
        console.log("Error caught fetching channel:", error);
        return;
    }

    // Start typing to indidcate that the bot is in the process of sending a message
    homeChannel.sendTyping();
    
    // Set up a random group moniker to address the server, for a bit more variety
    let groupMoniker = chooseRandom(groupMonikers);

    // Check which type of daily meme to send, whether it's good morning or good night
    if (memeType == dailyMemeTypes.GM) {

        // Variables for the timezone and what weekday it is, along with the text/key for the message
        let timezone = getServerTimezone(serverData);
        let currentTimeLocal = moment.utc().clone().tz(timezone);
        let weekday = currentTimeLocal.format('dddd').toLowerCase();
        let gmMessage, imageKey;

        // TODO check if it is a holiday. If so, send a special meme and change gmMessage to reflect that
        // Open up the local json file which has a list of the holidays. If it the month and date match, use that


        // Create the message to be sent
        gmMessage = `Good morning ${groupMoniker}, happy **${capitalizeFirstLetter(weekday)}** ☀️`;

        // Determine if the server has set the good morning meme type to random or weekday-curated
        let gmType;
        if (serverData.hasOwnProperty("goodMorningType")) {
            gmType = serverData.goodMorningType;
        }else{
            serverData.goodMorningType = gmCuration.WEEKDAY;
            gmType = gmCuration.WEEKDAY;
            await saveServerData(guild, serverData);
        }

        // Get the path of the image to send, updating the server's 'last memes' cache in the process
        let whichFolder = weekday;
        if (gmType == gmCuration.RANDOM) {
            whichFolder = "random";
        }
        imageKey = await getRandomImageKey(whichFolder, guild);

        // Tack on fix for holiday July 4th, TODO fix later
        let monthNumber = currentTimeLocal.month() + 1;
        let dayNumber = currentTimeLocal.date();
        if (monthNumber == 7 && dayNumber == 4) {
            gmMessage = `Happy 4th of July, ${groupMoniker} 🇺🇸🎆🧨🌭🍺`;
            imageKey = 'images/other/illegalfireworks.png';
        }

        // Finally send the image with a little message alongside it. 
        sendImageToChannel({
            channel: homeChannel,
            s3Key: imageKey,
            message: gmMessage
        });

    }else if (memeType == dailyMemeTypes.GN) {
        // Can just draw from the "gn" folder and go from there
        // Get the path of the image to send, updating the server's 'last memes' cache in the process
        let imageKey = await getRandomImageKey('gn', guild);

        // Finally send the image with a little message alongside it. 
        sendImageToChannel({
            channel: homeChannel,
            s3Key: imageKey,
            message: `Good night, ${groupMoniker} 🌙`
        });

    }

}// end sendDailyMeme()


// Helper function to get the timezone based on serverData
function getServerTimezone(serverData)
{

    var timezone = "America/New_York";
    if (serverData.hasOwnProperty("timezone")) {
        // Ensure the timezone from the json file is valid, just to be safe
        if (moment.tz.names().includes(serverData.timezone)) {
            timezone = serverData.timezone;
        }

    }

    return timezone;

}// end getServerTimezone()
