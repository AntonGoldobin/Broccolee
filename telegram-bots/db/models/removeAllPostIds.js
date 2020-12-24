
const { postIdSchema } = require('../schemas/postId');
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();


const removeAllPostsIds = async (channelName) => {
  return new Promise((resolve, reject) => {
    const RemovePostIdModel = mongoose.model("model", postIdSchema, `${process.env.NODE_ENV}-${channelName}`);
    RemovePostIdModel.deleteMany({}, (err, data) => {
      if (err) reject(err);
      resolve("colection data was deleted!");
    });
  });
};

exports.removeAllPostsIds = removeAllPostsIds;