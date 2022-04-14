const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommentSchema = new Schema({
  commenter: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  text: String,
  timestamp: Number
});

const PostSchema = new Schema({
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company"
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
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
  text: {
    type: String,
    trim: true,
    required: true
  },
  isAnnouncement: {
    type: Boolean,
    default: false
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

module.exports = mongoose.model("Post", PostSchema);
