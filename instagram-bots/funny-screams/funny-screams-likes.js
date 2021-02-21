const Instagram = require("instagram-web-api");
const cron = require("node-cron");
const _ = require("lodash");
const dotenv = require("dotenv");

dotenv.config();

let mapSchedule = null;

const client = new Instagram({ username: process.env.IG_FS_USERNAME, password: process.env.IG_FS_PASSWORD });

const dailySchedule = cron.schedule("0 7 * * *", () => {
	start();
});

const start = () => {
	client.login().then(() => {
		likeOrSubscribe(client, "dog", "subscribe");
		likeOrSubscribe(client, "lol", "like");

		// likeOrSubscribe(client, "hereistheoriginalhashtagbrocol", "subscribe");
		// likeOrSubscribe(client, "hereistheoriginalhashtagbrocol", "like");
	});
};

//hereisoroginalhashtagbroccole

const likeOrSubscribe = (client, tag, type) => {
	client
		.getMediaFeedByHashtag({ hashtag: tag })
		.then((data) => {
			let index = 0;
			const posts = data.edge_hashtag_to_media.edges;
			mapSchedule = cron.schedule("0 * * * *", () => {
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
							destroyJobs();
						}
					},
					1000 * 60 * _.random(0, 60),
					client,
					index,
					type,
					posts,
				);
			});
		})
		.catch((err) => console.log(err));
};

const destroyJobs = () => {
	if (mapSchedule) {
		mapSchedule.destroy();
		mapSchedule = null;
	}
};

module.exports.start = start;
