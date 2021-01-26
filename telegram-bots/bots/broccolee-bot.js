const postingBase = require("../universalBot/postingBase");
const dotenv = require("dotenv");

dotenv.config();

const config = {
	channelName: "broccolee",
	channelId: process.env.BROCCOLEE_TG_CHANNEL,
	notificationChannelId: process.env.NOTIFICATION_CHANNEL,
	botToken: process.env.BROCCOLEE_BOT_TOKEN,
	postingMin: "55 * * * *",
	postLimit: 50,
	//How many posts every postingMin
	postsCount: 3,
	snoowrapClientId: process.env.BROCCOLEE_SNOOWRAP_CLIENT_ID,
	snoowrapSecret: process.env.BROCCOLEE_SNOOWRAP_CLIENT_SECRET,
	snoowrapToken: process.env.BROCCOLEE_SNOOWRAP_REFRESH_TOKEN,
	//Has the post description and linkpost description and link
	hasLink: true,
	hasText: true,
	//For video channels
	type: "videoOnly",
	nodeEnv: process.env.NODE_ENV,
	//ADS schedule config
	adsJobConfig: "0 9 * * *",
};

const startBroccoleeBot = () => {
	postingBase.postBase(config);
};

module.exports.startBroccoleeBot = startBroccoleeBot;
