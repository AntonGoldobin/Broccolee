
const { postIdSchema } = require('../schemas/postId');
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const saveUniquePostsIds = (post, channelName) => {
  if (post) {
    const SaveIdModel = mongoose.model("model", postIdSchema, `${process.env.NODE_ENV}-${channelName}`);

    const postId = new SaveIdModel({ url: post.url, createdAt: post.created });
    postId.markModified('model');

    postId.save(function (err, doc) {
      if (err) return console.error(err);
    });
  }
};

exports.saveUniquePostsIds = saveUniquePostsIds;