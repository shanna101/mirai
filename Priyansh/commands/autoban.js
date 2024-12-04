const axios = require("axios");
const fs = require("fs");
const { createCanvas, loadImage } = require("canvas");

module.exports.config = {
  name: "autoban",
  version: "1.0.1",
  hasPermission: 0,
  credits: "August Quinn",
  description: "Automatically bans users when certain sensitive keywords are detected in the message.",
  commandCategory: "General",
  cooldowns: 1
};

module.exports.run = async ({ event, args, api }) => {
  if (args[0] === "unban") {
    const userID = args[1];

    if (userID) {
      if (global.data.userBanned.delete(userID)) {
        saveBannedUsers();
        api.sendMessage(`✅ User with ID (${userID}) has been unbanned successfully.`, event.threadID, event.messageID);
      } else {
        api.sendMessage(`User with ID (${userID}) is not banned.`, event.threadID, event.messageID);
      }
    } else {
      api.sendMessage("Please provide a user ID to unban.", event.threadID, event.messageID);
    }
  }
};

module.exports.handleEvent = async ({ event, api }) => {
  const message = event.body.toLowerCase();
  const senderID = event.senderID;

  if (global.data.userBanned.has(senderID)) {
    return;
  }

  const sensitiveKeywords = ["bobo bot", "pangit ng bot", "tanginamong bot ka", "pakyu", "gagong bot", "tangang bot", "panget ng bot", "tanginang bot"];

  for (const keyword of sensitiveKeywords) {
    if (message.includes(keyword)) {
      if (!global.data.userBanned.has(senderID)) {
        global.data.userBanned.set(senderID, Date.now());
        saveBannedUsers();
        api.sendTypingIndicator(event.threadID);

        try {
          const userInfo = await api.getUserInfo([senderID]);
          const userName = userInfo[senderID].name;

          const userAvatarUrl = `https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

          const response = await axios.get(userAvatarUrl, { responseType: "arraybuffer" });
          fs.writeFileSync(__dirname + "/cache/avt.png", Buffer.from(response.data, "utf-8"));

          const img = await loadImage(__dirname + "/cache/avt.png");
          const canvas = createCanvas(img.width, img.height);
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          ctx.font = "bold 100px Arial";
          ctx.fillStyle = "red";
          ctx.textAlign = "center";
          ctx.fillText("BANNED", canvas.width / 2, canvas.height / 2);

          const outputStream = fs.createWriteStream(__dirname + "/cache/banned_avt.png");
          canvas.createPNGStream().pipe(outputStream);
          outputStream.on("finish", () => {
            const banMessage = `⛔️ 𝗕𝗔𝗡𝗡𝗘𝗗!\n\n${userName}, you have been automatically banned for using inappropriate language or threatening other users.\nYou are banned for 10mins\n\n  ⦿ 𝗨𝗦𝗘𝗥: ${userName}\n  ⦿ 𝗜𝗗: ${senderID}\n  ⦿ 𝗞𝗘𝗬𝗪𝗢𝗥𝗗: ${keyword}`;
            api.sendMessage({ body: banMessage, attachment: fs.createReadStream(__dirname + "/cache/banned_avt.png") }, event.threadID, event.messageID);

            // Pakilagay nalang ng Id mo sa baba
            const ownerID = "ID";
            const ownerMessage = `⚠️ ${userName} has been automatically banned for using inappropriate language or threatening other users.\n\n𝗨𝗦𝗘𝗥 𝗜𝗗: ${senderID}`
            api.sendMessage(ownerMessage, ownerID);
          });
        } catch (error) {
          console.error(error);
        }
      }

      break;
    }
  }
};

module.exports.listenGlobal = true;

function saveBannedUsers() {
  const bannedUsers = Array.from(global.data.userBanned.keys());
  fs.writeFileSync(__dirname + "/cache/banned_users.json", JSON.stringify(bannedUsers));
}

function loadBannedUsers() {
  try {
    const bannedUsers = JSON.parse(fs.readFileSync(__dirname + "/cache/banned_users.json"));
    bannedUsers.forEach(userID => global.data.userBanned.set(userID, Date.now()));
  } catch (error) {
    console.error("Error loading banned users:", error);
  }
}

loadBannedUsers();
setInterval(saveBannedUsers, 600000);