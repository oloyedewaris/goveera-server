const Project = require("../../models/Project");

const findProject = (err, project) => {
  if (err) return res.status(400).json(err);

  Project.find({ company: req.user.company })
    .populate("initiator")
    .populate("comments.commenter")
    .sort({ timestamp: -1 })
    .then(projects => res.status(200).json(projects))
    .catch(err => res.status(400).json(err));
}

module.exports = { findProject }