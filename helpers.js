  // check our user database to see if the email address already exists.
  const getUserByEmail = (email, users) => {
    for (const userId in users) {
      const user = users[userId];
      if (user.email === email) {
        return user;
      }
    }
  
    return null;
  };

  const urlsForUser = (userId, urlDatabase) => {
    let userUrls = {};
    for (const url in urlDatabase) {
      if (urlDatabase[url].userID === userId) {
        userUrls[url] = urlDatabase[url];
      };
    };
    return userUrls;
  };

  function generateRandomString() {
    return Math.random().toString(36).substring(2, 8);
  };

  







  module.exports = { getUserByEmail, urlsForUser, generateRandomString };