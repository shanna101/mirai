module.exports.config = {
	name: "rankup",
	version: "1.0.1",
	hasPermssion: 1,
	credits: "Mirai Team",
	description: "tell the reached rank of the user",
	commandCategory: "Edit-IMG",
  cooldowns: 0,
	dependencies: {
		"fs-extra": ""
	},	
};

module.exports.handleEvent = async function({ api, event, Currencies, Users, getText }) {
	var {threadID, senderID } = event;
	const { createReadStream, existsSync, mkdirSync } = global.nodemodule["fs-extra"];

	threadID = String(threadID);
	senderID = String(senderID);

	const thread = global.data.threadData.get(threadID) || {};

	let exp = (await Currencies.getData(senderID)).exp;
	exp = exp += 1;

	if (isNaN(exp)) return;

	if (typeof thread["rankup"] != "undefined" && thread["rankup"] == false) {
		await Currencies.setData(senderID, { exp });
		return;
	};

	const curLevel = Math.floor((Math.sqrt(1 + (4 * exp / 3) + 1) / 2));
	const level = Math.floor((Math.sqrt(1 + (4 * (exp + 1) / 3) + 1) / 2));

	if (level > curLevel && level != 1) {
		const name = global.data.userName.get(senderID) || await Users.getNameUser(senderID);
		var messsage = (typeof thread.customRankup == "undefined") ? msg = getText("levelup") : msg = thread.customRankup,
			arrayContent;

		messsage = messsage
			.replace(/\{name}/g, name)
			.replace(/\{level}/g, level);
let random = Math.floor(Math.random() * 7) + 1;
			
		if (existsSync(__dirname + "/noprefix/rankup/")) mkdirSync(__dirname + "/noprefix/rankup/", { recursive: true });
		if (existsSync(__dirname + `/noprefix/rankup/rankup.gif`)) arrayContent = { body: messsage, attachment: createReadStream(__dirname + `/noprefix/rankup/rankup.gif`), mentions: [{ tag: name, id: senderID }] };
		else arrayContent = { body: messsage, mentions: [{ tag: name, id: senderID }] };
		const moduleName = this.config.name;
		api.sendMessage(arrayContent, threadID, async function (error, info){
			if (global.configModule[moduleName].autoUnsend) {
				await new Promise(resolve => setTimeout(resolve, global.configModule[moduleName].unsendMessageAfter * 1000));
				return api.unsendMessage(info.messageID);
			} else return;
		});
	}

	await Currencies.setData(senderID, { exp });
	return;
}

module.exports.languages = {
	"vi": {
		"off": "ð—§ð—®Ì†Ìð˜",
		"on": "ð—•ð—®Ì£Ì‚ð˜",
		"successText": "ð­ð¡ðšÌ€ð§ð¡ ðœð¨Ì‚ð§ð  ð­ð¡ð¨Ì‚ð§ð  ð›ðšÌð¨ ð«ðšð§ð¤ð®ð© âœ¨",
		"levelup": "ðŸŒ¸ ð—žð—¶Ìƒ ð—»ð—®Ì†ð—»ð—´ ð˜…ð—®Ì£ð—¼ ð—¹ð—¼Ì‚Ì€ð—»ð—» ð—¼Ì›Ì‰ ð—ºð—¼Ì‚ð—» ð—½ð—µð—®Ìð—½ ð—µð—®Ì‚Ìð—½ ð—±ð—¶ð—²Ì‚ð—º ð—°ð˜‚Ì‰ð—® {name} ð˜ƒð˜‚Ì›Ì€ð—® ð—¹ð—²Ì‚ð—» ð˜ð—¼Ì›Ìð—¶ ð—¹ð—²ð˜ƒð—²ð—¹ {level} ðŸŒ¸"
	},
	"en": {
		"on": "on",
		"off": "off",
		"successText": "success notification rankup!",
		"levelup": "『 {name} 』Congrats, your keyboard interaction has increase to level {level}",
	}
}

module.exports.run = async function({ api, event, Threads, getText }) {
	const { threadID, messageID } = event;
	let data = (await Threads.getData(threadID)).data;
	
	if (typeof data["rankup"] == "undefined" || data["rankup"] == false) data["rankup"] = true;
	else data["rankup"] = false;
	
	await Threads.setData(threadID, { data });
	global.data.threadData.set(threadID, data);
	return api.sendMessage(`${(data["rankup"] == true) ? getText("on") : getText("off")} ${getText("successText")}`, threadID, messageID);
}