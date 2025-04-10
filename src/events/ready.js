// ready.js
// Author: Jeremiah Stillman
// Date: 04/07/25

// This file defines the 'ready' event for the bot, basically just the initial setup when logged in

const fs = require('fs').promises;
const { ActivityType } = require('discord.js');
const { resolveCommandAlias, loadServerData } = require('../fileFunctions');
const { sendImageToChannel } = require('../utilFunctions');
const { channel } = require('diagnostics_channel');

module.exports = {

    name: 'ready',
    async execute (client) {

        client.user.setActivity({
            name: "!help for more info",
            type: ActivityType.Custom,
        });

        // TODO create a schedule using node-cron to send daily memes (probably better/cleaner than using a timer and checking the date/time each minute)

        console.log(`${client.user.username} is online!`);

    }// end execute()

};