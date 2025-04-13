# discord-bot

This is a simple (for now) Discord bot, intended to add character to smaller servers. I started by following a YouTube tutorial but drifted off from it once the basics were covered and I felt more inclined to experiment. 

The bot's main functions are to counting user-defined words and sending memes. These features are somewhat barebones but they do offer a degree of customization so as to minimize annoyance (e.g. users may toggle whether or not they want daily memes to be sent). I intend to enable further customization but right now I am looking into integrating cloud services like Amazon S3 and DynamoDB for meme storage and server data respectively. 

Right now, the bot draws its memes from the local machine and server data is stored in json files. This solution is not scalable and does not allow for user customization. After storage is made more scalable, I will probably add game-like features such as a points system for users, which will make the bot more engaging.

Also in consideration is a frontend in which users can view the bot's stats and submit content they want the bot to post.

Here is a list of available commands:
* !aesthetic - Sends a random aesthetic image/video.
* !counters - Displays counts for all active word counters in the server.
* !enjoyyourself - SAINT PEPSI - Enjoy Yourself 
* !help - Gives a list of available commands.
* !info - Some information about this bot. For more detailed info, type !info long.
* !ping - Replies with Pong!
* !random - Sends a random meme.
* !seenit - For when you've already seen that meme. Let em know with style.

In addition, the bot has several slash commands (Discord's built-in bot commands) which server admins may use to customize how the bot behaves.
* /info - info about the bot
* /add - adds two numbers
* /addwordcounter - creates a user-defined word counter (can have up to 10)
* /removewordcounter - removes a user-specified word counter (if it exists)
* /enablecounterdings - toggles whether the bot announces each instance of a specified word being said
* /sethomechannel - sets the channel where the bot sends good morning/good night memes
* /enablegoodmornings - toggles whether the bot will send a good morning meme
* /enablegoodnights - toggles whether the bot will send a good night meme
* /settimezone - sets the timezone of the server so good morning/good night memes are sent at the right times for the majority of users
