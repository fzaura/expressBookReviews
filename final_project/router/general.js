const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
const { use } = require("react");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
  return users.find((user) => user.username === username);
};

public_users.post("/register", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ username: username, password: password });
      return res.status(200).json({ message: "User successfully registered." });
    } else {
      return res.status(403).json({ message: "Username already in use." });
    }
  } else {
    return res
      .status(403)
      .json({ message: "Please provide a valid username and password." });
  }
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    const allBooks = await getBooks();
    return res.status(200).json(allBooks);
  } catch (error) {
    return res.status(500).json({ message: "error fetching books" });
  }
});
const getBooks = async function () {
  return books;
};

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  const isbn = req.params.isbn;
  try {
    const book = await getBookByISBN(isbn);

    if (book) {
      return res.status(200).json(book);
    } else {
      return res.status(404).json({ message: "Book not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book." });
  }
});
const getBookByISBN = async (ISBN) => {
  return books[ISBN];
};

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author.toLowerCase();
  try {
    const books = await getBooksByAuthor(author);

    if (books.length > 0) {
      return res.status(200).json(books);
    } else {
      return res.status(404).json({ message: "Book not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book." });
  }
});
const getBooksByAuthor = async (author) => {
  const booksArray = Object.values(books);
  return booksArray.filter((book) => book.author.toLowerCase() === author);
};

// Get all books based on title
public_users.get("/title/:title", async function (req, res) {
  const title = req.params.title.toLowerCase();

  try {
    const books = await getBooksByTitle(title);

    if (books.length > 0) {
      return res.status(200).json(books);
    } else {
      return res.status(404).json({ messgae: "Book not found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error fetching book." });
  }
});
const getBooksByTitle = async (title) => {
  const booksArray = Object.values(books);
  return booksArray.filter((book) => book.title.toLowerCase() === title);
};

//  Get book review
public_users.get("/review/:isbn", async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const reviews = await getBookReviewsByISBN(isbn);

    if (reviews) {
      return res.status(200).json(reviews);
    } else {
      return res.status(404).json({ message: "No reviews found." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Error while fetching reviews." });
  }
});
const getBookReviewsByISBN = async (isbn) => {
  const book = await getBookByISBN(isbn);

  if (book) {
    return book.reviews;
  } else {
    return null;
  }
};

module.exports.general = public_users;
