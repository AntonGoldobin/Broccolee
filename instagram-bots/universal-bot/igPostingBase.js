const cron = require("node-cron");
const { successfulConsoleLog, getCurrentTime } = require("./utils");
const { getPostsIds } = require("../../db/models/getPostsId");
const { removeAllPostsIds } = require("../../db/models/removeAllPostIds");
const _ = require("lodash");
// const { startChannelAds, adsScheduleStart, adsScheduleStop } = require("./channelsAds");
const { sendPost } = require("./sendPost");
const { IgApiClient } = require("instagram-private-api");
const axios = require("axios");

const postBase = (config) => {
	// ****
	// JOB CONFIG
	// ****

	const postingJobConfig = config.postingMin;

	let postingJob = null;
	let startDailyPosting = null;

	// ****
	// CREATING THE BOT AND CHECK COMMANDS
	// ****

	async function startBot() {
		const ig = new IgApiClient();
		// You must generate device id's before login.
		// Id's generated based on seed
		// So if you pass the same value as first argument - the same id's are generated every time
		await ig.state.generateDevice(config.igLogin);
		await ig.simulate.preLoginFlow();
		await ig.account.login(config.igLogin, config.igPassword);
		process.nextTick(async () => await ig.simulate.postLoginFlow());

		// ****
		// STARTING/STOPING DAILY POSTING SCHEDULES
		// ****

		startDailyPosting = cron.schedule("0 7 * * *", () => {
			//Starting posting
			startPosting(ig, "top");

			// Start ADS
			// TODO startChannelAds()
		});

		// Create ADS schedule for current channel
		// TODO startChannelAds(config, bot);

		// Starting the first posting iteration
		await startPosting(ig, "top");
	}

	// ****
	// STARTING SCHEDULE
	// ****

	const startPosting = (ig, type) => {
		destroyJobs();

		// STOP POSTING AT NIGHT
		const currentDate = new Date();
		const currentTimeHours = currentDate.getHours();
		if (currentTimeHours > 22 || currentTimeHours < 7) {
			successfulConsoleLog("The schedule NOT started (this is night): " + getCurrentTime());
			return;
		}

		successfulConsoleLog("INSTAGRAM The schedule will be started soon: " + getCurrentTime());
		getRedditPosts(ig, type);
	};

	// ****
	// GETTING DATA
	// ****

	const getRedditPosts = (ig, type) => {
		axios
			.get(`https://reddit.com/r/${config.redditChannel}/top.json?limit=${config.postLimit}`)
			.then((res) => {
				// data recieved from Reddit
				const data = res.data.data.children;

				deletingDublicates(data, ig, type);
			})
			.catch(console.log);
	};

	// ****
	// DELETING DUBLICATES
	// ****

	const deletingDublicates = (newPosts, ig, type) => {
		// Getting all post IDs from DB
		getPostsIds(config.channelName)
			.then((postsIdsBD) => {
				// Remove dublicates by IDs
				const uniqPosts = _.differenceWith(newPosts, postsIdsBD, (post, record) => post.data.url == record.url);
				return uniqPosts;
			})
			.then((uniqPosts) => {
				// Removing all non-video posts for schedule
				if (config.type === "videoOnly") {
					const filteredVideos = uniqPosts.filter(
						(post) => post.data.url.includes("redgifs") || post.data.url.includes("v.redd.it"),
					);
					sendPostsToChannel(filteredVideos, ig, type);
				}
			})
			.catch(console.log);
	};

	// ****
	// POSTING TO CHANNEL
	// ****

	const sendPostsToChannel = (posts, ig, type) => {
		if (posts.length == 0) return;
		let postIndex = 0;

		postingJob = cron.schedule(
			postingJobConfig,
			() => {
				const post = posts[postIndex];

				sendPost(post.data, config, ig, type);
				postIndex++;

				// If this is the last item of posts array => start ALL again
				if (posts.length === 0 || postIndex >= posts.length) {
					destroyJobs();
				}
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
