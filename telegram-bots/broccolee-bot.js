const Telegraf = require("telegraf");
const token = "932862565:AAGvB5FMFlC4O2oVS5JajXmA4-GtPytpto0";
const axios = require("axios");
const schedule = require("node-schedule");

const testChannelId = "@broccoleeBoobs";

const channels = [
  "Ahegao_IRL",
  "AhegaoBabes",
  "AhegaoGirls",
  "Ahegaos",
  "BlowJob",
  "blowjobsandwich",
  "cosplayonoff",
  "cumsluts",
  "freeuse",
  "GirlsFinishingTheJob",
  "gonewild",
  "GWCouples",
  "MVgirls",
  "NekoIRL",
  "nsfw_gifs",
  "nsfwcosplay",
  "NSFWCostumes",
  "pelfie",
  "PurpleBitchVIP",
  "pussyrating",
  "theBelfie",
  "Threesome",
  "TinderNSWF",
  "tittyfuck",
];

function startBot() {

  let job = null;
  const testBot = new Telegraf(token);
  testBot.command("start", (ctx) => {
    ctx.reply("Очередь запущена!");
    let startTime = new Date(Date.now() + 5000);
    job = schedule.scheduleJob({start: startTime}, function(){
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
    let channelsData = [];
    
    channels.map((channel, i) => {
      axios
        .get(`https://reddit.com/r/${channel}/top.json?limit=100`)
        .then((res) => {
          // data recieved from Reddit
          setTimeout(() => {
            channelsData.push(...res.data.data.children);

            if (i + 1 === channels.length) {
              const sortedChannelsData = channelsData.sort((a, b) => b.data.ups - a.data.ups);
              sendPostsToChannel(sortedChannelsData, ctx);
            }
          }, 1000 * i);
        })
        // if there's any error in request
        .catch((err) => console.log(err));
    });
  };

  const sendPostsToChannel = async (posts, ctx) => {
    posts.some((post, i) => {

      setTimeout(() => {
        if(!job){
          return true;
        }
        ctx.telegram.sendPhoto(testChannelId, post.data.url);
      }, 10 * 1000 * i);
    });
  };
}

module.exports.startBot = startBot;
