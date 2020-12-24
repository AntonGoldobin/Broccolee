const Telegraf = require("telegraf");
const cron = require("node-cron");
const { successfulConsoleLog, getCurrentTime, downloadFile, getFileExtension, removeFile } = require("./utils");
const { getRedgifsVideo } = require("./gettingRedgifsVideo")
const gettingPosts = require("./gettingPosts");
const path = require('path');
const { saveUniquePostsIds } = require('./../db/models/savePostId');
const { getPostsIds } = require('./../db/models/getPostsId');
const { removeAllPostsIds } = require('./../db/models/removeAllPostIds');
const _ = require('lodash');


const postBase = (config) => {

  // ****
  // JOB CONFIG
  // ****

  const dailyJobReplyConfig = () => { return `0 */12 * * *` };
  const postingJobConfig = `*/${config.postingDelayMin} * * * *`;

  let dailyJob = null;
  let postingJob = null;

  // ****
  // CREATING THE BOT AND CHECK COMMANDS
  // ****

  function startBot() {
    const bot = new Telegraf(config.botToken);

    startPosting(bot, "hot");

    bot.command("best", (ctx) => {
      ctx.reply(`Очередь будет запущена через ${config.postingDelayMin + 1} минут!`);

      destroyJobs();
      startPosting(ctx, "best");
    });

    bot.command("hot", (ctx) => {
      ctx.reply(`Очередь будет запущена через ${config.postingDelayMin + 1} минут!`);

      destroyJobs();
      startPosting(ctx, "hot");
    });

    bot.command("pause", (ctx) => {
      ctx.reply("Остановлено!");
      postingJob.stop();
    });

    bot.command("start", (ctx) => {
      ctx.reply("Продолжаем!");
      postingJob.start();
    });
    
    bot.command("destroy", (ctx) => {
      ctx.reply("Уничтожено!");
      destroyJobs();
    });

    bot.command("destroyDBsrsly", (ctx) => {
      removeAllPostsIds(config.channelName)
      ctx.reply(`База данных (${config.channelName}) подчищена! Надеюсь ты знаешь, что делаешь`);
    });

    bot.launch();
  }

  // ****
  // STARTING SCHEDULE
  // ****

  const startPosting = (ctx, type) => {
    destroyJobs();

    dailyJob = cron.schedule(dailyJobReplyConfig(), () => {
      successfulConsoleLog("The schedule was started AGAIN: " + getCurrentTime());
      ctx.telegram.sendMessage(config.notificationChannelId, `**${config.nodeEnv}: ${config.channelName}** The posting schedule has been started AGAIN`);
      getRedditPosts(ctx, type);
    }, {
      scheduled: true
    });
    dailyJob.start();

    ctx.telegram.sendMessage(config.notificationChannelId, `**${config.nodeEnv}: ${config.channelName}** !!! The posting has been started !!!`);
    successfulConsoleLog("The schedule will be started soon: " + getCurrentTime());
    getRedditPosts(ctx, type);
  }  

  // ****
  // GETTING DATA
  // ****

  const getRedditPosts = (ctx, type) => {
    gettingPosts.getPosts(type, config.snoowrapClientId, config.snoowrapSecret, config.snoowrapToken, config.postLimit)
      .then((posts => deletingDublicates(posts, ctx)));
  };

  // ****
  // DELETING DUBLICATES
  // ****

  const deletingDublicates = (newPosts, ctx) => {

    // Getting all post IDs from DB
    getPostsIds(config.channelName)
      .then((postsIdsBD) => {

        // Remove dublicates by IDs
        const uniqPosts = _.differenceWith(newPosts, postsIdsBD, (post, record) => post.url == record.url);
        return uniqPosts;
      }).then((uniqPosts => {
        sendPostsToChannel(uniqPosts, ctx);
      }))
      .catch(console.log);
  };
  

  // ****
  // POSTING TO CHANNEL
  // ****

  const sendPostsToChannel = (posts, ctx) => {

    if(posts.length == 0) return
    let postIndex = 0

    postingJob = cron.schedule(postingJobConfig, () => {

      // Save url to DB for checking in future and ignoring to posting
      saveUniquePostsIds(posts[postIndex], config.channelName);


      // Create description for the post
      const post = posts[postIndex];
      const link = config.hasLink ? `\n[link](https://www.reddit.com/${post.permalink})` : ""
      const postTitle = post.title ? post.title : ""
      const text = config.hasText ? postTitle + link : "";
      
      // POSTING FOR CHANNELS WITH VIDEOS ONLY
      if (config.videoOnly) {
        if (post.url.includes("redgifs")) {
          const url = post.url_overridden_by_dest;

          // Parsing web-page with video for getting video-url
          getRedgifsVideo(url)
            .then(redgifsUrl => {
              const fileName = `${config.channelName + Date.now()}.${getFileExtension(redgifsUrl)}`
              const filePath = `./telegram-bots/downloaded-files/${fileName}`
              const downloadedFilePath = path.join(__dirname, "../downloaded-files/", fileName)

              downloadFile(redgifsUrl, filePath, () => {
                ctx.telegram.sendVideo(config.channelId, {
                  source: downloadedFilePath,
                  caption: text,
                  parse_mode: "Markdown",
                });
                removeFile(filePath);
              });
            }).catch(console.log);
          }
        // POSTING FOR CHANNELS WITH BOTH TYPES
        } else {
          if (post.url.includes("redgifs") || post.url.includes(".gifv")) {
            ctx.telegram.sendVideo(config.channelId, post.preview.reddit_video_preview.fallback_url, {
              caption: text,
              parse_mode: "Markdown",
            });
          } else {
            ctx.telegram.sendPhoto(config.channelId, post.url, {
              caption: text,
              parse_mode: "Markdown",
            });
          }
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

  const destroyJobs = () => {
    if (dailyJob) {
      dailyJob.destroy();
      dailyJob = null;
    }
    if (postingJob) {
      postingJob.destroy();
      postingJob = null;
    }
  };

  // ****
  // STARTING ALL OPERATIONS
  // ****

  startBot();

};

module.exports.postBase = postBase;
