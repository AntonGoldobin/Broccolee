const Redgifs = require("redgifs");

const getRedgifsVideo = (pageUrl) => {
	const r = new Redgifs();
	return r.getRedgifsVideo(pageUrl);
};

module.exports.getRedgifsVideo = getRedgifsVideo;
