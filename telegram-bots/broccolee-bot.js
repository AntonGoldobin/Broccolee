const Telegraf = require("telegraf");
var cron = require("node-cron");
const snoowrap = require("snoowrap");
const dotenv = require("dotenv");
const logger = require("node-color-log");

dotenv.config();

const testChannelId = process.env.BROCCOLEE_TG_CHANNEL;
const token = process.env.BROCCOLEE_BOT_TOKEN;

const postingDelayMin = 10;
const jobReplyConfig = "0 0 */12 * * *";

const r = new snoowrap({
  userAgent:
    "Hello, I need to create this app for my nodejs server for posting images from reddit to my telegram channel",
  clientId: process.env.BROCCOLEE_SNOOWRAP_CLIENT_ID,
  clientSecret: process.env.BROCCOLEE_SNOOWRAP_CLIENT_SECRET,
  refreshToken: process.env.BROCCOLEE_SNOOWRAP_REFRESH_TOKEN,
});

let job = null;

function startBot() {
  const broccoleeBot = new Telegraf(token);

  startPosting(broccoleeBot);

  broccoleeBot.command("start", (ctx) => {
    ctx.reply(`Очередь будет запущена через ${postingDelayMin + 1} минут!`);

    destroyJobs();
    setTimeout(() => {
      startPosting(ctx);
    }, (postingDelayMin + 1) * 60 * 1000);
  });

  broccoleeBot.command("stop", (ctx) => {
    ctx.reply("Остановлено!");
    destroyJobs();
  });

  broccoleeBot.launch();
}

const startPosting = (ctx) => {
  destroyJobs();

  job = cron.schedule(jobReplyConfig, () => {
    successfulConsoleLog("The schedule was started: " + getCurrentTime());
    ctx.telegram.sendMessage(-1001473727416, "The posting schedule has been started");
    getRedditPosts(ctx);
  });
  job.start();

  ctx.telegram.sendMessage(-1001473727416, "!!! The posting has been started !!!");
  successfulConsoleLog("The schedule will be started soon: " + getCurrentTime());
  getRedditPosts(ctx);
}

const getRedditPosts = (ctx) => {
  r
    .getHot({ time: "day", limit: 100 })
    .then((hotPosts) => sendPostsToChannel(hotPosts, ctx))
    .catch((err) => errorConsoleLog("Broccolee error: " + err));
};

const sendPostsToChannel = (posts, ctx) => {
  posts.some((post, i) => {
    setTimeout(() => {
      if (!job) {
        return true;
      }

      const text = `${post.title} \n[link](https://www.reddit.com/${post.permalink})`;

      if (post.url.includes("redgifs") || post.url.includes(".gifv")) {
        ctx.telegram.sendAnimation(testChannelId, post.preview.reddit_video_preview.fallback_url, {
          caption: text,
          parse_mode: "Markdown",
        });
      } else {
        ctx.telegram.sendPhoto(testChannelId, post.url, {
          caption: text,
          parse_mode: "Markdown",
        });
      }
    }, postingDelayMin * 60 * 1000 * i);
  });
};

const getCurrentTime = () => {
  var currentdate = new Date();
  return (
    currentdate.getDate() +
    "/" +
    (currentdate.getMonth() + 1) +
    "/" +
    currentdate.getFullYear() +
    " " +
    currentdate.getHours() +
    ":" +
    currentdate.getMinutes() +
    ":" +
    currentdate.getSeconds()
  );
};

const successfulConsoleLog = (text) => {
  logger.bgColor("black").info(text);
};

const errorConsoleLog = (text) => {
  logger.bgColor("black").error(text);
};

const destroyJobs = () => {
  if (job) {
    job.destroy();
    job = null;
  }
}

module.exports.startBot = startBot;
