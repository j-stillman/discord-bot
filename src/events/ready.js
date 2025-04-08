// ready.js
// Author: Jeremiah Stillman
// Date: 04/07/25

// This file defines the 'ready' event for the bot, basically just the initial setup when logged in

const { ActivityType } = require('discord.js');
const { ReadJSON, ResolveCommandAlias } = require('../fileFunctions');

module.exports = {

    name: 'ready',
    async execute (client) {

        client.user.setActivity({
            name: "!help for more info",
            type: ActivityType.Custom,
        });

        console.log(`${client.user.username} is online!`);

    }// end execute()

};