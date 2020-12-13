const Telegraf = require("telegraf");
const token = "932862565:AAGvB5FMFlC4O2oVS5JajXmA4-GtPytpto0";
const schedule = require("node-schedule");
const snoowrap = require("snoowrap");
const { get } = require("lodash");

const testChannelId = "@broccoleeBoobs";

const r = new snoowrap({
  userAgent:
    "Hello, I need to create this app for my nodejs server for posting images from reddit to my telegram channel",
  clientId: "nIgMmlzNDDlU9Q",
  clientSecret: "5uysAkU3BwhLRIPyofjEk8R-u2QgZQ",
  refreshToken: "572763428190-oyG2IPgb1oLPoPlLoenFEFsWwjXUPQ",
});

function startBot() {
  let job = null;
  const testBot = new Telegraf(token);
  testBot.command("start", (ctx) => {
    ctx.reply("Очередь запущена!");
    let startTime = new Date(Date.now() + 5000);
    getRedditPosts(ctx);
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
    r.getHot({ time: "day", limit: 30 }).then((hotPosts) => sendPostsToChannel(hotPosts, ctx));
  };

  const sendPostsToChannel = (posts, ctx) => {
    console.log(posts.length);
    posts.some((post, i) => {
      setTimeout(() => {
        // if (!job) {
        //   return true;
        // }
        if (post.url.includes("redgifs") || post.url.includes(".gifv")) {
          ctx.telegram.sendAnimation(testChannelId, post.preview.reddit_video_preview.fallback_url,  { caption: `${post.title} \n [post URL](https://www.reddit.com/${post.permalink})` , parse_mode: 'MarkdownV2' });
        } else {
          ctx.telegram.sendPhoto(testChannelId, post.url,  { caption: `${post.title} \n [post URL](https://www.reddit.com/${post.permalink})` , parse_mode: 'MarkdownV2' });
        }
      }, 10 * 60 * 1000 * i);
    });
  };
}

module.exports.startBot = startBot;
