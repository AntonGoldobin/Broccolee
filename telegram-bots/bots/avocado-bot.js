const postingBase = require("../universalBot/postingBase");
const dotenv = require("dotenv");

dotenv.config();

const config = {
	channelName: "avocado",
	channelId: process.env.AVOCADO_TG_CHANNEL,
	notificationChannelId: process.env.NOTIFICATION_CHANNEL,
	botToken: process.env.AVOCADO_BOT_TOKEN,
	postingMin: "30 * * * *",
	postLimit: 30,
	//How many posts every postingMin
	postsCount: 2,
	snoowrapClientId: process.env.AVOCADO_SNOOWRAP_CLIENT_ID,
	snoowrapSecret: process.env.AVOCADO_SNOOWRAP_CLIENT_SECRET,
	snoowrapToken: process.env.AVOCADO_SNOOWRAP_REFRESH_TOKEN,
	//Has the post description and linkpost description and link
	hasLink: false,
	hasText: true,
	translate: false,
	//For video channels
	type: "videoOnly",
	nodeEnv: process.env.NODE_ENV,
	//ADS schedule config
	adsJobConfig: "0 12 * * *",
	isAdult: false,
};

const startAvocadoBot = () => {
	postingBase.postBase(config);
};

module.exports.startAvocadoBot = startAvocadoBot;
