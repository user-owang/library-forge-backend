const { db } = require("../utils/db.server");

// Creates new user with given username, password (hashed), and email. Returns new user's username.

const createUser = async (username, password, email) => {
  return db.user.create({
    data: {
      username,
      password,
      email,
    },
    select: {
      username: true,
    },
  });
};

// Finds user with given email and password (hashed). Returns matching user's username or empty set.

const authUser = async (email) => {
  return db.user.findUnique({
    where: {
      email,
    },
    select: {
      username: true,
      password: true,
    },
  });
};

const getUser = async (username) => {
  return db.user.findUnique({
    where: { username },
    include: {
      decks: true,
      likes: {
        include: {
          decks: true,
        },
      },
    },
  });
};

const updateUser = async (username, data) => {
  return db.user.update({
    where: { username },
    data,
    select: {
      username: true,
    },
  });
};

const userLikeDeck = async (username, deckID) => {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
    },
  });
  const userID = user.id;
  return db.userLikeDeck.create({
    data: {
      userID,
      deckID,
    },
    select: {
      userID: true,
    },
  });
};

const userUnlikeDeck = async (username, deckID) => {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
    },
  });
  const userID = user.id;
  return db.userLikeDeck.delete({
    where: {
      userID,
      deckID,
    },
    select: {
      userID: true,
    },
  });
};

const getLikedDecks = async (userID) => {
  return db.userLikeDeck.findMany({
    where: { userID },
    select: {
      deckID: true,
    },
  });
};

module.exports = {
  createUser,
  authUser,
  getUser,
  updateUser,
  userLikeDeck,
  userUnlikeDeck,
  getLikedDecks,
};
