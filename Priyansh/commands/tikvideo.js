const fs = require('fs-extra');
const axios = require('axios');

module.exports.config = {
  name: "tikvideo",
  version: "1.0.",
  hasPermission: 0,
  credits: "shiki",
  description: "TikTok Video Downloader",
  commandCategory: "other",
  usages: "tikdl video link",
  cooldowns: 2,
};

module.exports.run = async function ({ api, event, args }) {
  let link = args.join(" ");

  if (!link) {
    api.sendMessage("Please put a valid TikTok video link", event.threadID, event.messageID);
    return;
  }

  api.sendMessage("Downloading video, please wait...", event.threadID, event.messageID);

  try {
    let path = __dirname + `/cache/`;

    let res = await axios.get(`https://tiktokdl.hayih59124.repl.co/TikTokdl?url=${encodeURIComponent(link)}`);
    await fs.ensureDir(path);

    path += 'tiktok_video.mp4';

    const data = res.data.result.data;

    const vid = (await axios.get(data.play, { responseType: "arraybuffer" })).data;

    fs.writeFileSync(path, Buffer.from(vid, 'utf-8'));
//dont change credits or I'll of apis
    api.sendMessage({
      body: `==== downloaded ====\n━━━━━━━━━━━━━━━━━━\n→ Title: ${data.title}.\n→ Play Count: ${data.play_count}.\n→ Digg Count: ${data.digg_count}.\n→ Comment Count: ${data.comment_count}.\n→ Share Count: ${data.share_count}.\n→ Download Count: ${data.download_count}\n\n`, attachment: fs.createReadStream(path)
    }, event.threadID, () => fs.unlinkSync(path), event.messageID);

  } catch (e) {
    api.sendMessage(`${e}`, event.threadID, event.messageID);
  };
};