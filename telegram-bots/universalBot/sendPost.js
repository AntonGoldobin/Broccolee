const { downloadFile, removeFile, checkFileSize } = require('./utils')
const { getRedgifsVideo } = require('./gettingRedgifsVideo')
const channelsData = require('../bots/channelsInfo')
const path = require('path')
const translate = require('@iamtraction/google-translate')
const { default: axios } = require('axios')
const _ = require('lodash')
const { saveUniquePostsIds } = require('../../db/models/savePostId')
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
const ffmpeg = require('fluent-ffmpeg')
var ffprobe = require('ffprobe-static')

const sendPost = (post, config, ctx) => {
	// Save url to DB for checking in future and ignoring to posting
	saveUniquePostsIds(post, config.channelName)

	// Create description for the post

	const link = config.hasLink ? `\n[link](https://www.reddit.com/${post.permalink})` : ''
	const postTitle = _.get(post, 'title') ? post.title : ''
	const inviteLink = config.hasInviteLink
		? `\n${channelsData.find((chanInfo) => chanInfo.name === config.channelName).linkMarkdown}`
		: ''
	const text = config.hasText ? postTitle + link + inviteLink : ''

	const sendVideo = () => {
		if (post.url.includes('redgifs')) {
			postAdultVideo(post, ctx, text, config.channelId)
		} else if (post.url.includes('v.redd.it')) {
			postVideo(post, ctx, text, config.channelId)
		}
	}

	// POSTING FOR CHANNELS WITH VIDEOS ONLY
	if (config.type === 'videoOnly') {
		sendVideo()
	} else if (config.type === 'text') {
		// POSTING TEXT POSTS

		const sluttyStoriesLink = `\n${channelsData.find((chanInfo) => chanInfo.name === 'slutty-stories').linkMarkdown}`
		// Translate title and then post description
		if (config.translate) {
			translate(post.title, { to: 'ru' })
				.then((resTitle) => {
					translate(post.selftext, { to: 'ru' })
						.then((resDesc) => {
							textStory = `*${resTitle.text}* \n\n ${resDesc.text} \n\n Author - #${post.author
								.name} \n\n${inviteLink} \n\n Переведено из ${sluttyStoriesLink}`

							if (textStory.length < 4096 && textStory.length > 500) {
								ctx.telegram.sendMessage(config.channelId, textStory, {
									caption: text,
									parse_mode: 'Markdown',
								})
							}
						})
						.catch((err) => console.log(err))
				})
				.catch((err) => console.log(err))
		} else {
			textStory = `*${post.title}* \n\n ${post.selftext} \n\n Author - #${post.author.name} \n\n${inviteLink}`

			if (textStory.length < 4096 && textStory.length > 500) {
				ctx.telegram.sendMessage(config.channelId, textStory, {
					caption: text,
					parse_mode: 'Markdown',
				})
			}
		}
	} else {
		// POSTING FOR CHANNELS WITH GIF AND IMG TYPES
		if (post.url.includes('redgifs') || post.url.includes('.gifv')) {
			sendVideo()
		} else {
			ctx.telegram.sendPhoto(config.channelId, post.url, {
				caption: text,
				parse_mode: 'Markdown',
			})
		}
	}
}

const postVideo = (post, ctx, text, channelId) => {

	const videoNames = getVideoNames(post)

	getRedditVideoAndMerge(videoNames.videoId).then(() => {
		if (checkFileSize(videoNames.filePath, 15)) {
			ctx.telegram.sendVideo(
				channelId,
				{
					source: videoNames.downloadedFilePath,
				},
				{
					caption: `${text}`,
					parse_mode: 'Markdown',
				},
			)
		}
		removeFile(videoNames.filePath)
	}).catch(err => console.log(err))
}

const getRedditVideoAndMerge = (videoId) => {
	return new Promise((res, rej) => {
		ffmpeg(`https://v.redd.it/${videoId}/DASH_720.mp4`)
			.setFfprobePath(ffprobe.path)
			.setFfmpegPath(ffmpegPath)
			.videoCodec('libx264')
			.addInput(`https://v.redd.it/${videoId}/DASH_audio.mp4`)
			.on('error', function(err) {
				rej('An error occurred: ' + err.message)
			})
			.on('end', function() {
				res(console.log('Merging finished !'))
			})
			.save(`./telegram-bots/downloaded-files/${videoId}.mp4`)
	})
}

const postAdultVideo = (post, ctx, text, channelId) => {
	const url = post.url_overridden_by_dest
	// Parsing web-page with video for getting video-url
	getRedgifsVideo(url)
		.then((redgifsUrl) => {
			if (!redgifsUrl) return

			// Variables for downloading video
			const videoNames = getVideoNames(post)
			downloadFile(redgifsUrl, videoNames.filePath, () => {
				// Skip, if size bigger than limit (mB)
				if (checkFileSize(videoNames.filePath, 15)) {
					ctx.telegram.sendVideo(
						channelId,
						{
							source: videoNames.downloadedFilePath,
						},
						{
							caption: `${text}`,
							parse_mode: 'Markdown',
						},
					)
				}
				removeFile(videoNames.filePath)
			})
		})
		.catch(console.log)
}

const getVideoNames = (post) => {
	const splitedVideoUrl = post.url.split('/')
	const videoId = splitedVideoUrl[splitedVideoUrl.length - 1]

	const fileName = `${videoId}.mp4`
	const filePath = `./telegram-bots/downloaded-files/${fileName}`
	const downloadedFilePath = path.join(__dirname, '../downloaded-files/', fileName)

	return {
		videoId: videoId,
		filePath: filePath,
		downloadedFilePath: downloadedFilePath,
	}
}

module.exports.sendPost = sendPost
module.exports.postVideo = postVideo
module.exports.postAdultVideo = postAdultVideo
