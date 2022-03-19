const Post = require("../../models/Post");

const findPost = () => {
  Post.find({ company: req.user.company })
    .populate("author")
    .populate("comments.commenter")
    .sort({ timestamp: -1 })
    .then(posts => res.status(200).json(posts))
    .catch(err => res.status(400).json(err));
}

module.exports = { findPost }