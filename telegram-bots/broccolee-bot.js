const postingBase = require("./universalBot/postingBase");
const dotenv = require("dotenv");

dotenv.config();

const config = {
  channelName: "broccolee",
  channelId: process.env.BROCCOLEE_TG_CHANNEL,
  notificationChannelId: process.env.NOTIFICATION_CHANNEL,
  botToken: process.env.BROCCOLEE_BOT_TOKEN,
  postingDelayMin: 15,
  postLimit: 100,
  snoowrapClientId: process.env.BROCCOLEE_SNOOWRAP_CLIENT_ID,
  snoowrapSecret: process.env.BROCCOLEE_SNOOWRAP_CLIENT_SECRET,
  snoowrapToken: process.env.BROCCOLEE_SNOOWRAP_REFRESH_TOKEN,
  //Has the post description and linkpost description and link
  hasLink: true,
  hasText: true,
  //For video channels
  videoOnly: false,
  nodeEnv: process.env.NODE_ENV,
}

const startBroccoleeBot = () => {
  postingBase.postBase(config);
};

module.exports.startBroccoleeBot = startBroccoleeBot;