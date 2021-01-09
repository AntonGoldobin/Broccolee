const Telegraf = require("telegraf");
const cron = require("node-cron");
const { successfulConsoleLog, getCurrentTime, downloadFile, getFileExtension, removeFile } = require("./utils");
const { getRedgifsVideo } = require("./gettingRedgifsVideo");
const gettingPosts = require("./gettingPosts");
const path = require("path");
const { saveUniquePostsIds } = require("./../db/models/savePostId");
const { getPostsIds } = require("./../db/models/getPostsId");
const { removeAllPostsIds } = require("./../db/models/removeAllPostIds");
const _ = require("lodash");
const { startChannelAds, adsScheduleStart, adsScheduleStop } = require("./channelsAds");

const postBase = (config) => {
	// ****
	// JOB CONFIG
	// ****

	const postingJobConfig = `*/${config.postingDelayMin} * * * *`;

	let postingJob = null;

	// ****
	// STARTING/STOPING DAILY POSTING SCHEDULES
	// ****

	const startDailyPosting = cron.schedule("0 7 * * *", () => {
		postingJob.start();
		//starting ADS schedule
		adsScheduleStart();
	});

	const stopDailyPosting = cron.schedule("0 22 * * *", () => {
		postingJob.stop();
		//stoping ADS schedule
		adsScheduleStop();
	});

	// Starting at morning
	startDailyPosting.start();
	// Stoping at night
	stopDailyPosting.start();

	// ****
	// CREATING THE BOT AND CHECK COMMANDS
	// ****

	function startBot() {
		const bot = new Telegraf(config.botToken);

		// Clearing offline commands by bot (IMPORTANT)
		bot.use(async (ctx, next) => {
			if (_.get(ctx, "update.message.date") && ctx.update.message.date * 1000 < Date.now() - 5000) {
				return false;
			}
			await next();
		});

		// Create ADS schedule for current channel
		startChannelAds(config, bot);

		// Starting the first posting iteration
		startPosting(bot, "top");

		bot.command("best", (ctx) => {
			if (ctx.update.message.from.id == 273094621) {
				ctx.reply(`Очередь будет запущена через ${config.postingDelayMin} минут!`);

				destroyJobs();
				startPosting(ctx, "best");
			} else {
				ctx.reply("Я тебя не знаю, брат");
			}
		});

		bot.command("top", (ctx) => {
			if (ctx.update.message.from.id == 273094621) {
				ctx.reply(`Очередь будет запущена через ${config.postingDelayMin} минут!`);

				destroyJobs();
				startPosting(ctx, "top");
			} else {
				ctx.reply("Я тебя не знаю, брат");
			}
		});

		bot.command("pause", (ctx) => {
			if (ctx.update.message.from.id == 273094621) {
				if (postingJob) {
					ctx.reply("Остановлено!");
					postingJob.stop();
					//stoping ADS schedule
					adsScheduleStop();
				}
			} else {
				ctx.reply("Я тебя не знаю, брат");
			}
		});

		bot.command("start", (ctx) => {
			if (ctx.update.message.from.id == 273094621) {
				if (postingJob) {
					ctx.reply("Продолжаем!");
					postingJob.start();
					//starting ADS schedule
					adsScheduleStart();
				}
			} else {
				ctx.reply("Я тебя не знаю, брат");
			}
		});

		bot.command("destroy", (ctx) => {
			if (ctx.update.message.from.id == 273094621) {
				ctx.reply("Уничтожено!");
				destroyJobs();
			} else {
				ctx.reply("Я тебя не знаю, брат");
			}
		});

		bot.command("destroyDBsrsly", (ctx) => {
			if (ctx.update.message.from.id == 273094621) {
				removeAllPostsIds(config.channelName);
				ctx.reply(`База данных (${config.channelName}) подчищена! Надеюсь ты знаешь, что делаешь`);
			} else {
				ctx.reply("Я тебя не знаю, брат");
			}
		});

		bot.launch();
	}

	// ****
	// STARTING SCHEDULE
	// ****

	const startPosting = (ctx, type) => {
		destroyJobs();

		successfulConsoleLog("The schedule will be started soon: " + getCurrentTime());
		getRedditPosts(ctx, type);
	};

	// ****
	// GETTING DATA
	// ****

	const getRedditPosts = (ctx, type) => {
		gettingPosts
			.getPosts(type, config.snoowrapClientId, config.snoowrapSecret, config.snoowrapToken, config.postLimit)
			.then((posts) => deletingDublicates(posts, ctx, type));
	};

	// ****
	// DELETING DUBLICATES
	// ****

	const deletingDublicates = (newPosts, ctx, type) => {
		// Getting all post IDs from DB
		getPostsIds(config.channelName)
			.then((postsIdsBD) => {
				// Remove dublicates by IDs
				const uniqPosts = _.differenceWith(newPosts, postsIdsBD, (post, record) => post.url == record.url);
				return uniqPosts;
			})
			.then((uniqPosts) => {
				ctx.telegram.sendMessage(
					config.notificationChannelId,
					` **${config.nodeEnv}: ${config.channelName}** Всего постов в очереди: ${uniqPosts.length}`,
				);
				sendPostsToChannel(uniqPosts, ctx, type);
			})
			.catch(console.log);
	};

	// ****
	// POSTING TO CHANNEL
	// ****

	const sendPostsToChannel = (posts, ctx, type) => {
		if (posts.length == 0) return;
		let postIndex = 0;

		postingJob = cron.schedule(
			postingJobConfig,
			() => {
				// Posting 2 posts at the same time
				_.times(2, () => {
					// Save url to DB for checking in future and ignoring to posting
					saveUniquePostsIds(posts[postIndex], config.channelName);

					// Create description for the post
					const post = posts[postIndex];
					const link = config.hasLink ? `\n[link](https://www.reddit.com/${post.permalink})` : "";
					const postTitle = post.title ? post.title : "";
					const text = config.hasText ? postTitle + link : "";

					// POSTING FOR CHANNELS WITH VIDEOS ONLY
					if (config.videoOnly) {
						if (post.url.includes("redgifs")) {
							const url = post.url_overridden_by_dest;

							// Parsing web-page with video for getting video-url
							getRedgifsVideo(url)
								.then((redgifsUrl) => {
									const fileName = `${config.channelName + Date.now()}.${getFileExtension(redgifsUrl)}`;
									const filePath = `./telegram-bots/downloaded-files/${fileName}`;
									const downloadedFilePath = path.join(__dirname, "../downloaded-files/", fileName);

									downloadFile(redgifsUrl, filePath, () => {
										ctx.telegram.sendVideo(config.channelId, {
											source: downloadedFilePath,
											caption: text,
											parse_mode: "Markdown",
										});
										removeFile(filePath);
									});
								})
								.catch(console.log);
						}
						// POSTING FOR CHANNELS WITH BOTH TYPES
					} else {
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

					// If this is the last item of posts array => start ALL again
					if (!posts || postIndex + 1 === posts.length) {
						postingJob.destroy();
						postingJob = null;
						ctx.telegram.sendMessage(
							config.notificationChannelId,
							` **${config.nodeEnv}: ${config.channelName}** NEW ITERATION The posting schedule has been started`,
						);
						startPosting(ctx, type);
					}
					postIndex++;
				});
			},
			{
				scheduled: true,
			},
		);
	};

	const destroyJobs = () => {
		if (postingJob) {
			postingJob.destroy();
			postingJob = null;
		}
	};

	// ****
	// STARTING ALL OPERATIONS
	// ****

	startBot();
};

module.exports.postBase = postBase;
