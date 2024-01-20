const express = require('express');
const app = express();
const PORT = 8080; // default port 8080;
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { getUserByEmail, urlsForUser, generateRandomString } = require('./helpers');


app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ['randomkey1', 'randomkey2']
}));

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW",
  },
};

// set's how many salt rounds being used during hashing.
const salt = bcrypt.genSaltSync(10);


const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple-monkey-dinosaur', salt)
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk', salt)
  },
  aJ48lW: {
    id: 'aJ48lW',
    email: 'user3@example.com',
    password: bcrypt.hashSync('123', salt)
  }
};


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
  } else {
    res.status(404).send("Id does not exist");
    return
  };
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body</html>\n");
// });

app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  const user = users[userId];

  const templateVars = {
    user
  };

  if (user) {
    res.redirect("/urls");
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
  console.log(urlDatabase);
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
  } else {
    res.status(403).send("Email or password is incorrect");
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
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  // Display error message if user leaves fields blank
  if (!email || !password) {
    return res.status(400).send("Please provide a email and a password");
  };

  console.log(getUserByEmail);
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

  console.log(users);

  //res.session('user_id', id);
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
