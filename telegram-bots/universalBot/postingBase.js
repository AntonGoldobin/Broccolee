const Telegraf = require("telegraf");
const cron = require("node-cron");
const { successfulConsoleLog, getCurrentTime, getChannelsDescriptions } = require("./utils");
const gettingPosts = require("./gettingPosts");
const { saveUniquePostsIds } = require("./../db/models/savePostId");
const { getPostsIds } = require("./../db/models/getPostsId");
const { removeAllPostsIds } = require("./../db/models/removeAllPostIds");
const _ = require("lodash");
const { startChannelAds, adsScheduleStart, adsScheduleStop } = require("./channelsAds");
const { sendPost } = require("./sendPost");

const postBase = (config) => {
	// ****
	// JOB CONFIG
	// ****

	const postingJobConfig = config.postingMin;

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
		if (postingJob) {
			postingJob.stop();
			//stoping ADS schedule
		}
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

		// Catching bot errors
		bot.catch((err, ctx) => {
			console.log(`TELEGRAF: Ooops, encountered an error for ${ctx.updateType}`, err);
		});

		// Create ADS schedule for current channel
		startChannelAds(config, bot);

		// Starting the first posting iteration
		startPosting(bot, "top");

		bot.command("best", (ctx) => {
			if (ctx.update.message.from.id == 273094621) {
				ctx.reply(`Очередь будет запущена через ${config.postingMin} минут!`);

				destroyJobs();
				startPosting(ctx, "best");
			} else {
				ctx.replyWithMarkdown(getChannelsDescriptions());
			}
		});

		bot.command("top", (ctx) => {
			if (ctx.update.message.from.id == 273094621) {
				ctx.reply(`Очередь будет запущена через ${config.postingMin} минут!`);

				destroyJobs();
				startPosting(ctx, "top");
			} else {
				ctx.replyWithMarkdown(getChannelsDescriptions());
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
				ctx.replyWithMarkdown(getChannelsDescriptions());
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
				ctx.replyWithMarkdown(getChannelsDescriptions());
			}
		});

		bot.command("destroy", (ctx) => {
			if (ctx.update.message.from.id == 273094621) {
				ctx.reply("Уничтожено!");
				destroyJobs();
			} else {
				ctx.replyWithMarkdown(getChannelsDescriptions());
			}
		});

		bot.command("destroyDBsrsly", (ctx) => {
			if (ctx.update.message.from.id == 273094621) {
				removeAllPostsIds(config.channelName);
				ctx.reply(`База данных (${config.channelName}) подчищена! Надеюсь ты знаешь, что делаешь`);
			} else {
				ctx.replyWithMarkdown(getChannelsDescriptions());
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
			.then((posts) => deletingDublicates(posts, ctx, type))
			.catch(console.log);
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
				// Removing all non-video posts for schedule
				if (config.type === "videoOnly") {
					const filteredVideos = uniqPosts.filter(
						(post) => post.url.includes("redgifs") || post.url.includes("v.redd.it"),
					);
					sendPostsToChannel(filteredVideos, ctx, type);
				} else {
					sendPostsToChannel(uniqPosts, ctx, type);
				}
			})
			.catch(console.log);
	};

	// ****
	// POSTING TO CHANNEL
	// ****

	const sendPostsToChannel = (posts, ctx, type) => {
		ctx.telegram.sendMessage(
			config.notificationChannelId,
			` **${config.nodeEnv}: ${config.channelName}** Всего постов в очереди: ${posts.length}`,
		);

		if (posts.length == 0) return;
		let postIndex = 0;

		postingJob = cron.schedule(
			postingJobConfig,
			() =>
				_.times(config.postsCount, () => {
					// Save url to DB for checking in future and ignoring to posting
					saveUniquePostsIds(posts[postIndex], config.channelName);

					const post = posts[postIndex];
					// Sending post's logic part
					sendPost(post, config, ctx, type);

					// If this is the last item of posts array => start ALL again
					if (!posts || postIndex + 1 === posts.length) {
						destroyJobs();
					}
					postIndex++;
				}),
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
