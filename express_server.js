/* eslint-disable camelcase */
const { request } = require("express");
const express = require("express");
const morgan = require("morgan");
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
const PORT = 8080;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};


const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "userRandomID",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "456",
  },
};

const getUserByEmail = (email) => {
  for (const id in users) {
    const user = users[id];
    if (user.email === email) {
      return user;
    }
  }
};

const urlsForUser = (userId) => {
  const urls = {};
  const ids = Object.keys(urlDatabase);
  for (const id of ids) {
    const url = urlDatabase[id];
    if (url.userID === userId) {
      urls[id] = url;
    }
  }
  return urls;
};

//Homepage
app.get("/", (req, res) => {
  res.redirect('/urls');
});

//Browse
app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  const urls = urlsForUser(userId);
  const templateVars = { urls, user };
  if (!user) {
    return res.status(302).send("Not logged in!!");
  }

  res.render("urls_index", templateVars);
});

//New
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
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
  const userId = req.cookies.user_id;
  const user = users[userId];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[id]["longURL"],
    user: users[req.cookies["user_id"]]
  };

  if (!user) {
    return res.send("Please log in.");
  }
  // longURL not belong to the user, should not show
  if (!urlsForUser(userId)) {
    return res.send("You don't own this URL.");
  }

  res.render("urls_show", templateVars);
});


//CRUD-API
//Create-post
app.post("/urls/new", (req, res) => {
  const urlId = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[urlId] = { longURL, userID: req.cookies.user_id };

  res.redirect("/urls");
});
//Read all
app.get("/urls", (req, res) => {
  res.json(urlDatabase);
});

//Read one
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  const userId = req.cookies.user_id;
  const user = users[userId];
  if (!longURL) {
    res.send("You need to log in to create new URL.");
  }
  res.redirect(longURL);
});
//Update-post
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  const userId = req.cookies.user_id;
  const user = users[userId];
  
  if (!user) {
    return res.send("You need to log in.");
  }
  if (!urlsForUser(id)) {
    return res.send("You don't own this URL.");
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
  const userId = req.cookies.user_id;
  const user = users[userId];

  if (!user) {
    return res.send("You need to log in to delete a post.");
  }
  if (!urlsForUser(id)) {
    return res.send("You don't own this URL.");
  }
  if (!urlDatabase[id]) {
    return res.send("URL does not exit!");
  }

  if (urlDatabase.id.userID === urlsForUser(userId).userID) {
    delete urlDatabase[id];
  }
  res.redirect('/urls');
});


//login
app.get("/login", (req, res) => {
  const userId = req.cookies.user_id;
  const user = users[userId];
  if (user) {
    return res.redirect("/url");
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
  const user = getUserByEmail(email);
  const correctPassword = bcrypt.compareSync(password, user.password);


  if (!user || correctPassword === false) {
    return res.status(400).send("Bad email or password");

  }

  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const { password, email } = req.body;
  const user = getUserByEmail(email);

  if (!email || !password) {
    return res.status(400).send("Please provide an email AND password");
  }

  if (getUserByEmail(email)) {
    return res.status(400).send("The user already exists.");
  }

  const hashPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id,
    email,
    password: hashPassword,
  };
  users[id] = newUser;
  res.redirect("/login");
});


app.get("/logout", (req, res) => {

  res.clearCookie("user_id");
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

