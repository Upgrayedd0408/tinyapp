const express = require('express');
const app = express();
const PORT = 8080; // default port 8080;
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');
const { users, urlDatabase } = require('./in-memory-db');


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['randomkey1', 'randomkey2'],
}));


// set's how many salt rounds being used during hashing.
const salt = bcrypt.genSaltSync(10);

// const date = Date("1995-12-17T03:24:00");

// console.log(date);



app.get("/", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  // checks if user is logged in
  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  };
  
});

app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];


  const templateVars = { 
    user,
    urls: urlsForUser(userId, urlDatabase),
  };

  // Checks to see if the user is not logged in
  if (!user) {
    res.status(403).send("Please login to gain access to our awesome features!");
    return;
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  const templateVars = {
    user,
  };

  if (!user) {
    res.redirect("/login");
    return;
  };

  res.render("urls_new", templateVars);
});

app.get("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (!user) {
    res.status(403).send("Please login to gain access to our awesome features!");
    return
  };

  // Check to see if the urlDatabase contains the id passed into the domain
  if (urlDatabase.hasOwnProperty(req.params.id)) {
    if (urlDatabase[req.params.id].userID !== userId) {
      res.status(403).send("You do not have access to edit this link");
      return
    };
  } else {
    res.status(404).send("Id does not exist");
    return
  };


  const templateVars = { 
    user,
    id: req.params.id, 
    longURL: urlDatabase[req.params.id].longURL,
   };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  // Check to see if the urlDatabase contains the id passed into the domain
  if (urlDatabase.hasOwnProperty(req.params.id)) {
    const longURL = urlDatabase[req.params.id].longURL;
    res.redirect(longURL);
    return
  } else {
    res.status(404).send("Id does not exist");
    return
  };
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});


app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  const templateVars = {
    user
  };

  if (user) {
    res.redirect("/urls");
    return
  };

  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  
  const templateVars = {
    user
  };

  if (user) {
    res.redirect("/urls");
    return
  };

  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  // Creates a random string to be used as the urlDatabase Id
  const id = generateRandomString();
  let longURL = req.body.longURL;

  if (!user) {
    res.status(403).send("Please login to gain access to our awesome features!");
    return;
  };

  if (!longURL.startsWith('http://') && !longURL.startsWith('https://')) {
    longURL = 'http://' + longURL;
  };

  urlDatabase[id] = {
    longURL,
    userID: userId
  };

  res.redirect(`/urls/${id}`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // Looks up the user object based on the email address.
  const user = getUserByEmail(email, users);

  // Checks to see if the user exists and if the hashed passwords match
  if (user && bcrypt.compareSync(password, user.hashedPassword)) {
    req.session.user_id = user.id;
    res.redirect("/urls");
    return
  } else {
    res.status(403).send("Email or password is incorrect");
    return
  };

});

app.post("/logout", (req, res) => {
  // sets cookies to null
  req.session.user_id = null;
  res.redirect('/login');
});

app.post("/register", (req, res) => {
  //assign user inputs to variables
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, salt);
  
  // Display error message if user leaves fields blank
  if (!email || !password) {
    return res.status(400).send("Please provide a email and a password");
  };


  const user = getUserByEmail(email, users);


  // Display error message if email is already in use
  if (user) {
    return res.status(400).send("A User with that email address already exists");
  }

  const id = generateRandomString();

  // set up a new user using the random ID and user inputs
  const newUser = {
    id,
    email,
    hashedPassword
  };

  // add new user to user database
  users[id] = newUser;

  req.session.user_id = id;

  res.redirect("/urls");

});

app.post("/urls/:id/delete", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  if (!user) {
    res.status(403).send("Please login to gain access to our awesome features!");
    return
  };

  if (urlDatabase.hasOwnProperty(req.params.id)) {
    if (urlDatabase[req.params.id].userID !== userId) {
      res.status(403).send("You do not have access to edit this link");
      return
    };
  } else {
    res.status(404).send("Id does not exist");
    return
  };

  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];
  const shortUrlId = req.params.id;
  const newLongUrl = req.body.longURL;

  if (!user) {
    res.status(403).send("Please login to gain access to our awesome features!");
    return
  };

  if (urlDatabase.hasOwnProperty(req.params.id)) {
    if (urlDatabase[req.params.id].userID !== userId) {
      res.status(403).send("You do not have access to edit this link");
      return
    };
  } else {
    res.status(404).send("Id does not exist");
    return
  };

  if (urlDatabase[shortUrlId]) {
    urlDatabase[shortUrlId].longURL = newLongUrl;
  };
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});
