// fileFunctions.js
// Author: Jeremiah Stillman
// Date: 04/07/25

// This file defines functionality for json reading/writing

const fs = require('fs').promises;
const { elementInArray, pushToLimitedQueue } = require('./utilFunctions');

// Template of a basic set of server data
const blankServerData = {
    wordCounts: {},
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
        random: []
    },
    homeChannel: null
};


// Function to save the server data. Takes a guild and data object as arguments
async function saveServerData(guild, data) 
{

    var filename = "data_" + guild.id + ".json";

    // Write to the file
    await fs.writeFile('./data/' + filename, JSON.stringify(data, null, 2), (err) => {
        if (err) {
            console.error("Error: ", err);
            return;
        }
    });

    console.log(`${filename} written successfully.`);

}// end saveServerData()


// Function that retrieves the server's savedata from its data_guildID.json file, if it exists. If not, one will be created.
async function loadServerData(guild)
{

    // Find the filename based on guildID
    var jsonData, data;
    var filename = "data_" + guild.id + ".json";

    // Read the file
    try {
        jsonData = await fs.readFile('./data/' + filename, 'utf-8');
        data = JSON.parse(jsonData);
    }catch (error) {
        if (error.code === 'ENOENT') {
            
            console.log(`File not found. Creating ${filename}...`);
            
            data = blankServerData;
            await saveServerData(guild, data);

            console.log(`${filename} created successfully.`);

        }else{
            console.log("Error caught: ", error);
        }
    }

    return data;

}// end loadServerData


// Function that resolves command name aliases to actual command names
async function resolveCommandAlias(commandAlias)
{
 
    // Read the data.json file and obtain the list of command aliases
    // A 'command alias' in this instance is just an alternate word or spelling that corresponds to an established command.
    // They are stored in the aliases.json file to be easily added, and to not over-complicate existing command files (e.g. adding multiple names)
    var data;

    try {
        const jsonData = await fs.readFile('./src/aliases.json');
        data = JSON.parse(jsonData).commandAlias;
    }catch (error) {
        console.log("Error reading file: ", error);
    }

    return data[commandAlias];

}// end resolveCommandAlias()


// Function to retrieve a random image path from a given directory
async function getRandomImagePath(folder, guild)
{

    const imagesDir = './images/';
    const cacheSize = 3;
    
    // Get the server data for the guild in which this was called. It will be used for saving the last few memes to prevent repeats 
    var serverData = await loadServerData(guild);

    // Get the 'lastMemes' arrays from serverData. If they don't exist, create them
    var lastMemes, randImage;
    if (!serverData.lastMemes || !serverData.lastMemes[folder]) {
        // The lastMemes 'cache' has not been created yet, so add that
        serverData.lastMemes = blankServerData.lastMemes;
    }
    lastMemes = serverData.lastMemes[folder];

    // Open the file and get an array of all the images
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


module.exports = {
    loadServerData,
    saveServerData,
    getRandomImagePath,
    resolveCommandAlias
};

