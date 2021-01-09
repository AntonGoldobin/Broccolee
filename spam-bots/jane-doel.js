const Snoowrap = require("snoowrap");
const { CommentStream } = require("snoostorm");
const dotenv = require("dotenv");
const _ = require("lodash");
const cron = require("node-cron");

const postingJobConfig = `*/15 * * * *`;

dotenv.config();

const commentsForReply = [
	"Yeah, her boobs rlly nice c: I made a little telegram channel with boobs. Hope I will find many people who will enjoy with me there 😇 \n https://t.me/joinchat/SiRGWc-swRVpnsXI",
	"Wow, this is stuns 🥰 I made a little private telegram channel with same photos. Not sure about that, but here is link https://t.me/joinchat/SiRGWc-swRVpnsXI",
	"Hey, really nice view 😇. \n I made a little private telegram channel with same GW photos, if this is interesting - enjoy :3 \n https://t.me/joinchat/SiRGWc-swRVpnsXI",
	"Oh, nice. \n I have a telegram channel with GoneWild theme pics, hope somebody will love it with me 😆 \n https://t.me/joinchat/SiRGWc-swRVpnsXI ",
];

let replySchedule = [];

cron.schedule(postingJobConfig, () => {
	if (replySchedule.length === 0) return;

	console.log("schedule started");
	replySchedule[0].reply(_.sample(commentsForReply)).catch(console.log);
	replySchedule.shift();
});

const client = new Snoowrap({
	userAgent: "my-node-js-bot",
	clientId: process.env.JANE_SNOOWRAP_CLIENT_ID,
	clientSecret: process.env.JANE_SNOOWRAP_CLIENT_SECRET,
	refreshToken: process.env.JANE_SNOOWRAP_REFRESH_TOKEN,
});

const BOT_START = Date.now() / 1000;

const canSummon = (msg) => {
	return msg && msg.toLowerCase().includes("boobs");
};

const getAndReplyComment = () => {
	const comments = new CommentStream(client, {
		subreddit: "gonewild",
		limit: 100,
		pollTime: 10000,
	});

	comments.on("item", (item) => {
		if (item.created_utc < BOT_START) return;
		if (!canSummon(item.body)) return;
		console.log("found and pushed");
		replySchedule.push(item);
	});
};

exports.getAndReplyComment = getAndReplyComment;
