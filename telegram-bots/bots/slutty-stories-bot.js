const postingBase = require("../universalBot/postingBase");
const dotenv = require("dotenv");

dotenv.config();

const config = {
	channelName: "slutty-stories",
	channelId: process.env.SLUTTY_STORIES_TG_CHANNEL,
	notificationChannelId: process.env.NOTIFICATION_CHANNEL,
	botToken: process.env.SLUTTY_STORIES_BOT_TOKEN,
	postingMin: "10 * * * *",
	postLimit: 15,
	//How many posts every postingMin
	postsCount: 1,
	snoowrapClientId: process.env.SLUTTY_STORIES_SNOOWRAP_CLIENT_ID,
	snoowrapSecret: process.env.SLUTTY_STORIES_SNOOWRAP_CLIENT_SECRET,
	snoowrapToken: process.env.SLUTTY_STORIES_SNOOWRAP_REFRESH_TOKEN,
	//Has the post description and linkpost description and link
	hasLink: true,
	hasText: true,
	translate: false,
	//For video channels
	type: "text",
	nodeEnv: process.env.NODE_ENV,
	//ADS schedule config
	adsJobConfig: "0 9 * * *",
	isAdult: true,
};

const startSluttyStoriesBot = () => {
	postingBase.postBase(config);
};

module.exports.startSluttyStoriesBot = startSluttyStoriesBot;
