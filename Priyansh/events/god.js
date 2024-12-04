module.exports.config = {
  name: "god",
  eventType: ["log:unsubscribe", "log:subscribe", "log:thread-name", "log:message-reaction", "log:message", "log:member-moderation", "log:user-mention", "log:message-edited"],
  version: "2.0.0", // updated version
  credits: "𝙋𝙧𝙞𝙮𝙖𝙣𝙨𝙝 𝙍𝙖𝙟𝙥𝙪𝙩",
  description: "Record bot activity notifications with more features!",
  envConfig: {
      enable: true
  }
};

module.exports.run = async function ({ api, event, Threads }) {
  const logger = require("../../utils/log");
  if (!global.configModule[this.config.name].enable) return;

  const currentUserID = api.getCurrentUserID();
  const date = new Date();
  const timeStamp = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

  let formReport = "=== 🚨 **Bot Activity Notification** 🚨 ===" +
      "\n\n» **Thread ID**: " + event.threadID +
      "\n» **Action**: {task}" +
      "\n» **Action performed by**: " +
      "\n  ➤ **User ID**: " + event.author +
      "\n  ➤ **User Name**: " + (await api.getUserInfo(event.author))[event.author]?.name || "Unknown User" +
      "\n  ➤ **User FB Profile**: " + `https://facebook.com/${event.author}` +
      "\n» **Action Time**: " + timeStamp +
      "\n» **Action performed by bot**: " + (event.author == currentUserID ? "Yes" : "No") +
      "\n\n----------------------------",
      task = "";

  switch (event.logMessageType) {
      case "log:thread-name": {
          const oldName = (await Threads.getData(event.threadID)).name || "No Name",
              newName = event.logMessageData.name || "No Name";
          task = `📝 **Group Name Change**: From: '${oldName}' to: '${newName}'`;
          await Threads.setData(event.threadID, { name: newName });
          break;
      }
      case "log:subscribe": {
          if (event.logMessageData.addedParticipants.some(i => i.userFbId == currentUserID)) {
              task = "🤖 **Bot Added to Group**: The bot has been added to a new group!";
          }
          break;
      }
      case "log:unsubscribe": {
          if (event.logMessageData.leftParticipantFbId == currentUserID) {
              task = "❌ **Bot Removed from Group**: The bot was removed from the group!";
          }
          break;
      }
      case "log:message-reaction": {
          task = `👍 **Message Reacted**: A user reacted to a message with '${event.reactionData.reaction}' in the group.`;
          break;
      }
      case "log:message": {
          task = `💬 **Message Sent**: A message was sent by user ${event.author} in the group.`;
          break;
      }
      case "log:member-moderation": {
          task = `🚨 **Member Moderation**: User ${event.author} was moderated. Action: ${event.logMessageData.action}.`;
          break;
      }
      case "log:user-mention": {
          task = `📢 **User Mentioned**: User ${event.author} mentioned a user in the group.`;
          break;
      }
      case "log:message-edited": {
          task = `✏️ **Message Edited**: User ${event.author} edited a message in the group.`;
          break;
      }
      default:
          break;
  }

  if (task.length == 0) return;

  formReport = formReport.replace(/\{task}/g, task);

  // Replace 'god' with the new thread ID you provided
  const god = "7729634530417299";

  return api.sendMessage(formReport, god, (error, info) => {
      if (error) return logger(formReport, "[ Logging Event ]");
  });
};