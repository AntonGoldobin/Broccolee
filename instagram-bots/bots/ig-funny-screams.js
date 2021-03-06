const postingBase = require("../universal-bot/igPostingBase");
const dotenv = require("dotenv");

dotenv.config();

const config = {
	channelName: "ig-funny-screams",
	igLogin: process.env.IG_FS_USERNAME,
	igPassword: process.env.IG_FS_PASSWORD,
	redditChannel: "perfectlycutscreams",
	postingMin: "*/2 * * *",
	postLimit: 10,
	translate: false,
	//For video channels
	type: "videoOnly",
	nodeEnv: process.env.NODE_ENV,
	//ADS schedule config
	adsJobConfig: "0 0 * * *",
};

const start = () => {
	postingBase.postBase(config);
};

module.exports.start = start;
