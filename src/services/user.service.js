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

const authUserEmail = async (email) => {
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

const authUserUsername = async (username) => {
  return db.user.findUnique({
    where: {
      username,
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
          deck: true,
        },
      },
    },
  });
};

const deleteUser = async (username) => {
  return db.user.delete({
    where: {
      username,
    },
    select: {
      id: true,
      username: true,
    },
  });
};

const updateUser = async (username, data) => {
  return db.user.update({
    where: { username },
    data,
    select: {
      username: true,
      email: true,
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
  return db.userDeckLike.create({
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
  return db.userDeckLike.delete({
    where: {
      userID_deckID: {
        userID,
        deckID,
      },
    },
    select: {
      userID: true,
    },
  });
};

const getLikedDecks = async (userID) => {
  return db.userDeckLike.findMany({
    where: { userID },
    select: {
      deckID: true,
    },
  });
};

module.exports = {
  createUser,
  authUserEmail,
  authUserUsername,
  getUser,
  deleteUser,
  updateUser,
  userLikeDeck,
  userUnlikeDeck,
  getLikedDecks,
};
