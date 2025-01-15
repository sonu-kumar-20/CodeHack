// app.js
// app.js
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const ejsMate = require("ejs-mate");
const User = require("./models/user.js");
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

// Session middleware
app.use(session({
  secret: 'MyCodeHackwebsite@345',
  resave: false,
  saveUninitialized: false, // Better practice for session handling
}));

// Flash middleware
app.use(flash());

// Make flash messages and user object accessible to all views
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null; // Pass user to all templates
  next();
});

// Initialize Passport and session
app.use(passport.initialize());
app.use(passport.session());

// Passport Local Strategy
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// MongoDB connection
const MONGO_URL = "mongodb://localhost:27017/teamproject";
mongoose.connect(MONGO_URL)
  .then(() => console.log("Connected to DB"))
  .catch(err => console.error("DB Connection Error:", err));

// Routes
app.get("/", (req, res) => {
  res.send("Welcome to the main root!");
});

app.get("/teamproject", (req, res) => {
  res.render("pages/main.ejs"); // Main page
});

app.get("/teamprojectt", (req, res) => {
  res.redirect("/teamproject"); // Explore route
});

app.get("/teamproject/practice", (req, res) => {
  res.render("pages/practice.ejs"); // Practice route
});

// Signup routes
app.get("/signup", (req, res) => {
  if (req.isAuthenticated()) {
    req.flash("success", "You are already logged in!");
    return res.redirect("/teamproject");
  }
  res.render("pages/signup.ejs");
});

app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ email, username });
    await User.register(newUser, password);
    req.flash("success", "Welcome to TeamProject!");
    res.redirect("/teamproject");
  } catch (e) {
    req.flash("error", e.message);
    res.redirect('/signup');
  }
});

// Login routes
app.get("/login", (req, res) => {
  if (req.isAuthenticated()) {
    req.flash("success", "You are already logged in!");
    return res.redirect("/teamproject");
  }
  res.render("pages/login.ejs");
});

app.post("/login", passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: true,
}), (req, res) => {
  req.flash("success", "Logged in successfully!");
  res.redirect("/teamproject");
});

// Logout route
app.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) {
      console.error("Logout Error:", err);
      req.flash("error", "An error occurred while logging out.");
      return next(err);
    }
    req.flash('success', 'Logged out successfully!');
    res.redirect('/login');
  });
});

// Start server
app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
