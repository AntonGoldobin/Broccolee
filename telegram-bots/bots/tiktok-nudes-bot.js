const postingBase = require("../universalBot/postingBase");
const dotenv = require("dotenv");

dotenv.config();

const config = {
	channelName: "tiktok-nudes",
	channelId: process.env.TIKTOK_NUDES_TG_CHANNEL,
	notificationChannelId: process.env.NOTIFICATION_CHANNEL,
	botToken: process.env.TIKTOK_NUDES_BOT_TOKEN,
	postingMin: "56 * * * *",
	postLimit: 50,
	//How many posts every postingMin
	postsCount: 2,
	snoowrapClientId: process.env.TIKTOK_NUDES_SNOOWRAP_CLIENT_ID,
	snoowrapSecret: process.env.TIKTOK_NUDES_SNOOWRAP_CLIENT_SECRET,
	snoowrapToken: process.env.TIKTOK_NUDES_SNOOWRAP_REFRESH_TOKEN,
	//Has the post description and linkpost description and link
	hasLink: false,
	hasText: true,
	translate: false,
	//For video channels
	type: "videoOnly",
	nodeEnv: process.env.NODE_ENV,
	//ADS schedule config
	adsJobConfig: "0 14 * * *",
	isAdult: true,
};

const startTikTokNudesBot = () => {
	postingBase.postBase(config);
};

module.exports.startTikTokNudesBot = startTikTokNudesBot;
