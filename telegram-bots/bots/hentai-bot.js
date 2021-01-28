const postingBase = require("../universalBot/postingBase");
const dotenv = require("dotenv");

dotenv.config();

const config = {
	channelName: "hentai",
	channelId: process.env.HENTAI_TG_CHANNEL,
	notificationChannelId: process.env.NOTIFICATION_CHANNEL,
	botToken: process.env.HENTAI_BOT_TOKEN,
	postingMin: "57 * * * *",
	postLimit: 50,
	//How many posts every postingMin
	postsCount: 3,
	snoowrapClientId: process.env.HENTAI_SNOOWRAP_CLIENT_ID,
	snoowrapSecret: process.env.HENTAI_SNOOWRAP_CLIENT_SECRET,
	snoowrapToken: process.env.HENTAI_SNOOWRAP_REFRESH_TOKEN,
	//Has the post description and linkpost description and link
	hasLink: false,
	hasText: true,
	translate: false,
	//For video channels
	type: "all",
	nodeEnv: process.env.NODE_ENV,
	//ADS schedule config
	adsJobConfig: "0 13 * * *",
};

const startHentaiBot = () => {
	postingBase.postBase(config);
};

module.exports.startHentaiBot = startHentaiBot;
