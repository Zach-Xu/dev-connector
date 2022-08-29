const express = require("express");
const connectDB = require("./config/db");
const bodyParser = require("body-parser");

// import routes
const authRouter = require("./routes/api/auth");
const postsRouter = require("./routes/api/posts");
const profileRouter = require("./routes/api/profile");
const usersRouter = require("./routes/api/users");

const app = express();
connectDB();

const PORT = process.env.PORT || 3002;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("API running");
});

app.use("/", (req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "DELETE, PUT");
  next();
});

app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);
app.use("/api/profile", profileRouter);
app.use("/api/users", usersRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
