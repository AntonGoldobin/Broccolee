const Telegraf = require("telegraf");
var cron = require("node-cron");
const snoowrap = require("snoowrap");
const dotenv = require("dotenv");
const logger = require("node-color-log");

dotenv.config();

const testChannelId = process.env.BROCCOLEE_TG_CHANNEL;
const token = process.env.BROCCOLEE_BOT_TOKEN;

const postingDelayMin = 15;
const dailyJobReplyConfig = () => { return `0 ${new Date().getHours()} * * *` };
const postingJobConfig = () => { return `*/${postingDelayMin} * * * *` };
const postLimit = 100;



console.log(new Date().getHours());

const r = new snoowrap({
  userAgent:
    "Hello, I need to create this app for my nodejs server for posting images from reddit to my telegram channel",
  clientId: process.env.BROCCOLEE_SNOOWRAP_CLIENT_ID,
  clientSecret: process.env.BROCCOLEE_SNOOWRAP_CLIENT_SECRET,
  refreshToken: process.env.BROCCOLEE_SNOOWRAP_REFRESH_TOKEN,
});

let dailyJob = null;
let postingJob = null;

function startBot() {
  const broccoleeBot = new Telegraf(token);

  startPosting(broccoleeBot, "hot");

  broccoleeBot.command("best", (ctx) => {
    ctx.reply(`Очередь будет запущена через ${postingDelayMin + 1} минут!`);

    destroyJobs();
    setTimeout(() => {
      startPosting(ctx, "best");
    }, (postingDelayMin + 1) * 60 * 1000);
  });

  broccoleeBot.command("hot", (ctx) => {
    ctx.reply(`Очередь будет запущена через ${postingDelayMin + 1} минут!`);

    destroyJobs();
    setTimeout(() => {
      startPosting(ctx, "hot");
    }, (postingDelayMin + 1) * 60 * 1000);
  });

  broccoleeBot.command("pause", (ctx) => {
    ctx.reply("Остановлено!");
    postingJob.stop();
  });

  broccoleeBot.command("start", (ctx) => {
    ctx.reply("Продолжаем!");
    postingJob.start();
  });
  
  broccoleeBot.command("destroy", (ctx) => {
    ctx.reply("Уничтожено!");
    destroyJobs();
  });

  broccoleeBot.launch();
}

const startPosting = (ctx, type) => {
  destroyJobs();

  dailyJob = cron.schedule(dailyJobReplyConfig(), () => {
    successfulConsoleLog("The schedule was started AGAIN: " + getCurrentTime());
    ctx.telegram.sendMessage(-1001473727416, "The posting schedule has been started AGAIN");
    getRedditPosts(ctx, type);
  }, {
    scheduled: true
  });
  dailyJob.start();

  ctx.telegram.sendMessage(-1001473727416, "!!! The posting has been started !!!");
  successfulConsoleLog("The schedule will be started soon: " + getCurrentTime());
  getRedditPosts(ctx, type);
}

const getRedditPosts = (ctx, type) => {
  if (type === "best") {
    r
      .getBest({ time: "day", limit: postLimit })
      .then((hotPosts) => sendPostsToChannel(hotPosts, ctx))
      .catch((err) => errorConsoleLog("Broccolee error: " + err));
  } else {
    r
      .getHot({ time: "day", limit: postLimit })
      .then((hotPosts) => sendPostsToChannel(hotPosts, ctx))
      .catch((err) => errorConsoleLog("Broccolee error: " + err));
  }

};

const sendPostsToChannel = (posts, ctx) => {
    let postIndex = 0

    postingJob = cron.schedule(postingJobConfig(), () => {
      successfulConsoleLog("new post from schedule: " + getCurrentTime());

      const post = posts[postIndex];
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

      if (!posts || postIndex + 1 === posts.length) {
        postingJob.destroy();
        postingJob = null;
      }

      postIndex++;
    }, {
      scheduled: true
    });
    dailyJob.start();
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
  if (dailyJob) {
    dailyJob.destroy();
    dailyJob = null;
  }
  if (postingJob) {
    postingJob.destroy();
    postingJob = null;
  }
}

module.exports.startBot = startBot;
