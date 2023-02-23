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
  
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Homepage
app.get("/", (req, res) => {
  res.redirect('/urls')
});

//Browse
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//New
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//show
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

//CRUD-API
//Create-post
app.post("/urls/new", (req, res) => {
  const urlId = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[urlId] = longURL;
  res.redirect("/urls");
});
//Read all
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
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
// app.get("/login", (req, res) => {
//   res.render("login");

// });

//logout
app.get("/logout", (req, res) => {
  res.render("logout");

});

//API
app.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  
  res.cookie("userid", "need to update later")
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

