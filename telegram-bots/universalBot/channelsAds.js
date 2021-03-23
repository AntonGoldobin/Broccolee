const cron = require("node-cron");
const _ = require("lodash");
const axios = require("axios");
const channelsData = require("../bots/channelsInfo");
const { postAdultVideo, postVideo } = require("./sendPost");

// CHANNELS THAT WILL NOT BE ADDED TO ADS
const exceptChannels = {
	// broccolee: "",
	// hentai: "",
};

let postingJob = null;

const startChannelAds = (config, ctx) => {
	const filteredChannelsData = channelsData.filter(
		(channel) => !exceptChannels.hasOwnProperty(channel.name) && channel.name !== config.channelName,
	);

	postingJob = cron.schedule(config.adsJobConfig, () => {
		const channel = _.sample(filteredChannelsData);

		axios.get(`https://reddit.com/r/${channel.channelForAds}/top.json?limit=1`).then((res) => {
			// data recieved from Reddit
			const data = res.data.data.children;
			postAds(data[0].data, ctx, config, channel);
		});
	});
};

const postAds = (post, ctx, config, channel) => {
	if (post.url.includes("redgifs") || post.url.includes(".gifv")) {
		postAdultVideo(post, ctx, channel.descriptionWithLink, config.channelId);
	} else if (post.url.includes("v.redd.it")) {
		postVideo(post, ctx, channel.descriptionWithLink, config.channelId);
	} else {
		ctx.telegram.sendPhoto(config.channelId, post.url, {
			caption: channel.descriptionWithLink,
			parse_mode: "Markdown",
		});
	}
};

const adsScheduleStart = () => {
	postingJob.start();
};

const adsScheduleStop = () => {
	postingJob.stop();
};

module.exports.startChannelAds = startChannelAds;
module.exports.adsScheduleStart = adsScheduleStart;
module.exports.adsScheduleStop = adsScheduleStop;
