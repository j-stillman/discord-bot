// fileFunctions.js
// Author: Jeremiah Stillman
// Date: 04/07/25
// This file defines functionality for json reading/writing, as well as sourcing image files locally

const fs = require('fs').promises;
const { elementInArray, pushToLimitedQueue } = require('./utilFunctions');
const { saveJSONS3, fetchJSONS3, getObjectKeys } = require('./s3Functions');

// Template of a basic set of server data
const blankServerData = {
    wordCounts: {},
    goodMorningsEnabled: false,
    goodNightsEnabled: false,
    lastMemes: {
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        gn: [],
        seenit: [],
        random: [],
        aesthetic: []
    },
    homeChannel: null
};

// Constant S3 prefixes
const BUCKET_NAME = process.env.BUCKET_NAME;
const directoryPrefix = 'data/'; 
const imagesPrefix = 'images/';

// Function to save the server data. Takes a guild and data object as arguments
async function saveServerData(guild, data) 
{

    // Construct the filename and key based on the guild ID
    var filename = "data_" + guild.id + ".json";
    var key = directoryPrefix + filename;

    // Write to the file via the S3 functions
    await saveJSONS3(BUCKET_NAME, key, data);

}// end saveServerData()


// Function that retrieves the server's savedata from its data_guildID.json file, if it exists. If not, one will be created.
async function loadServerData(guild)
{

    // Find the filename based on guildID
    var filename = "data_" + guild.id + ".json";
    var key = directoryPrefix + filename;
    var data;

    // Read the file via the S3 functions
    try {

        data = await fetchJSONS3(BUCKET_NAME, key);

        // If fetchJSONS3 returned null, then create some blank server data and return that
        if (!data) {
            data = blankServerData;
        }

    }catch (error) {
        console.log('fetchJSONS3(): Error caught:', error);
        return null;
    }

    return data;

}// end loadServerData


// Function that resolves command name aliases to actual command names
async function resolveCommandAlias(commandAlias)
{
 
    // Read the aliases.json file in S3 and obtain the list of command aliases
    // A 'command alias' in this scenario is just an alternate word or spelling that corresponds to an existing command.
    // They are stored in the aliases.json file to be easily added, and to not over-complicate existing command files (e.g. adding multiple names)
    var aliases;
    try {

        const data = await fetchJSONS3(BUCKET_NAME, 'data/aliases.json');
        aliases = data.commandAlias;

    }catch (error) {
        console.log('Error reading from S3:', error);
    }

    return aliases[commandAlias];

}// end resolveCommandAlias()


// Function to retrieve a random image path from a given directory, using a GUILD object
// This function is for retrieving from the local machine, NOT S3. As such, you probably won't
// see this called very much going forward. getRandomImageKey() is its S3 equivalent.
async function getRandomImagePath(folder, guild)
{

    const imagesDir = './images/';
    const cacheSize = 3;
    
    // Get the server data for the guild in which this was called. It will be used for saving the last few memes to prevent repeats 
    var serverData = await loadServerData(guild);

    // Get the 'lastMemes' arrays from serverData. If they don't exist, create them
    var lastMemes, randImage;
    if (!serverData.hasOwnProperty("lastMemes")) {
        // The lastMemes 'cache' has not been created yet, so add that
        serverData.lastMemes = blankServerData.lastMemes;
    }else if (!serverData.lastMemes.hasOwnProperty(folder)) {
        serverData.lastMemes[folder] = [];
    }
    lastMemes = serverData.lastMemes[folder];

    // Open the file and get an array of all the images
    // TODO replace these directory reads with S3 bucket reads
    try {

        const imageArray = await fs.readdir(imagesDir + folder + '/');
        
        // Select a random image from the array
        let len = imageArray.length;
            
        // Only continue if there is at least one image in the folder
        if (len > 0) {

            // Keep selecting random images as long as they are in the cache
            // In cases where the folder size and number of images are equal, compare against a smaller cache 
            do {
                randImage = imageArray[Math.floor(len * Math.random())];
            }while ( elementInArray(randImage, lastMemes.slice(0, len - 1)) );
        
            // Add this unique random image to the cache
            lastMemes = pushToLimitedQueue(lastMemes, randImage, cacheSize);
            serverData.lastMemes[folder] = lastMemes;

        }
    
    }catch (error) {
        console.log("getRandomImagePath(): Error caught: ", error);
        return "";
    }

    // Now that (hopefully) randImage and serverData.lastMemes have been updated, save and return the path
    await saveServerData(guild, serverData);
    return imagesDir + folder + '/' + randImage;

}// end getRandomImagePath()


// Function to retrieve a random S3 image key given a subfolder. Looks in 'images/' only
// folder - the name of the subfolder of images/ in the bucket.
// guild - a guild object so we know which image cache to compare against 
async function getRandomImageKey(folder, guild)
{

    const prefix = 'images/';
    const cacheSize = 3;
    
    // Get the server data for the guild in which this was called. It will be used for saving the last few memes to prevent repeats 
    var serverData = await loadServerData(guild);

    // Get the 'lastMemes' arrays from serverData. If they don't exist, create them
    var lastMemes, randKey;
    if (!serverData.hasOwnProperty("lastMemes")) {

        // The lastMemes section has not been created yet, so add that
        serverData.lastMemes = blankServerData.lastMemes;

    }else if (!serverData.lastMemes.hasOwnProperty(folder)) {
        
        // The individual 'cache' for this particular folder hasn't been created, so add that
        serverData.lastMemes[folder] = [];

    }
    lastMemes = serverData.lastMemes[folder];

    // Open the bucket/folder and get an array of all the images
    try {

        const imageArray = await getObjectKeys(BUCKET_NAME, prefix + folder);
        
        // Select a random image from the array
        let len = imageArray.length;
            
        // Only continue if there is at least one image in the folder, otherwise move on
        if (len > 0) {

            // Keep selecting random images as long as they are in the cache
            // In cases where the folder size and number of images are equal, compare against a smaller cache 
            do {
                randKey = imageArray[Math.floor(len * Math.random())];
            }while ( elementInArray(randKey, lastMemes.slice(0, len - 1)) );
        
            // Add this unique random image to the cache, then save the new cache to the serverData object
            lastMemes = pushToLimitedQueue(lastMemes, randKey, cacheSize);
            serverData.lastMemes[folder] = lastMemes;

        }
    
    }catch (error) {
        console.log("getRandomImageKey(): Error caught: ", error);
        return "";
    }

    // Now that (hopefully) randKey and serverData.lastMemes have been updated, save and return the path
    await saveServerData(guild, serverData);
    return randKey;

}// end getRandomImageKey()



module.exports = {
    loadServerData,
    saveServerData,
    getRandomImagePath,
    getRandomImageKey,
    resolveCommandAlias
};

