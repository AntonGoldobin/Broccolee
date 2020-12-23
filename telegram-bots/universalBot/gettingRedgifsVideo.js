const request = require("request"),
			cheerio = require("cheerio");

const getRedgifsVideo = (url) => {
	return new Promise(function(resolve, reject) {
		request(url, function (error, response, body) {
			if (!error) {
				const $ = cheerio.load(body);
				resolve($(".video source").first().attr('src'));
				
			} else {
				reject("Произошла ошибка: " + error);
			}
		});
	})
}

module.exports.getRedgifsVideo = getRedgifsVideo;