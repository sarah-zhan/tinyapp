/* eslint-disable camelcase */
const { request } = require("express");
const express = require("express");
const morgan = require("morgan");
const app = express();
const cookieParser = require('cookie-parser');
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json());

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

const getUserByEmail = (users) => {
  let foundUser = null;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === users[userId]["email"]) {
      foundUser = user;
    }
  }
  return foundUser;
};
  
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

//Homepage
app.get("/", (req, res) => {
  res.redirect('/urls');
});

//Browse
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

//New
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]] };
  if (!templateVars.user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }

});

//show
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});


//CRUD-API
//Create-post
app.post("/urls/new", (req, res) => {
  const urlId = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[urlId] = longURL;
  urlDatabase["user_id"] = req.cookies["user_id"];
  res.redirect("/urls");
});
//Read all
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Read one
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  if (!longURL) {
    res.send("You need to log in to create new URL.");
  }
  res.redirect(longURL);
});
//Update-post
app.post("/urls/:id/edit", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});
//Delete-post
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});


//login
app.get("/login", (req, res) => {
  const templateVars = {
    user: null,
  };
  res.render("login", templateVars);
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

  if (!email || !password) {
    return res.status(400).send("Please provide an email AND password");
  }
  if (getUserByEmail(users).email !== email) {
    return res.status(403).send("no user found");
  }
  if (getUserByEmail(users).password !== password) {
    return res.status(403).send("passwords do not match.");
  }

  res.cookie("user_id", getUserByEmail(users).id);
  res.redirect("/urls");
});


app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Please provide an email AND password");
  }

  if (getUserByEmail(users).id) {
    return res.status(400).send("The user already exists.");
  }

  const user_id = generateRandomString();
  users[user_id] = {};
  users[user_id]["id"] = user_id;
  users[user_id]["email"] = req.body.email;
  users[user_id]["password"] = req.body.password;
  
  
  //need bcrypt
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

app.get("/logout", (req, res) => {

  res.clearCookie("user_id");
  res.redirect("/login");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

