const mongoose = require("mongoose");
const { Schema } = mongoose;

const OptionSchema = new Schema({
  optionName: {
    type: String,
    required: true
  },
  voters: [
    {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  ]
});

const CommentSchema = new Schema({
  commenter: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: String,
  timestamp: Number
});

const PollSchema = new Schema({
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company"
  },
  question: {
    type: String,
    required: true
  },
  surveyor: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  options: {
    type: [OptionSchema],
    required: true
  },
  comments: {
    type: [CommentSchema],
    default: [],
  },
  likers: {
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  timestamp: {
    type: Number,
    required: true
  },
  postedTime: {
    type: Number,
    required: true
  }
});

module.exports = mongoose.model("Poll", PollSchema);
