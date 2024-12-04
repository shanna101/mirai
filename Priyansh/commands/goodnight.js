const fs = require("fs");
module.exports.config = {
	name: "goodnight",
    version: "1.0.0",
	hasPermssion: 0,
	credits: "Ralph", 
	description: "no prefix",
	commandCategory: "No command marks needed",
	usages: "...",
    cooldowns: 1, 
};

module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
	var { threadID, messageID } = event;
	if (event.body.indexOf("goodnight")==0 || (event.body.indexOf("Goodnight")==0 || (event.body.indexOf("night")==0 || (event.body.indexOf("tulog")==0)))) {
		var msg = {
				body: "Hello Good Night Sleepwell.",
				attachment: fs.createReadStream(__dirname + `/noprefix/goodnight.gif`)
			}
			api.sendMessage(msg, threadID, messageID);
		}
	}
	module.exports.run = function({ api, event, client, __GLOBAL }) {

  }