const express = require('express');
const app = express();
const PORT = 8080; // default port 8080;
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
  user2RandomID: {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  }
};

  // check our user database to see if the email address already exists.
  const findUserByEmail = (email, users) => {
    for (const userId in users) {
      const user = users[userId];
      if (user.email === email) {
        return user;
      }
    }
  
    return null;
  }

app.get("/", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  if (user) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  };
  
  //res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = { 
    user,
    urls: urlDatabase,
  };

  if (!user) {
    res.status(403).send("Please login to gain access to our awesome features!");
  };

  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies['user_id'];
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
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const templateVars = { 
    user,
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
   };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  if (urlDatabase.hasOwnProperty(req.params.id)) {
    const longURL = urlDatabase[req.params.id];
    res.redirect(longURL);
  } else {
    res.status(404).send("Id does not exist");
  };
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body</html>\n");
});

app.get("/register", (req, res) => {
  const userId = req.cookies['user_id'];
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
  const userId = req.cookies['user_id'];
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
  const userId = req.cookies['user_id'];
  const user = users[userId];

  const id = generateRandomString();
  const longURL = req.body.longURL;

  if (!user) {
    res.status(403).send("Please login to gain access to our awesome features!");
  };
  urlDatabase[id] = longURL;
  res.redirect(`/urls/${id}`);
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // const findUserByEmail = (email, users) => {
  //   for (const userId in users) {
  //     const user = users[userId];
  //     if (user.email === email) {
  //       return user;
  //     }
  //   }
  
  //   return null;
  // };

  const user = findUserByEmail(email, users);

  if (user && user.password === password) {
    res.cookie('user_id', user.id);
    res.redirect("/urls");
  } else {
    res.status(403).send("Email or password is incorrect");
  }

});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.post("/register", (req, res) => {
  //assign user inputs to variables
  const email = req.body.email;
  const password = req.body.password;
  
  // Display error message if user leaves fields blank
  if (!email || !password) {
    return res.status(400).send("Please provide a email and a password");
  };

  // check our user database to see if the email address already exists.
  // const findUserByEmail = (email, users) => {
  //   for (const userId in users) {
  //     const user = users[userId];
  //     if (user.email === email) {
  //       return user;
  //     }
  //   }
  
  //   return null;
  // }

  const user = findUserByEmail(email, users);


  // Display error message if email is already in use
  if (user) {
    return res.status(400).send("A User with that email address already exists");
  }

  const id = generateRandomString();

  // set up a new user using the random ID and user inputs
  const newUser = {
    id,
    email,
    password
  };

  // add new user to user database
  users[id] = newUser;

  console.log(users);

  res.cookie('user_id', id);

  res.redirect("/urls");

});

app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  const shortUrlId = req.params.id;
  const newLongUrl = req.body.longURL;
  if (urlDatabase[shortUrlId]) {
    urlDatabase[shortUrlId] = newLongUrl;
  };
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});


function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};