const Telegraf = require("telegraf");
const cron = require("node-cron");
const _ = require("lodash");
const { saveUniquePostsIds } = require("../../db/models/savePostId");
const { getPostsIds } = require("../../db/models/getPostsId");

let startDailyPosting = null;

const botName = "who-is-gay";
const botToken = "1646739103:AAHX1YS--WalviQ2r6i17oCtuhqHnlBf7Oc";
const channelId = "-461375734";

const members = [ "Codeavr", "dzerayeah", "furfury", "darrrouge", "dianastn", "NemnogoDobra" ];

const start = () => {
	const bot = new Telegraf(botToken, { username: "who_gay_bot" });

	startDailyPosting = cron.schedule("0 15 * * *", () => {
		const chosenUser = getDailyGay();
		const bestGayListMessage = `❤️❤️❤️❤️❤️❤️❤️❤️❤️ \n\n ПИДОР ДНЯ - @${chosenUser} \n \n❤️❤️❤️❤️❤️❤️❤️❤️❤️`;
		bot.telegram.sendMessage(channelId, bestGayListMessage);

		const member = { url: chosenUser, created: Date.now() };
		saveUniquePostsIds(member, botName);
	});

	// Clearing offline commands by bot (IMPORTANT)
	bot.use(async (ctx, next) => {
		if (_.get(ctx, "update.message.date") && ctx.update.message.date * 1000 < Date.now() - 5000) {
			return false;
		}
		await next();
	});

	// bot.on("message", async (ctx) => {});

	bot.command("toplist", (ctx) => {
		getPostsIds(botName)
			.then((data) => ctx.telegram.sendMessage(ctx.update.message.chat.id, getTopList(data)))
			.catch((err) => console.log("who is gay mongo: " + err));
	});

	bot.command("daygay", (ctx) => {
		getPostsIds(botName)
			.then((data) => ctx.telegram.sendMessage(ctx.update.message.chat.id, getCurrentGay(data)))
			.catch((err) => console.log("who is gay mongo: " + err));
	});

	bot.launch();
};

const getCurrentGay = (data) => {
	const member = data.sortdata.sort((a, b) => b.createdAt - a.createdAt)[0][0];
	console.log(member);
	return `ПИДОР ДНЯ - @${member.url} - ${data.filter((m) => member.url === m.url).length} points`;
};

const getTopList = (data) => {
	let topList = [];
	members.forEach((member) => {
		topList.push({ name: member, pp: data.filter((m) => member === m.url).length });
	});
	const sortedTopList = topList.sort((a, b) => b.pp - a.pp);

	let messageList = "ТОП ЛИСТ ПИДОРОВ \n\n";

	for (let i = 0; i < 3; i++) {
		const member = sortedTopList[i];
		messageList += `${i === 0 ? "👑 " : "      "} ${i + 1} @${member.name}: ${member.pp} points \n\n`;
	}

	return messageList;
};

const getDailyGay = () => {
	return _.sample(members);
};

module.exports.start = start;
