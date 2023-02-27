/* eslint-disable camelcase */
const express = require("express");
const morgan = require("morgan");
const app = express();
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const { getUserByEmail, urlsForUser, generateRandomString } = require("./helpers");
const { urlDatabase, users } = require("./dataBase");
const PORT = 8080;

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieSession({
  name: "cookiemonster",
  keys: ["thisisveryfunnyhahahahahaha", "nosleep"]
}));
app.use(express.json());


//Homepage
app.get("/", (req, res) => {
  res.redirect('/urls');
});

//Browse
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const urls = urlsForUser(userId, urlDatabase);
  const templateVars = { urls, user };
  if (!user) {
    return res.status(403).send("Not logged in!! <a href='/login'>Please Log in!</a>");
  }

  res.render("urls_index", templateVars);
});

//New
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  
  if (!user) {
    return res.redirect("/login");
  }

  const templateVars = { user };
  res.render("urls_new", templateVars);
});

//show
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;
  const user = users[userId];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[id]["longURL"],
    user: users[req.session.user_id]
  };

  if (!user) {
    return res.send("Please log in.");
  }
  
  res.render("urls_show", templateVars);
});


//Read all
app.post("/urls", (req, res) => {
  const urlId = generateRandomString();
  const userID = req.session.user_id;
  const user = users[userID];

  if (!user) {
    return res.send("Please log in.");
  }
  const longURL = req.body.longURL;
  urlDatabase[urlId] = { longURL, userID };
  res.redirect("/urls",);
});

//short url
app.get("/u/:id", (req, res) => {
  const urlObject = urlDatabase[req.params.id];

  if (!urlObject) {
    return res.send("You need to log in to create new URL.");
  }
  
  res.redirect(urlObject.longURL);
});
//Update-post
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  const userId = req.session.user_id;
  const user = users[userId];
  
  if (!user) {
    return res.send("You need to log in.");
  }

  if (!urlDatabase[id]) {
    return res.send("URL does not exit!");
  }
  urlDatabase[id].longURL = longURL;
  res.redirect("/urls");
});
//Delete-post
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  const userId = req.session.user_id;
  const user = users[userId];

  if (!user) {
    return res.send("You need to log in to delete a post. <a href='/login'>Log in!</a>");
  }
  if (!urlDatabase[id]) {
    return res.send("URL does not exit!");
  }
  if (urlDatabase[id].userID !== userId) {
    return res.send("You dont own this URL.");
  }
 
  delete urlDatabase[id];
  res.redirect('/urls');
});


//login
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  if (user) {
    return res.redirect("/urls");
  }
  res.render("login", {user: null});
});


//register
app.get("/register", (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render('register', templateVars);
});


//API
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!user) {
    return res.status(400).send("User not found. <a href='/login'>Try again!</a>");
  }
  const correctPassword = bcrypt.compareSync(password, user.password);

  if (!email || !password) {
    return res.status(400).send("Email or password not match. <a href='/login'>Try again!</a>");
  }
  if (correctPassword === false) {
    return res.status(400).send("Bad email or password. <a href='/login'>Try again!</a>");
  }

  req.session.user_id = user.id;
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { password, email } = req.body;
  const user = getUserByEmail(email, users);

  if (!email || !password) {
    return res.status(400).send("Please provide an email AND password. <a href='/login'>Try again!</a>");
  }

  if (user) {
    return res.status(400).send("The user already exists. <a href='/login'>Try again!</a>");
  }

  const hashPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id,
    email,
    password: hashPassword,
  };
  console.log(newUser);
  users[id] = newUser;
  req.session.user_id = id;
  res.redirect("/login");
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

module.exports = urlDatabase;