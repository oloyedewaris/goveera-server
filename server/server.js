const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const mongoKey = require("./config/keys");
const users = require("./routes/api/users");
const auth = require("./routes/api/auth");
const post = require("./routes/api/posts");
const poll = require("./routes/api/polls");
const project = require("./routes/api/projects");
const company = require("./routes/api/company");

const app = express();

//Using Middlewares
app.use(express.json());
app.use(cors());
if (process.env.NODE_ENV === "production") {
  app.enable('trust proxy');
  app.use(function (req, res, next) {
    if (req.secure) {
      next();
    } else {
      res.redirect('https://' + req.headers.host + req.url);
    }
  });
}

//Config  mongodb
const db = mongoKey.mongoURI;

//Connect to mongodb
mongoose
  .connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log("Mongodb is connected"))
  .catch(err => console.log(err));

//use routes
app.use("/api/users", users);
app.use("/api/auth", auth);
app.use("/api/company", company);
app.use("/api/posts", post);
app.use("/api/polls", poll);
app.use("/api/projects", project);

//middleware to handle unknown errors
// const errorHandler = (err, req, res, next) => {
//   res.json({ error: err, msg: 'An unknown error occured' })
// }
// app.use(errorHandler)

//Serve static assets if in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client", "build")));
  app.get("/service-worker.js", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "build", "service-worker.js"));
  });
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client", "build", "index.html"));
  });
}

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Port is working at ${port}`);
});
