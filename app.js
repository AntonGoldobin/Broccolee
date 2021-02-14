const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");

const broccoleeBot = require("./telegram-bots/bots/broccolee-bot");
const avocadoBot = require("./telegram-bots/bots/avocado-bot");
const pornhubBot = require("./telegram-bots/bots/pornhub-bot");
const tikTokNudesBot = require("./telegram-bots/bots/tiktok-nudes-bot");
const hentaiBot = require("./telegram-bots/bots/hentai-bot");
const sluttyStoriesBot = require("./telegram-bots/bots/slutty-stories-bot");
const startSluttyStoriesRusBot = require("./telegram-bots/bots/slutty-stories-rus-bot");
const spamBotJane = require("./spam-bots/jane-doel");
const instaSubscribes = require("./instagram-bots/funny-screams");

const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

mongoose.connect(
	`mongodb+srv://${process.env.MONGODB_AUTH}@cluster0.lyyb5.mongodb.net/tg_channels?retryWrites=true&w=majority`,
	{ useNewUrlParser: true, useUnifiedTopology: true },
	function(err) {
		if (err) return console.log(err);
	},
);

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(express.static(__dirname + "/public/landing"));
//Store all JS and CSS in Scripts folder.

app.use("/", indexRouter);
app.use("/users", usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
	next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get("env") === "development" ? err : {};

	// render the error page
	res.status(err.status || 500);
	res.render("error");
});

pornhubBot.startPornhubBot();
broccoleeBot.startBroccoleeBot();
tikTokNudesBot.startTikTokNudesBot();
hentaiBot.startHentaiBot();
sluttyStoriesBot.startSluttyStoriesBot();
startSluttyStoriesRusBot.startSluttyStoriesRusBot();
avocadoBot.startAvocadoBot();
instaSubscribes.start();
// spamBotJane.getAndReplyComment();

module.exports = app;
