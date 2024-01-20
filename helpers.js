  // check our user database to see if the email address already exists.
  const findUserByEmail = (email, users) => {
    for (const userId in users) {
      const user = users[userId];
      if (user.email === email) {
        return user;
      }
    }
  
    return null;
  };

  // const urlsForUser = (userId) => {
  //   let userUrls = {};
  //   for (const url in urlDatabase) {
  //     if (urlDatabase[url].userID === userId) {
  //       userUrls[url] = urlDatabase[url];
  //     };
  //   };
  //   return userUrls;
  // };







  module.exports = { findUserByEmail };
 // module.exports = urlsForUser;