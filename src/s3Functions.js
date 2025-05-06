// s3Functions.js
// Author: Jeremiah Stillman
// Date: 04/16/25
// This file defines functionality for retrieving S3 objects

// Environment variable imports
require('dotenv').config();

// Discord imports
const { AttachmentBuilder } = require('discord.js');

// AWS imports
const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const { Readable } = require('stream');               
const s3 = new S3Client({ region: process.env.AWS_REGION || 'us-east-1' });                     


// Helper function to convert a stream to a buffer (this is for building media attachments) 
const streamToBuffer = (stream) => 
    new Promise((resolve, reject) => {

        const chunks = [];

        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);

    });
// end streamToBuffer()


// Function to save a JSON object to the given S3 bucket as key
// bucket = name of s3 bucket
// key = path within the bucket to save JSON to
// data = JSON object to save
async function saveJSONS3(bucket, key, data)
{

    const body = JSON.stringify(data);

    // Create the PUT command to send to s3
    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        Body: body,
        ContentType: 'application/json'
    });

    // Attempt to send the command
    try {
        await s3.send(command);
        console.log(`Uploaded ${key} to ${bucket}`);
    }catch (error) {
        console.error('Error uploading JSON to S3:', error);
    }

}// end saveJSONS3()


// Function to fetch a JSON object from the given S3 bucket + key
// bucket = name of s3 bucket
// key = path within the bucket of requested JSON
// If the key is not found, return nothing (for data_guildID.jsons, those file functions will go from there)
async function fetchJSONS3(bucket, key)
{

    // Create the GET command 
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
    });
    
    // Attempt to send the command and return the result as a JSON object
    try {

        const data = await s3.send(command);
        const jsonStr = await data.Body.transformToString();
        return JSON.parse(jsonStr);

    }catch (error) {

        if (error.name === 'NoSuchKey') {
            console.log(`Key ${key} does not exist in ${bucket}.`);
            return null;
        }else{
            console.error('Error fetching from S3:', error);
            throw error;
        }

    }

}// end fetchJSONS3()


// Function to obtain a discord attachment from the given S3 bucket + key
// bucket = name of s3 bucket
// key = path within the bucket of the requested image
// name = the filename you wish the attachment to have. leave out the extension
async function getAttachmentFromS3(bucket, key, name = 'attachment')
{

    // Build the filename of the object being requested by obtaining its type extension and name parameter
    // By default the filename will be attachment.[type] where type is the same as the object in the bucket
    // But if name is specified then it will be [name].[type] e.g. cat.jpg instead of attachment.jpg
    const keyTokens = key.split('.');
    const extension = keyTokens[keyTokens.length - 1];
    const filename = name + '.' + extension;

    // Create and send the command to get the object stream
    const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key
    });
    const response = await s3.send(command);

    // Convert the stream to a buffer and return it to be sent
    const buffer = await streamToBuffer(response.Body);
    const attachment = new AttachmentBuilder(buffer, { name: filename });

    return attachment;

}// end getAttachmentFromS3()


// Function to obtain a list of all the object names in an S3 folder
// folder = images/folder/                         split('/') =       [ images, folder ]
// 1. images/folder/image.jpg                      split('/') =       [ images, folder, image.jpg ]
// 2. images/folder/otherfolder/otherimage.png     split('/') =       [ images, folder, otherfolder, otherimage.png ]
async function getObjectKeys(bucket, prefix = null)
{

    const keys = [];
    var continuationToken;

    // Future-proof do-while for when there are 1000+ objects in the bucket. ListObjectsV2 only lists the first 1000 in a bucket,
    // and the continuationToken returned is necessary to read further.
    do {

        // Create and send command to list all object metadata
        const command = new ListObjectsV2Command({
            Bucket: bucket,
            ContinuationToken: continuationToken
        });
        const response = await s3.send(command);

        // Filter metadata to just the names, then append to result
        const newKeys = response.Contents?.map(obj => obj.Key) || [];                           // only uses .map() if response.Contents is defined, otherwise newKeys = []
        keys.push(...newKeys);                                                                  // ...newKeys means it appends each individual element of newKeys, rather than a whole array
        continuationToken = response.IsTruncated ? response.NextContinuationToken : undefined;  // set continuationToken only if it exists in the response

    }while ( continuationToken );

    // Filter the keys if a prefix was specified, otherwise return the raw results
    if (prefix) {

        // Clean the prefix to have a slash at the end if there wasn't one already
        if (!prefix.endsWith('/')) { prefix = prefix + '/'; }

        const filteredKeys = keys.filter(key => (key.startsWith(prefix) && key != prefix));     // Here I've filtered out the folder key itself because that's basically a given and not important
        return filteredKeys;
    }
    
    return keys;
    
}// end getObjectKeys()


module.exports = {
    saveJSONS3,
    fetchJSONS3,
    getAttachmentFromS3,
    getObjectKeys
};

