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

const ProjectSchema = new Schema({
  company: {
    type: Schema.Types.ObjectId,
    ref: "Company"
  },
  initiator: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  comments: {
    type: [CommentSchema],
    default: [],
  },
  supporters: {
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  opposers: {
    type: [{ type: Schema.Types.ObjectId, ref: "User" }],
    default: [],
  },
  title: {
    type: String,
    trim: true,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  projectStage: {
    type: String,
    default: "Initial"
  },
  budget: {
    type: Number,
    required: true
  },
  timeFrame: {
    type: [String],
    required: true
  },
  tasks: {
    type: [{
      taskName: String,
      completed: { type: Boolean, default: false }
    }],
    required: true
  },
  team: {
    type: [Schema.Types.ObjectId],
    default: []
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

module.exports = mongoose.model("Project", ProjectSchema);
