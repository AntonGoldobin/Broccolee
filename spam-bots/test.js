const Snoowrap = require('snoowrap');
const { CommentStream } = require('snoostorm');
const dotenv = require("dotenv");

dotenv.config();

const client = new Snoowrap({
  userAgent:
    "my-node-js-bot",
  clientId: process.env.JANE_SNOOWRAP_CLIENT_ID,
  clientSecret: process.env.JANE_SNOOWRAP_CLIENT_SECRET,
  refreshToken: process.env.JANE_SNOOWRAP_REFRESH_TOKEN,
	});

const BOT_START = Date.now() / 1000;

const canSummon = (msg) => {
  return msg && msg.toLowerCase().includes('whatsup, guys, hope you all will make great bots');
};

const getAndReplyComment = () => {
  const comments = new CommentStream(client, { 
    subreddit: 'testingground4bots', 
    limit: 10, 
    pollTime: 10000 
  });

  comments.on('item', (item) => {
    if(item.created_utc < BOT_START) return;
    if(!canSummon(item.body)) return;
    client.getComment(item.parent_id).fetch().then(parentComment => {
        console.log(parentComment.body);
    });
    // item.reply('hello world!');
  });
}

exports.getAndReplyComment = getAndReplyComment;