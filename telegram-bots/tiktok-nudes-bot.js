const postingBase = require("./universalBot/postingBase");
const dotenv = require("dotenv");

dotenv.config();

const config = {
	channelName: "tiktok-nudes",
	channelId: process.env.TIKTOK_NUDES_TG_CHANNEL,
	notificationChannelId: process.env.NOTIFICATION_CHANNEL,
	botToken: process.env.TIKTOK_NUDES_BOT_TOKEN,
	postingMin: 29,
	postLimit: 50,
	snoowrapClientId: process.env.TIKTOK_NUDES_SNOOWRAP_CLIENT_ID,
	snoowrapSecret: process.env.TIKTOK_NUDES_SNOOWRAP_CLIENT_SECRET,
	snoowrapToken: process.env.TIKTOK_NUDES_SNOOWRAP_REFRESH_TOKEN,
	//Has the post description and linkpost description and link
	hasLink: false,
	hasText: true,
	//For video channels
	videoOnly: true,
	nodeEnv: process.env.NODE_ENV,
	//ADS schedule config
	adsJobConfig: "0 8,14,20 * * *",
};

const startTikTokNudesBot = () => {
	postingBase.postBase(config);
};

module.exports.startTikTokNudesBot = startTikTokNudesBot;
