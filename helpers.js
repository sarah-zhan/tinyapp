
const getUserByEmail = (email, users) => {
  const userValues = Object.values(users);

  for (const user of userValues) {
    if (user.email === email) {
      return user;
    }
  }
  
};

const urlsForUser = (userId) => {
  const urls = {};
  const ids = Object.keys(urlDatabase);
  for (const id of ids) {
    const url = urlDatabase[id];
    if (url.userID === userId) {
      urls[id] = url;
    }
  }
  return urls;
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

module.exports = { getUserByEmail, urlsForUser, generateRandomString };