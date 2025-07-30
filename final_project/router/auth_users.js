const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const session = require("express-session");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.find((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.find(
    (user) => user.username === username && user.password === password
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in." });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign(
      {
        data: username,
      },
      "fingerprint_customer",
      {
        expiresIn: 60 * 60,
      }
    );

    req.session.authorization = {
      accessToken,
      username,
    };

    return res.status(200).json({ message: "User successfully logged in." });
  } else {
    return res
      .status(208)
      .json({ message: "Invalid login. Check username and password." });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;

  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  const bookReviews = books[isbn].reviews;
  bookReviews[username] = review;

  return res.status(200).json({ message: "Successfully added review." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  const bookReviews = books[isbn].reviews;
  delete bookReviews[username];

  return res.status(200).json({ message: "Deleted review successfully." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
