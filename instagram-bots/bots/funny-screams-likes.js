const Instagram = require("instagram-web-api");
const cron = require("node-cron");
const _ = require("lodash");
const dotenv = require("dotenv");

dotenv.config();

let dailySchedule = null;
let mapSchedule = {};

const client = new Instagram({ username: process.env.IG_FS_USERNAME, password: process.env.IG_FS_PASSWORD });

const start = () => {
	dailySchedule = cron.schedule("0 7 * * *", () => {
		mapSchedule = {};
		startDailyWork();
	});
};

const startDailyWork = () => {
	client
		.login()
		.then(() => {
			likeOrSubscribe(client, "rofl", "subscribe");
			likeOrSubscribe(client, "lol", "like");

			// likeOrSubscribe(client, "hereistheoriginalhashtagbrocol", "subscribe");
			// likeOrSubscribe(client, "hereistheoriginalhashtagbrocol", "like");
		})
		.catch(async (err) => {
			if (err.error && err.error.message === "checkpoint_required") {
				const challengeUrl = err.error.checkpoint_url;
				await client.updateChallenge({ challengeUrl, choice: 1 });
			}
		});
};

startDailyWork();

//hereisoroginalhashtagbroccole

const likeOrSubscribe = (client, tag, type) => {
	client
		.getMediaFeedByHashtag({ hashtag: tag })
		.then((data) => {
			let index = 0;
			const posts = data.edge_hashtag_to_media.edges;
			mapSchedule[type] = cron.schedule("*/30 * * * *", () => {
				_.delay(
					() => {
						if (index < posts.length) {
							if (type === "like") {
								client.like({ mediaId: posts[index].node.id });
							} else if (type === "subscribe") {
								client.follow({ userId: posts[index].node.owner.id });
							}
							index++;
						} else {
							destroyJobs(type);
						}
					},
					1000 * 60 * _.random(0, 30),
					client,
					index,
					type,
					posts,
				);
			});
		})
		.catch((err) => console.log(err));
};

const destroyJobs = (type) => {
	if (mapSchedule[type]) {
		mapSchedule[type].destroy();
		mapSchedule[type] = null;
	}
};

module.exports.start = start;
