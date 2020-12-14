const Telegraf = require("telegraf");
const schedule = require("node-schedule");
const snoowrap = require("snoowrap");
const dotenv = require('dotenv');

dotenv.config();

const testChannelId = "@broccoleeBoobs";
const token = process.env.BROCCOLEE_BOT_TOKEN;

const r = new snoowrap({
  userAgent:
    "Hello, I need to create this app for my nodejs server for posting images from reddit to my telegram channel",
  clientId: process.env.BROCCOLEE_SNOOWRAP_CLIENT_ID,
  clientSecret: process.env.BROCCOLEE_SNOOWRAP_CLIENT_SECRET,
  refreshToken: process.env.BROCCOLEE_SNOOWRAP_REFRESH_TOKEN,
});

function startBot() {
  let job = null;
  const testBot = new Telegraf(token);
  testBot.command("start", (ctx) => {
    ctx.reply("Очередь запущена!");
    let startTime = new Date(Date.now() + 5000);
    job = schedule.scheduleJob({ start: startTime, rule: "0 0 */12 * * *" }, function(){
      getRedditPosts(ctx);
    });
  });

  testBot.command("stop", (ctx) => {
    ctx.reply("Остановлено!");
    if (job) {
      job.cancel();
      job = null;
    }
  });

  testBot.launch();

  const getRedditPosts = (ctx) => {
    r.getHot({ time: "day", limit: 100 }).then((hotPosts) => sendPostsToChannel(hotPosts, ctx));
  };

  const sendPostsToChannel = (posts, ctx) => {
    console.log(posts.length);
    posts.some((post, i) => {
      setTimeout(() => {
        // if (!job) {
        //   return true;
        // }
        if (post.url.includes("redgifs") || post.url.includes(".gifv")) {
          ctx.telegram.sendAnimation(testChannelId, post.preview.reddit_video_preview.fallback_url,  { caption: `${post.title} \n [link](https://www.reddit.com/${post.permalink})` , parse_mode: 'MarkdownV2' });
        } else {
          ctx.telegram.sendPhoto(testChannelId, post.url,  { caption: `${post.title} \n [link](https://www.reddit.com/${post.permalink})` , parse_mode: 'MarkdownV2' });
        }
      }, 10 * 60 * 1000 * i);
    });
  };
}

module.exports.startBot = startBot;
