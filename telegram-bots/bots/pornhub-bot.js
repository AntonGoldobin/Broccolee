const postingBase = require("../universalBot/postingBase");
const dotenv = require("dotenv");

dotenv.config();

const config = {
	channelName: "pornhub",
	channelId: process.env.PORNHUB_TG_CHANNEL,
	notificationChannelId: process.env.NOTIFICATION_CHANNEL,
	botToken: process.env.PORNHUB_BOT_TOKEN,
	postingMin: 58,
	postLimit: 50,
	//How many posts every postingMin
	postsCount: 2,
	snoowrapClientId: process.env.PORNHUB_SNOOWRAP_CLIENT_ID,
	snoowrapSecret: process.env.PORNHUB_SNOOWRAP_CLIENT_SECRET,
	snoowrapToken: process.env.PORNHUB_SNOOWRAP_REFRESH_TOKEN,
	//Has the post description and linkpost description and link
	hasLink: false,
	hasText: true,
	//For video channels
	videoOnly: true,
	nodeEnv: process.env.NODE_ENV,
	//ADS schedule config
	adsJobConfig: "0 6,13,19 * * *",
};

const startPornhubBot = () => {
	postingBase.postBase(config);
};

module.exports.startPornhubBot = startPornhubBot;
