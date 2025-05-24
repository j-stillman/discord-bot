// memetourney.js
// Author: Jeremiah Stillman
// Date: 05/13/25
// This file defines the "memetourney" command and what gets executed when it is called

const { getRandomImageKey, loadServerData, saveServerData } = require('../fileFunctions');
const { getAttachmentFromS3, getObjectKeys } = require('../s3Functions');
const { sendImageToChannel } = require('../utilFunctions');

const BUCKET_NAME = process.env.BUCKET_NAME;
const NUM_MEMES = 16;
const TOURNEY_STATES = {
    UNSTARTED: 0,
    ACTIVE: 1,
    DONE: 2
};

module.exports = {
    
    data: {
        name: 'memetourney',
        description: `Starts a meme tournament with ${NUM_MEMES} random contestants.`
    },

    async execute(message, args, client) {

        let arg = args[0];

        switch(arg) {
            case 'start': 

                await startMemeTourney(message);

                break;
            case 'next':

                await progressMemeTourney(message);

                break;
            case 'cancel':

                await cancelMemeTourney(message);

                break;
            default:
                
                await createMemeTourney(message);
                
                break;
        }

    }// end execute()

};


// Function to create the meme tourney, which is began with !memetourney start
async function createMemeTourney(message)
{

    var msgText = ``;

    // Load the server data to see if a meme tourney is currently running
    var serverData = await loadServerData(message.guild);
    var champ = null;
    if (serverData.hasOwnProperty('memeTourney')) {
        if (serverData.memeTourney.active) {
            await message.channel.send(`The current tournament isn't over yet!`);
            return;
        }
        champ = serverData.memeTourney.reigningChamp;
    }else{
        serverData.memeTourney = null;
    }

    // Create the meme tourney object if it does not exist
    var tourney = {
        memes: [],                          // list of S3 keys which will be gradually shaved down to one winner
        round: 0,                           // the number of which round we're on (needed?)
        roundMessage: 0,                    // the message ID of the current round
        state: TOURNEY_STATES.UNSTARTED,    // whether the tourney is still going
        reigningChamp: champ,               // the S3 key of the last champion. the winner will be pitted against this if it exists
        tourneyHost: message.author         // The user who started the tournament 
    };

    msgText +=  `Welcome to the meme tournament! We have ${NUM_MEMES} brave contestants lined up today!\n` + 
                `${tourney.tourneyHost.globalName} will be our host.\n` + 
                `${tourney.tourneyHost.globalName}: use \`!memetourney start\` to begin the tournament.`;

    // Gather the keys and retrieve random meme keys
    const objectKeys = await getObjectKeys(BUCKET_NAME, 'images/random');
    const len = objectKeys.length;

    for (let i = 0; i < NUM_MEMES; i++) {

        // Generate a random key but exclude all videos/gifs
        let rand, key;
        do {
            rand = Math.floor(Math.random() * len);
            key = objectKeys[rand];
        }while (key.endsWith('.mp4') || key.endsWith('.mov') || key.endsWith('.gif'));
        
        // Add that key to the memes
        tourney.memes.push({
            key: key,
            delete: false
        });

    }

    /*
    for (meme of tourney.memes) {
        msgText += `\n${meme.key}`;
    }
    */

    // Indicate that the bot will respond to the message
    message.channel.sendTyping();

    // Tell the channel that the tourney is starting
    const msg = await message.channel.send({
        content: msgText
    });
    
    console.log(tourney);

    serverData.memeTourney = tourney;
    await saveServerData(message.guild, serverData);

}// end createMemeTourney()


// Function to start the meme tourney after it has been created and begin the first round
async function startMemeTourney(message) 
{

    // Check if there is a non-active meme tourney
    await message.channel.send('start...');

}// end startMemeTourney()


// Function to progress the meme tourney to the next round if it's active (counts the votes and decides a winner for the round)
async function progressMemeTourney(message)
{


    await message.channel.send('next');

}// end progressMemeTourney()


// Function to force end the current meme tourney if there is one
async function cancelMemeTourney(message) 
{

    var noActive = `There is no active meme tourney running.`;
    var noPermission = `Only the host may use this command.`;
    var canceled = `Meme tourney canceled.`;

    // Load the server data to see if a meme tourney is currently running
    var serverData = await loadServerData(message.guild);
    
    // Verify that the serverData has an active memetourney running 
    if (!serverData.hasOwnProperty('memeTourney')) {
        await message.channl.send(noActive);
        return;
    }else{

        // Reject if the tourneyhost exists and the caller is not the host
        if (serverData.memeTourney.tourneyHost) {
            if (message.author.id != serverData.memeTourney.tourneyHost.id) {
                await message.channel.send(noPermission);
                return;
            }
        }
        
        // If the tourney is over, then it doesn't need to be canceled
        if (serverData.memeTourney.state == TOURNEY_STATES.DONE) {
            await message.channel.send(noActive);
            return;
        }
    
    }

    // Delete that active tourney by creating a blank-ish one to replace it 
    var champ = serverData.memeTourney.reigningChamp;

    var newTourney = {
        memes: [],                          // list of S3 keys which will be gradually shaved down to one winner
        round: 0,                           // the number of which round we're on (needed?)
        roundMessage: 0,                    // the message ID of the current round
        state: TOURNEY_STATES.DONE,         // whether the tourney is done
        reigningChamp: champ,               // the S3 key of the last champion. the winner will be pitted against this if it exists
        tourneyHost: null                   // The user who started the tournament 
    }

    serverData.memeTourney = newTourney;

    await saveServerData(message.guild, serverData);

    await message.channel.send(canceled);

}// end cancelMemeTourney()


// Function to send the message denoting the current round of the tourney. 
async function sendTourneyRound(message, tourney)
{

    

}// end sendTourneyRound()