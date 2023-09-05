const express = require("express");
const path = require("path");
const favicon = require("serve-favicon");
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const ejsLayout = require("express-ejs-layouts");
const db = require("../week 11/mongo db/connection");
const session = require("express-session");
// const busboy = require('busboy-body-parser')
const nocache = require("nocache");

const users = require("./routes/users");
const admin = require("./routes/admin");

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.set("layout", "./layout/layout");
app.set("partials", "./partials");
app.set("views-user", path.join(__dirname, "views/user"));
app.set("views-admin", path.join(__dirname, "views/admin"));
app.use(ejsLayout);
// app.use(busboy())

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
db.connect();
app.use(nocache());

app.use(
  session({
    resave: false,
    secret: "key",
    saveUninitialized: true,
  })
);
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );
  res.setHeader("Expires", "0");
  res.setHeader("Pragma", "no-cache");
  next();
});

app.use("/", users);
app.use("/admin", admin);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error("Not Found");
  err.status = 404;
  next(err);
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
