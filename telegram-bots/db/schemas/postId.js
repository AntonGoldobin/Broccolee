
const mongoose = require("mongoose");

const postIdSchema = mongoose.Schema({
  url: String,
  createdAt: Number,
});

exports.postIdSchema = postIdSchema;