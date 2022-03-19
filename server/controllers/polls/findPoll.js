const Poll = require("../../models/Poll");

const findPoll = (res, err, polls) => {
  if (err) return res.status(400).json(err);

  Poll.find({ company: req.user.company })
    .populate("author")
    .populate("comments.commenter")
    .sort({ timestamp: -1 })
    .then(polls => res.status(200).json(polls))
    .catch(err => res.status(400).json(err));
}

module.exports = { findPoll }