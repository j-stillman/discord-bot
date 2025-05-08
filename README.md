# discord-bot

This is a simple (for now) Discord bot, intended to add character to smaller servers. I started by following a YouTube tutorial but drifted off from it once the basics were covered and I felt more inclined to experiment. 

The bot's main functions are sending memes and counting instances of user-defined words. These features are somewhat barebones but they do offer a degree of customization so as to minimize annoyance (e.g. users may toggle whether or not they want daily memes to be sent). I intend to enable further customization but right now I am looking into integrating cloud services like Amazon S3 and DynamoDB for meme storage and server data respectively. 

As of May 6th, 2025, all of the memes are stored and sent via Amazon S3. My next goal will be hosting the bot on Amazon EC2, which will speed up S3 accesses.

Configuration data for servers are also stored in the S3 bucket, which I soon realized is not an efficient solution, runtime-wise or cost-wise. Since json files are frequently accessed (about once per message), there are a great number of S3 GET calls, which can quickly drive up costs, assuming the bot was in many large servers. Thus, once the migration to EC2 is complete, I will add an EBS volume to store the server data, which will be much faster and cheaper. DynamoDB will probably be the next step, which will enhace data-storage capabilities and allow for more complex features to be built smoothly.

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

In addition, the bot has several slash commands (Discord's built-in bot commands) which server admins may use to customize how the bot behaves in their server.
* /info - info about the bot
* /add - adds two numbers
* /addwordcounter - creates a user-defined word counter (can have up to 10)
* /removewordcounter - removes a user-specified word counter (if it exists)
* /enablecounterdings - toggles whether the bot announces each instance of a specified word being said
* /sethomechannel - sets the channel where the bot sends good morning/good night memes, such as #general or some equivalent where most users will see it
* /enablegoodmornings - toggles whether the bot will send a good morning meme
* /enablegoodnights - toggles whether the bot will send a good night meme
* /settimezone - sets the timezone of the server so good morning/good night memes are sent at the right time for the majority of users
