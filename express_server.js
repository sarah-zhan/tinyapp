const { request } = require("express");
const express = require("express");
const morgan = require("morgan");
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};
  
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//browse
app.get("/", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//read

//create
app.get("/new", (req, res) => {
  res.render("urls_new");
});

app.post("/new", (req, res) => {
  const urlId = generateRandomString();
  const longURL = req.body.longURL;
  urlDatabase[urlId] = longURL;
  res.redirect("/urls");
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//edit
app.get("/urls/edit/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_edit", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[id] = longURL;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

// app.get("/login", (req, res) => {
//   res.render("/urls");

// });

// app.post("/login", (req, res) => {
//   const username = res.cookie;
//   res.send(username);
//   res.redirect("/urls");
// });
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

