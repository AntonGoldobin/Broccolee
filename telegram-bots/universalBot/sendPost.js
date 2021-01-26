const { downloadFile, getFileExtension, removeFile, checkFileSize } = require("./utils");
const { getRedgifsVideo } = require("./gettingRedgifsVideo");
const channelsData = require("../bots/channelsInfo");
const path = require("path");

const sendPost = (post, config, ctx) => {
	// Create description for the post

	const link = config.hasLink ? `\n[link](https://www.reddit.com/${post.permalink})` : "";
	const postTitle = post.title ? post.title : "";
	const inviteLink = `\n${channelsData.find((chanInfo) => chanInfo.name === config.channelName).linkMarkdown}`;
	const text = config.hasText ? postTitle + link + inviteLink : "";

	// POSTING FOR CHANNELS WITH VIDEOS ONLY
	if (config.type === "videoOnly") {
		const url = post.url_overridden_by_dest;

		// Parsing web-page with video for getting video-url
		getRedgifsVideo(url)
			.then((redgifsUrl) => {
				if (!redgifsUrl) return;

				// Variables for downloading video
				const fileName = `${config.channelName + Date.now()}.${getFileExtension(redgifsUrl)}`;
				const filePath = `./telegram-bots/downloaded-files/${fileName}`;
				const downloadedFilePath = path.join(__dirname, "../downloaded-files/", fileName);

				downloadFile(redgifsUrl, filePath, () => {
					// Skip, if size bigger than limit (mB)
					if (checkFileSize(filePath, 20)) {
						ctx.telegram.sendVideo(config.channelId, {
							source: downloadedFilePath,
							caption: text,
							parse_mode: "Markdown",
						});
					}

					removeFile(filePath);
				});
			})
			.catch(console.log);
	} else if (config.type === "text") {
		// POSTING TEXT POSTS
		const textStory = `*${post.title}* \n\n ${post.selftext} \n\n Author - #${post.author.name} ${inviteLink}`;

		if (textStory.length < 4096) {
			ctx.telegram.sendMessage(config.channelId, textStory, {
				caption: text,
				parse_mode: "Markdown",
			});
		}
	} else {
		// POSTING FOR CHANNELS WITH GIF AND IMG TYPES
		if (post.url.includes("redgifs") || post.url.includes(".gifv")) {
			ctx.telegram.sendVideo(config.channelId, post.preview.reddit_video_preview.fallback_url, {
				caption: text,
				parse_mode: "Markdown",
			});
		} else {
			ctx.telegram.sendPhoto(config.channelId, post.url, {
				caption: text,
				parse_mode: "Markdown",
			});
		}
	}
};

module.exports.sendPost = sendPost;
