const cron = require("node-cron");
const _ = require('lodash');
const axios = require('axios');


const channelsADS = [
  { name: "broccolee", channelForAds: "gonewild", description: `Describe to another our channel: \n \n ❤️ [Broccolee](https://t.me/joinchat/SiRGWc-swRVpnsXI) - cutest girls only`},
  { name: "tiktok-nudes", channelForAds: "TikTokNude", description: `Describe to another our channel: \n \n ❤️ [TikTok Nudes](https://t.me/joinchat/RSAFCfi5qSNabbMB) - nsfw TikTok videos` },
  { name: "hentai", channelForAds: "hentai", description: `Describe to another our channel: \n \n ❤️ [Hentai](https://t.me/joinchat/V1kGMyMSx3c5ZRs6) - hentai arts and GIFs` },
  { name: "pornhub", channelForAds: "porn_gifs", description: `Describe to another our channel: \n \n ❤️ [Pornhub Videos](https://t.me/joinchat/Ss7it4saMZgcXYCX) - porn videos only`},
];

let postingJob = null;

const startChannelAds = (config, ctx) => {


  postingJob = cron.schedule(config.adsJobConfig, () => {
    const channel = _.sample(channelsADS.filter(chan => chan.name !== config.channelName));
    
    axios.get(`https://reddit.com/r/${channel.channelForAds}/top.json?limit=1`)
      .then(res => {
        // data recieved from Reddit
        const data = res.data.data.children;
        postAds(data[0].data, ctx, config, channel)
      })
  })
}

const postAds = (post, ctx, config, channel) => {
    if (post.url.includes("redgifs") || post.url.includes(".gifv")) {
    ctx.telegram.sendDocument(config.channelId, post.preview.reddit_video_preview.fallback_url, {
      caption: channel.description,
      parse_mode: "Markdown",
    });
  } else {
    ctx.telegram.sendPhoto(config.channelId, post.url, {
      caption: channel.description,
      parse_mode: "Markdown",
    });
  }
}

const adsScheduleStart = () => {
  postingJob.start();
};

const adsScheduleStop = () => {
  postingJob.stop();
}



module.exports.startChannelAds = startChannelAds;
module.exports.adsScheduleStart = adsScheduleStart;
module.exports.adsScheduleStop = adsScheduleStop;