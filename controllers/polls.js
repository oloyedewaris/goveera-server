const Poll = require("../models/Poll");
const User = require("../models/User");

// // Polls Controllers // //

//creates a new poll
exports.createPoll = (req, res) => {
  const { options, question } = req.body;

  const newOptions = options.map(option => ({ optionName: option, voters: [] }))

  const newPoll = new Poll({
    company: req.user.company,
    surveyor: req.user._id,
    options: newOptions,
    question,
    postedTime: Date.now(),
    timestamp: new Date().getTime()
  });

  newPoll
    .save()
    .then(poll => {
      poll.populate(["surveyor", "comments.commenter"]).execPopulate()
        .then(poll => res.status(200).json({ success: true, poll }))
        .catch(err => res.status(400).json(err));
    })
    .catch(err => res.status(400).json(err));
};

exports.getPolls = (req, res) => {
  let count
  Poll.countDocuments({ company: req.user.company }, (err, pollCount) => count = pollCount);
  Poll.find({ company: req.user.company })
    .populate("surveyor")
    .populate("comments.commenter")
    // .populate("options.voters")
    .limit(Number(req.query.limit))
    .sort({ timestamp: -1 })
    .then(polls => res.status(200).json({ count, polls }))
    .catch(err => res.status(400).json(err));
}

//find poll
exports.findPoll = (req, res) => {
  Poll.findById(req.params.id)
    .populate("surveyor")
    .populate("comments.commenter")
    .then(poll => res.status(200).json({ success: true, poll }))
    .catch(err => res.status(400).json(err));
};

//deletes a poll
exports.deletePoll = (req, res) => {
  Poll.findByIdAndDelete(
    req.params.id,
    (err, poll) => {
      if (err) return res.status(400).json({ success: false, err })
      res.status(200).json({ success: true, deletedPoll: poll })
    }
  );
};

exports.updatePoll = (req, res) => {
  const { id } = req.params;

  if (req.body.action === "vote") {
    Poll.findOneAndUpdate({
      _id: id,
      options: { $elemMatch: { optionName: req.body.optionName } }
    }, {
      $addToSet: {
        "options.$[elem].voters": req.user._id
      }
    }, { new: true, arrayFilters: [{ "elem.optionName": req.body.optionName }] })
      .populate("surveyor")
      .populate("comments.commenter")
      .exec()
      .then(poll => {
        if (req.user._id.toString() !== poll.surveyor._id.toString()) {
          const notification = {
            type: "vote",
            title: "New vote",
            body: `${req.user.firstName} ${req.user.lastName} voted in your poll`,
            time: Date.now(),
            link: `/poll/${poll._id}`
          }
          User.findByIdAndUpdate(
            poll.surveyor,
            { $push: { notifications: notification } },
            { new: true },
            (err, data) => {
              if (err) throw err
            }
          )
        }
        return res.status(200).json({ success: true, poll })
      })
      .catch(err => res.status(400).json(err))
  }
  //Perform the like action
  if (req.body.action === "like") {
    Poll.findByIdAndUpdate(id, { $addToSet: { likers: req.user._id } }, { new: true })
      .populate("surveyor")
      .populate("comments.commenter")
      .exec()
      .then(poll => {
        if (req.user._id.toString() !== poll.surveyor._id.toString()) {
          const notification = {
            type: "like",
            title: "New like",
            body: `${req.user.firstName} ${req.user.lastName} just liked your poll`,
            time: Date.now(),
            link: `/poll/${poll._id}`
          }
          User.findByIdAndUpdate(
            poll.surveyor,
            { $push: { notifications: notification } },
            { new: true },
            (err, data) => {
              if (err) throw err
            }
          )
        }
        return res.status(200).json({ success: true, poll })
      })
      .catch(err => res.status(400).json(err))
  }

  //Perform the unlike action
  if (req.body.action === "unlike") {
    Poll.findByIdAndUpdate(id, { $pull: { likers: req.user._id } }, { new: true })
      .populate("surveyor")
      .populate("comments.commenter")
      .exec()
      .then(poll => res.status(200).json({ success: true, poll }))
      .catch(err => res.status(400).json(err))
  }

  //Perform the comment action
  if (req.body.action === "addComment") {
    Poll.findByIdAndUpdate(
      id,
      {
        $push: {
          comments: {
            commenter: req.body.commenterId,
            text: req.body.text,
            timestamp: new Date().getTime()
          }
        }
      }, { new: true })
      .populate("surveyor")
      .populate("comments.commenter")
      .exec()
      .then(poll => {
        if (req.user._id.toString() !== poll.surveyor._id.toString()) {
          const notification = {
            type: "comment",
            title: "New comment",
            body: `${req.user.firstName} ${req.user.lastName} commented on your poll`,
            time: Date.now(),
            link: `/poll/${poll._id}`
          }
          User.findByIdAndUpdate(
            poll.surveyor,
            { $push: { notifications: notification } },
            { new: true },
            (err, data) => {
              if (err) throw err
            }
          )
        }
        return res.status(200).json({ success: true, poll })
      })
      .catch(err => res.status(400).json(err))
  }

  //Perform the delete comment action
  if (req.body.action === "deleteComment") {
    Poll.findByIdAndUpdate(id, { $pull: { comments: { _id: req.body.commentId } } }, { new: true })
      .populate("surveyor")
      .populate("comments.commenter")
      .exec()
      .then(poll => res.status(200).json({ success: true, poll }))
      .catch(err => res.status(400).json(err))
  }
};
