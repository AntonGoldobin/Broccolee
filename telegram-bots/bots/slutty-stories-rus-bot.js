const postingBase = require("../universalBot/postingBase");
const dotenv = require("dotenv");

dotenv.config();

const config = {
	channelName: "slutty-stories-rus",
	channelId: process.env.SLUTTY_STORIES_RU_TG_CHANNEL,
	notificationChannelId: process.env.NOTIFICATION_CHANNEL,
	botToken: process.env.SLUTTY_STORIES_RU_BOT_TOKEN,
	postingMin: "*/2 * * * *",
	postLimit: 15,
	//How many posts every postingMin
	postsCount: 1,
	snoowrapClientId: process.env.SLUTTY_STORIES_RU_SNOOWRAP_CLIENT_ID,
	snoowrapSecret: process.env.SLUTTY_STORIES_RU_SNOOWRAP_CLIENT_SECRET,
	snoowrapToken: process.env.SLUTTY_STORIES_RU_SNOOWRAP_REFRESH_TOKEN,
	//Has the post description and linkpost description and link
	hasLink: true,
	hasText: true,
	translate: true,
	//For video channels
	type: "text",
	nodeEnv: process.env.NODE_ENV,
	//ADS schedule config
	adsJobConfig: "0 9 * * *",
};

const startSluttyStoriesRusBot = () => {
	postingBase.postBase(config);
};

module.exports.startSluttyStoriesRusBot = startSluttyStoriesRusBot;
