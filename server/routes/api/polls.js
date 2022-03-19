// Routes  Containing actions needed by Posts

const express = require("express");
const Poll = require("../../models/Poll");
const auth = require("../../middleWare/auth");
const pollsController = require("../../controllers/polls/polls");

const router = express.Router();

// // Polls Routes // //

//@route --post api/polls
//@description --Make a New Poll
//@access --private
router.post("/", auth, pollsController.createPoll);

//@route-- delete api/polls/:id
//@description --Delete an Existing Poll
//@access --private
router.delete("/:id", auth, pollsController.deletePoll);

//@route --patch api/polls/:id
//@description --Update polls with voters
//@access --private
router.patch("/:id", auth, pollsController.updatePoll);

//@route --patch api/polls/
//@description --Get polls
//@access --private
router.get("/", auth, pollsController.getPolls);

module.exports = router;
