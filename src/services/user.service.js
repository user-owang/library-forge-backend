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
      id: true,
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
      decks: {
        include: {
          creator: {
            select: { username: true },
          },
          _count: {
            select: { likes: true },
          },
        },
      },
      likes: {
        include: {
          deck: {
            include: {
              creator: {
                select: { username: true },
              },
              _count: {
                select: { likes: true },
              },
            },
          },
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
    include: {
      decks: {
        include: {
          creator: {
            select: { username: true },
          },
          _count: {
            select: { likes: true },
          },
        },
      },
      likes: {
        include: {
          deck: {
            include: {
              creator: {
                select: { username: true },
              },
              _count: {
                select: { likes: true },
              },
            },
          },
        },
      },
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
    include: {
      deck: {
        include: {
          creator: {
            select: { username: true },
          },
          _count: {
            select: { likes: true },
          },
        },
      },
    },
  });
};

const searchUsername = async (term, num, page = 1) => {
  const skip = (page - 1) * num;
  return db.user.findMany({
    where: {
      username: {
        contains: term,
        mode: "insensitive",
      },
    },
    include: { decks: true },
    skip,
    take: num,
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
  searchUsername,
};
