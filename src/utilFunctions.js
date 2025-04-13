// utilFunctions.js
// Author: Jeremiah Stillman
// Date: 04/08/25

// This file specifies various helpful functions that will be used throughout this program

// Simple function to capitalize the first letter of a string
function capitalizeFirstLetter(word)
{

    // Set the first letter uppercase for message. Code found at: https://stackoverflow.com/a/1026087
    return word.charAt(0).toUpperCase() + word.slice(1);

}// end capitalizeFirstLetter()


// Function to choose a random element from a given array
function chooseRandom(arr)
{

    var len = arr.length;
    var index = Math.floor(len * Math.random());

    return arr[index];

}// end chooseRandom()


// Function to check if a value is in a given array
function elementInArray(value, arr)
{

    for (val of arr) {
        if (val == value) {
            return true;
        }
    }

    return false;

}// end elementInArray()

// Function to push a value into an array in the front, and removes the last value if the size exceeds the given value
function pushToLimitedQueue(queue, value, size)
{

    // Error checking on size argument
    if (size < 0) {
        console.error("pushToLimitedQueue(): size argument cannot be negative.");
        return;
    }

    // Insert value at the front using unshift()
    var result = queue;
    result.unshift(value);

    // Cut off the remaining values from the result if the length exceeds the given size
    if (result.length > size) {
        result = result.slice(0, size);
    }

    return result;

}// end pushToLimitedQueue()


// Just a test function
function jsonArgument(arg) 
{

    if (arg.a && arg.b) {
        console.log(arg.a + arg.b);
    }

    if (arg.c) {
        console.log(arg.c);
    }

}// end jsonArgument


// Function to send an image to a given channel, with an additional message included
async function sendImageToChannel(msgData)
{

    var channel, path, message, replyTo;

    // Ensure all the necessary arguments exist
    if (!msgData.channel || !msgData.path) {
        console.error("Error: sendImageToChannel(): destination channel and/or image path undefined.")
        return;
    }

    channel = msgData.channel;
    path = msgData.path;

    // Check for additional arguments
    message = "";
    if (msgData.message) {
        message = msgData.message;
    }

    replyTo = null;
    if (msgData.replyTo) {
        replyTo = msgData.replyTo;
    }

    // Now try and send the image. Make the message a reply if a replyTo message was designated
    try {
        if (!replyTo) {
            await channel.send({ content: message, files: [path] });
        }else{
            await replyTo.reply({ content: message, files: [path] });
        }
    }catch (error) {
        console.log("sendImageToChannel(): Error caught: ", error);
        return;
    }

}// end sendImageToChannel()


module.exports = {
    capitalizeFirstLetter,
    chooseRandom,
    elementInArray,
    pushToLimitedQueue,
    sendImageToChannel,
    jsonArgument
};