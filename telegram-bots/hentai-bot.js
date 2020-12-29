const postingBase = require("./universalBot/postingBase");
const dotenv = require("dotenv");

dotenv.config();

const config = {
  channelName: "hentai",
  channelId: process.env.HENTAI_TG_CHANNEL,
  notificationChannelId: process.env.NOTIFICATION_CHANNEL,
  botToken: process.env.HENTAI_BOT_TOKEN,
  postingDelayMin: 5,
  postLimit: 50,
  snoowrapClientId: process.env.HENTAI_SNOOWRAP_CLIENT_ID,
  snoowrapSecret: process.env.HENTAI_SNOOWRAP_CLIENT_SECRET,
  snoowrapToken: process.env.HENTAI_SNOOWRAP_REFRESH_TOKEN,
  //Has the post description and linkpost description and link
  hasLink: false,
  hasText: true,
  //For video channels
  videoOnly: false,
  nodeEnv: process.env.NODE_ENV,
}

const startHentaiBot = () => {
  postingBase.postBase(config);
};

module.exports.startHentaiBot = startHentaiBot;
