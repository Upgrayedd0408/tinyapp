const bcrypt = require("bcryptjs");


// set's how many salt rounds being used during hashing.
const salt = bcrypt.genSaltSync(10);


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




module.exports = { users, urlDatabase };