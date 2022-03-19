const mongoose = require("mongoose");

const { Schema } = mongoose;

const NotificationSchema = new Schema({
  type: String,
  title: String,
  body: String,
  time: Number,
  link: String,
  viewed: {
    type: Boolean,
    default: false
  }
})
const SavedSchema = new Schema({
  type: String,
  title: String,
  time: Number,
  link: String,
})

const UserSchema = new Schema({
  company: {
    type: Schema.Types.ObjectId,
    ref: 'Company'
  },
  position: String,
  image: String,
  firstName: {
    type: String,
    trim: true,
    required: true
  },
  lastName: {
    type: String,
    trim: true,
    required: true
  },
  role: {
    type: Number,
    required: true
  },
  bio: String,
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true
  },
  saves: {
    type: [SavedSchema],
    default: []
  },
  password: {
    type: String,
    required: true
  },
  notifications: {
    type: [NotificationSchema]
  },
  registeredAt: {
    type: String,
    required: true
  },
  image: String
});

UserSchema.index(
  {
    firstName: "text",
    lastName: "text",
    email: "text"
  },
  {
    weights: {
      firstName: 10,
      lastName: 10,
      email: 5
    }
  }
);

module.exports = mongoose.model("User", UserSchema);
