const express = require("express");
const app = express();
const port = 3000;
const mongoose = require("mongoose");
const User = require("./models/user.model");
const ejsMate = require("ejs-mate");
const path = require("path");
const { render, cookie } = require("express/lib/response.js");
const cors = require("cors");
const bodyparser = require("body-parser");
const { name } = require("ejs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const dotenv = require("dotenv");
dotenv.config();
app.use(
  cors({
    origin: process.env.FRONT_END_URL, // Specific origins for credential requests
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "UPDATE"], // This allows cookies to be sent with requests.
  })
);

app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(bodyparser.json());
app.use(morgan("dev"));
app.use(bodyparser.urlencoded({ extended: true }));
//database url
const MONGO_URL = process.env.MONGODB_URI;

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "public/images");
//   },
//   filename: (req, file, cb) => {
//     cb(null, file.originalname);
//   },
// });

// const upload = multer({ storage: storage });
main()
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

// app.use(express.static("public")); // Serve static files

const authRoutes = require("./routes/auth.route");
const emergencyRoutes = require("./routes/emergency.route");
const requestRoutes = require("./routes/request.route");
const adminRoutes = require("./routes/admin.route");
const userRoutes = require("./routes/user.route");

app.use("/auth", authRoutes);
app.use("/emergency", emergencyRoutes);
app.use("/request", requestRoutes);
app.use("/admin",adminRoutes);
app.use("/api/users", userRoutes);

app.get("/test", (req,res) => {
  res.send("Hellow World");
});

app.listen(3000, () => {
  console.log(`port is listing in ${port}`);
});

module.exports = app;
