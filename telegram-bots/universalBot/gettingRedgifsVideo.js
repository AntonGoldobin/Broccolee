const Nightmare = require("nightmare");

// Some options I set for all instances
const nightmareOptions = {
	gotoTimeout: 10000,
	loadTimeout: 15000,
	waitTimeout: 20000,
};

const getRedgifsVideo = (url) => {
	return new Promise(function(resolve, reject) {
		let nightmare = Nightmare(nightmareOptions);

		nightmare
			.goto(url)
			.wait("video source:first-child")
			.evaluate(() => document.querySelector("video source:first-child").getAttribute("src"))
			.end()
			.then((url) => {
				nightmare = null;
				resolve(url);
			})
			.catch((error) => {
				console.error("Redgifs search failed:", error);
				nightmare = null;
				reject(error);
			});
	});
};

module.exports.getRedgifsVideo = getRedgifsVideo;
