// utilFunctions.js
// Author: Jeremiah Stillman
// Date: 04/08/25

const { AttachmentBuilder, Attachment } = require("discord.js");
const { getAttachmentFromS3 } = require("./s3Functions");

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


// Function to create a discord attachment from the requested local path
// path = relative local path of the requested image
// name = the filename you wish the attachment to have. leave out the extension
async function createMediaAttachment(path, name = 'attachment')
{

    // Build the filename of the object being requested by obtaining its type extension and name parameter
    // By default the filename will be attachment.[type] where type is the same as the object in the bucket
    // But if name is specified then it will be [name].[type] e.g. cat.jpg instead of attachment.jpg
    const pathTokens = path.split('.');
    const extension = pathTokens[pathTokens.length - 1];
    const filename = name + '.' + extension;

    // Create the attachment using this info
    try {
        
        const attachment = new AttachmentBuilder(path, { name: filename });
        return attachment;
    
    }catch (error) {
        console.log("crateMediaAttachment(): Error caught:", error);
        return null;
    }


}// end getAttachmentFromS3()


// Function to send an image to a given channel, with an additional message included
async function sendImageToChannel(msgData)
{

    var channel, path, s3Key, attachmentName, message, replyTo;

    channel = msgData.channel;
    path = msgData.path;
    s3Key = msgData.s3Key;

    var useS3 = false;

    // Ensure all the necessary arguments exist: channel
    if (!channel) {
        console.error("Error: sendImageToChannel(): destination channel undefined.")
        return;
    }

    // Ensure all the necessary arguments exist: image path OR S3 key
    if (!s3Key && !path) {
        console.error("Error: sendImageToChannel(): no local image path or S3 key defined.")
        return;
    }    

    // Defining a local image path will override the S3 Key since it's faster (generally you will choose one or the other though)
    if (s3Key && path) {
        useS3 = false;
    }else if (s3Key && !path) {
        useS3 = true;
    }else if (!s3Key && path) {
        useS3 = false; // I think this is redundant
    }

    // Check for additional arguments
    message = "";
    if (msgData.message) {
        message = msgData.message;
    }

    replyTo = null;
    if (msgData.replyTo) {
        replyTo = msgData.replyTo;
    }

    attachmentName = "attachment";
    if (msgData.attachmentName) {
        attachmentName = msgData.attachmentName;
    }

    // Create an attachment using either path or the S3 key
    var attachment;
    if (useS3) {
        attachment = await getAttachmentFromS3(process.env.BUCKET_NAME, s3Key, attachmentName);
    }else{
        attachment = await createMediaAttachment(path, attachmentName);
    }

    // Now try and send the image. Make the message a reply if a replyTo message was designated
    try {
        if (!replyTo) {
            await channel.send({ content: message, files: [attachment] });
        }else{
            await replyTo.reply({ content: message, files: [attachment] });
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