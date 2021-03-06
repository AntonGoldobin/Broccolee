
const { postIdSchema } = require('../schemas/postId');
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const getPostsIds = (channelName) => {
  return new Promise((resolve, reject) => {
    const GetPostIdModel = mongoose.model("model", postIdSchema, `${process.env.NODE_ENV}-${channelName}`);
    GetPostIdModel.find({}).exec((err, data) => {
      if (err) reject(err);
      resolve(data)
    });
  });
};

exports.getPostsIds = getPostsIds;