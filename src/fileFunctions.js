// fileFunctions.js
// Author: Jeremiah Stillman
// Date: 04/07/25

// This file defines functionality for json reading/writing

const fs = require('fs').promises;

// Function that resolves command name aliases to actual command names
async function ResolveCommandAlias(commandAlias)
{
 
    // Read the data.json file and obtain the list of command aliases
    // A 'command alias' in this instance is just an alternate word or spelling that corresponds to an established command.
    // They are stored in the aliases.json file to be easily added, and to not over-complicate existing command files (e.g. adding multiple names)
    var data;

    try {
        const jsonData = await fs.readFile('./data/aliases.json');
        data = JSON.parse(jsonData).commandAlias;
    }catch (error) {
        console.log("Error reading file: ", error);
    }

    return data[commandAlias];

}// end ResolveCommandAlias()

module.exports = {
    ResolveCommandAlias
};

