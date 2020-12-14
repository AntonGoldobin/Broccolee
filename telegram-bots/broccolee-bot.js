const Telegraf = require("telegraf");
const schedule = require("node-schedule");
var cron = require("node-cron");
const snoowrap = require("snoowrap");
const dotenv = require("dotenv");

dotenv.config();

const testChannelId = "@broccoleeBoobs";
const token = process.env.BROCCOLEE_BOT_TOKEN;

const postingDelayMin = 10;
const jobReplyConfig = "* */12 * * *";

const r = new snoowrap({
  userAgent:
    "Hello, I need to create this app for my nodejs server for posting images from reddit to my telegram channel",
  clientId: process.env.BROCCOLEE_SNOOWRAP_CLIENT_ID,
  clientSecret: process.env.BROCCOLEE_SNOOWRAP_CLIENT_SECRET,
  refreshToken: process.env.BROCCOLEE_SNOOWRAP_REFRESH_TOKEN,
});

let job = null;

function startBot() {

  const testBot = new Telegraf(token);
  testBot.command("start", (ctx) => {
    ctx.reply("Очередь запущена!");

    console.log("The schedule will be started soon: " + getCurrentTime());
    getRedditPosts(ctx);

    job = cron.schedule(
      jobReplyConfig,
      () => {
        console.log("The schedule was started: " + getCurrentTime());
        getRedditPosts(ctx);
      }
    );
    job.start();
  });

  testBot.command("stop", (ctx) => {
    ctx.reply("Остановлено!");
    if (job) {
      console.log("The schedule was stoped: " + getCurrentTime());
      job.destroy();
      job = null;
    }
  });

  testBot.launch();
}

const getRedditPosts = (ctx) => {
  r.getHot({ time: "day", limit: 100 }).then((hotPosts) => sendPostsToChannel(hotPosts, ctx));
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

module.exports.startBot = startBot;
