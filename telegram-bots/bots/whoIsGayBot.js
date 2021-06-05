const Telegraf = require("telegraf")
const cron = require("node-cron")
const _ = require("lodash")
const { saveUniquePostsIds } = require("../../db/models/savePostId")
const { getPostsIds } = require("../../db/models/getPostsId")
const dotenv = require("dotenv")

let startDailyPosting = null

const botName = "who-is-gay"
const botToken = process.env.GAY_BOT_TOKEN
const channelId = "-1001381678709"

const members = [ "Codeavr", "dzerayeah", "furfury", "darrrouge", "dianastn", "NemnogoDobra", "darydis" ]

const start = () => {
	const bot = new Telegraf(botToken, { username: "who_gay_bot" })

	startDailyPosting = cron.schedule("0 10 * * *", () => {
		const chosenUser = getDailyGay()
		getPostsIds(botName)
			.then((data) => {
				const combo = hasCombo(data, chosenUser)
				const bestGayListMessage = `❤️❤️❤️❤️❤️❤️❤️❤️❤️ \n\n ${getRandomPhrase()} - @${chosenUser} ${combo
					? `\n\n П-П-П-ПИДОР КОМБО! ${combo} РАЗ(а) ПОДРЯД! ${"⭐".repeat(combo)}`
					: ""} \n\n❤️❤️❤️❤️❤️❤️❤️❤️❤️`
				bot.telegram.sendMessage(channelId, bestGayListMessage)
				const member = { url: chosenUser, created: Date.now() }
				saveUniquePostsIds(member, botName)
			})
			.catch((err) => console.log("gayBot error" + err))
	})

	// Clearing offline commands by bot (IMPORTANT)
	bot.use(async (ctx, next) => {
		if (_.get(ctx, "update.message.date") && ctx.update.message.date * 1000 < Date.now() - 5000) {
			return false
		}
		await next()
	})

	bot.command("combo", (ctx) => {
		const msg = ctx.update.message.text.replace("/combo", "")
		const player = msg.trim() ? msg.trim() : ctx.update.message.chat.username
		getPostsIds(botName)
			.then((data) => ctx.telegram.sendMessage(ctx.update.message.chat.id, getMyCombo(data, player)))
			.catch((err) => console.log("who is gay mongo: " + err))
	})

	bot.command("top3", (ctx) => {
		getPostsIds(botName)
			.then((data) => ctx.telegram.sendMessage(ctx.update.message.chat.id, getTopList(data, 3)))
			.catch((err) => console.log("who is gay mongo: " + err))
	})

	bot.command("top", (ctx) => {
		getPostsIds(botName)
			.then((data) => ctx.telegram.sendMessage(ctx.update.message.chat.id, getTopList(data, "all")))
			.catch((err) => console.log("who is gay mongo: " + err))
	})

	bot.command("daygay", (ctx) => {
		getPostsIds(botName)
			.then((data) => ctx.telegram.sendMessage(ctx.update.message.chat.id, getCurrentGay(data)))
			.catch((err) => console.log("who is gay mongo: " + err))
	})

	bot.command("help", (ctx) => {
		ctx.telegram.sendMessage(
			ctx.update.message.chat.id,
			`Не знаю как тебе помочь ${ctx.update.message.from.first_name}. О, могу пидором назвать, хочешь?`,
		)
	})

	bot.launch()
}

const getCurrentGay = (data) => {
	if (data.length == 0) return ""
	const member = data.sort((a, b) => b.createdAt - a.createdAt)[0]
	return `ПИДОР ДНЯ - @${member.url} - ${data.filter((m) => member.url === m.url).length} points`
}

const getTopList = (data, count) => {
	let topList = []
	members.forEach((member) => {
		topList.push({ name: member, pp: data.filter((m) => member === m.url).length })
	})
	const sortedTopList = topList.sort((a, b) => b.pp - a.pp)

	let messageList = "ТОП ЛИСТ ПИДОРОВ \n\n"

	for (let i = 0; i < (count === "all" ? members.length : count); i++) {
		const member = sortedTopList[i]
		messageList += `${i === 0 ? "👑 " : "      "} ${i + 1} @${member.name}: ${member.pp} points \n\n`
	}

	return messageList
}

const getRandomPhrase = () => {
	const phrases = [
		"ПИДОР ДНЯ",
		"Хоба! ПИДОР",
		"Какое сейчас время? Время быть ПИДОРОМ",
		"Сколько волка не корми, а смотрит, что ПИДОР",
		"Семь раз отмерь, один раз ПИДОР",
		"Любишь кататься, а всеравно ПИДОР",
		"Встречают по одежке, а провожают, потому что ПИДОР",
		"Одна голова хорошо, а лучше, когда ПИДОР",
		"Кто с мечом к нам придет, тот ПИДОР",
		"Сделал дело, стал ПИДОРОМ",
		"Слово не воробей, а вот ПИДОР",
		"Тише едешь, будешь ПИДОРОМ",
		"Не рой другому яму, станешь ПИДОРОМ",
	]
	return _.sample(phrases)
}

const getDailyGay = () => {
	return _.sample(members)
}

const getMyCombo = (data, name) => {
	let combo = 0
	let currentCombo = 0

	const sorted = data.sort((a, b) => a.createdAt - b.createdAt)

	sorted.forEach((day) => {
		if (day.url.toLowerCase() === name.toLowerCase()) {
			currentCombo++
			if (currentCombo > combo) {
				combo = currentCombo
			}
		} else {
			currentCombo = 0
		}
	})

	const msg =
		combo > 0
			? `@${name} \n \n самое продолжительное ПИДОР-комбо \n \n ${combo} раз(а) подряд ${"⭐".repeat(combo)}`
			: `@${name}? О каком комбо речь? Пф`

	return msg
}

const hasCombo = (data, name) => {
	let comboCount = 0
	let index = 0
	let isCombo = true

	const sorted = data.sort((a, b) => a.createdAt - b.createdAt)

	while (isCombo) {
		if (sorted.reverse()[index].url.toLowerCase() !== name.toLowerCase()) isCombo = false
		comboCount++
	}

	return comboCount > 1 ? comboCount : null
}

module.exports.start = start
