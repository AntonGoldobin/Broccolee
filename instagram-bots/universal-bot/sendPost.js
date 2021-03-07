const { downloadFile, removeFile, checkFileSize } = require("./utils");
const path = require("path");
const { default: axios } = require("axios");
const _ = require("lodash");
const { saveUniquePostsIds } = require("../../db/models/savePostId");
const { readFile } = require("fs");
const { promisify } = require("util");
const readFileAsync = promisify(readFile);

const sendPost = (post, config, ig) => {
	// Save url to DB for checking in future and ignoring to posting
	saveUniquePostsIds(post, config.channelName);

	// POSTING FOR CHANNELS WITH VIDEOS ONLY
	if (config.type === "videoOnly") {
		if (post.url.includes("v.redd.it")) {
			downloadVideo(post, ig);
		}
	}
};

const downloadVideo = (post, ig) => {
	const videoNames = getVideoNames(post);

	axios
		.get("https://vred.rip/api/vreddit/" + videoNames.videoId)
		.then((res) => {
			downloadFile(res.data.source, videoNames.filePath, () => {
				// Skip, if size bigger than limit (mB)
				if (checkFileSize(videoNames.filePath, 15)) {
					postVideo(ig, videoNames.downloadedFilePath);
				}
				// _.delay(removeFile, 2000, videoNames.filePath);
				// removeFile(videoNames.filePath);
			});
		})
		.catch((err) => console.log(config.channelName + " IG Vreddit Video Error: " + err.response.data));
};

const postVideo = async (ig, url) => {
	await ig.publish
		.story({
			video: await readFileAsync(url),
			coverImage: await readFileAsync("./instagram-bots/downloaded-files/test.jpg"),
		})
		.catch((err) => console.log("IG publish story: " + err));
};

const getVideoNames = (post) => {
	const splitedVideoUrl = post.url.split("/");
	const videoId = splitedVideoUrl[splitedVideoUrl.length - 1];

	const fileName = `${videoId}.mp4`;
	const filePath = `./instagram-bots/downloaded-files/${fileName}`;
	const downloadedFilePath = path.join(__dirname, "../downloaded-files/", fileName);

	return {
		videoId: videoId,
		filePath: filePath,
		downloadedFilePath: downloadedFilePath,
	};
};

module.exports.sendPost = sendPost;
module.exports.postVideo = postVideo;
