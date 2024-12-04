module.exports.config = {
  name: "teach",
  version: "0.1.0",
  hasPermission: 0,
  credits: "Choru Tiktokers",
  description: "teach simsimi",
  usages: "hi | hello",
  commandCategory: "Chatbot",
  cooldowns: 5
};

module.exports.run = async ({ api, event, args }) => {
  const axios = global.nodemodule["axios"];
  let text = args.join(" ");
  const text1 = text.substr(0, text.indexOf(' | ')); 
  const length = parseInt(text1.length);
  const text2 = text.split(" | ").pop();
  const length_2 = parseInt(text2.length);
  const res = await axios.get(`https://funsimsimiasking.nextgen0.repl.co/api/teach?text1=${text1}&text2=${text2}`);
  return api.sendMessage(`Your ask: ${text1}\nSim respond: ${text2}`, event.threadID, event.messageID);
};