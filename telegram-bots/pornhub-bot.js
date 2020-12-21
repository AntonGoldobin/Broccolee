const Telegraf = require("telegraf");
var cron = require("node-cron");
const dotenv = require("dotenv");
const logger = require("node-color-log");
const Pornhub = require("pornhub-api")
const Videos = new Pornhub.Videos()

dotenv.config();

const channelId = process.env.PORNHUB_TG_CHANNEL;
const token = process.env.PORNHUB_BOT_TOKEN;

const postingDelayMin = 15;
const dailyJobReplyConfig = () => { return `0 ${new Date().getHours()} * * *` };
const postingJobConfig = () => { return `*/${postingDelayMin} * * * * *` };

let dailyJob = null;
let postingJob = null;

function startBot() {
  const broccoleeBot = new Telegraf(token);

  startPosting(broccoleeBot, "hot");

  broccoleeBot.command("best", (ctx) => {
    ctx.reply(`Очередь будет запущена через ${postingDelayMin + 1} минут!`);

    destroyJobs();
    startPosting(ctx, "best");
  });

  broccoleeBot.command("hot", (ctx) => {
    ctx.reply(`Очередь будет запущена через ${postingDelayMin + 1} минут!`);

    destroyJobs();
    startPosting(ctx, "hot");
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
    // ctx.telegram.sendMessage(-1001473727416, "The posting schedule has been started AGAIN");
    getPosts(ctx, type);
  }, {
    scheduled: true
  });
  dailyJob.start();

  // ctx.telegram.sendMessage(-1001473727416, "!!! The posting has been started !!!");
  successfulConsoleLog("The schedule will be started soon: " + getCurrentTime());
  getPosts(ctx, type);
}

const getPosts = (ctx, type) => {

  Videos.search({
    search: "Hard"
  }).then(videos => {
      console.log(videos)
  })
  // pornhub.search('Video', 'tokyo hot')
  //   .then((res) => sendPostsToChannel(res.data, ctx))
  //   .catch((err) => errorConsoleLog("Broccolee error: " + err));
};

const sendPostsToChannel = (posts, ctx) => {
    let postIndex = 0

    postingJob = cron.schedule(postingJobConfig(), () => {
      const post = posts[postIndex];
      const text = post.title;

      console.log(post)
      ctx.telegram.sendVideo(channelId, post.url, {
        caption: text,
        parse_mode: "Markdown",
      });

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
