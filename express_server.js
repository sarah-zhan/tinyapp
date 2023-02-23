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

// const getUserByEmail = () => {
//   let foundUser = null;
//   for (const userId in users) {
//     const user = users[userId];
//     if (user.email) {
//       return true;
//     }
//   }
//   return false;
// };
  
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
  const templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"], user: users[req.cookies["user_id"]] };
  res.render("urls_index", templateVars);
});

//New
app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"], user: users[req.cookies["user_id"]] };
  res.render("urls_new", templateVars);
});

//show
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user_id: req.cookies["user_id"]
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
// app.get("/urls", (req, res) => {
//   const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id], username: req.cookies["userid"] };
//   res.redirect("/urls")
// })
//Read one
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
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
  console.log('test');
  const templateVars = {
    "user_id": req.cookies["user_id"],
  };
  res.render("login", templateVars);
});

//logout
app.get("/logout", (req, res) => {
  const templateVars = { urls: urlDatabase, "user_id": req.cookies["user_id"] };
  res.render("login", templateVars);
});

//register
app.get("/register", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    "user_id": req.cookies["user_id"]
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

  let foundUser = null;
  for (const userId in users) {
    const user = users[userId];
    if (user.email === email) {
      foundUser = user;
    }
  }

  // cannot find a user
  if (!foundUser) {
    return res.status(400).send("no user found");
  }

  if (foundUser.password !== password) {
    return res.status(403).send("passwords do not match.");
  }
  res.cookie("user_id", foundUser.id);
  res.redirect("/urls");
});


app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  users[user_id] = {};
  users[user_id]["id"] = user_id;
  users[user_id]["email"] = req.body.email;
  users[user_id]["password"] = req.body.password;

  if (!req.body.email || !req.body.password) {
    return res.status(400).send("Please provide an email AND password");
  }
  
  let foundUser = null;
  for (const user_id in users) {
    const user = users[user_id];
    if (user) {
      foundUser = user;
    }
  }
  
  if (foundUser) {
    return res.status(400).send("The user already exists.");
  }
  
  //need bcrypt
  res.cookie("user_id", user_id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {

  res.clearCookie("user_id");
  res.redirect("/login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

