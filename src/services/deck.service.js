const { db } = require("../utils/db.server");

const createDeck = async (deck) => {
  return db.deck.create({
    data: deck,
    select: {
      id: true,
    },
  });
};

const getDeck = async (id) => {
  return db.deck.findUnique({
    where: { id },
    include: {
      creator: true,
      deckCard: true,
      likes: true,
    },
  });
};

const updateDeck = async (id, data) => {
  return db.deck.update({
    where: { id },
    data,
    include: {
      creator: true,
    },
  });
};

const deleteDeck = async (id) => {
  return db.deck.delete({
    where: { id },
    select: {
      id: true,
    },
  });
};

const getDeckList = async (deckID) => {
  return db.deckCard.findMany({
    where: { deckID },
    include: {
      card: true,
      deck: true,
    },
  });
};

const addCardToDeck = async (deckID, cardID, boardType) => {
  return db.deckCard.create({
    data: {
      deckID,
      cardID,
      boardType,
    },
  });
};

const addNewCard = async (cardData) => {
  const exisitingCard = await db.card.findUnique({
    where: {
      id: cardData.id,
    },
  });

  if (exisitingCard !== null) {
    return true;
  }

  let uploadData = {};
  if (cardData.arena_id !== undefined) {
    uploadData["arenaID"] = cardData.arena_id;
  }
  uploadData["id"] = cardData.id;
  uploadData["oracleID"] = cardData.oracle_id;
  uploadData["name"] = cardData.name;
  uploadData["cmc"] = cardData.cmc;
  uploadData["manaCost"] = cardData.mana_cost;
  uploadData["colorIdentity"] = cardData.color_identity;
  uploadData["typeLine"] = cardData.type_line;

  const newCard = await db.card.create({
    data: uploadData,
  });

  return true;
};

const updateDeckCard = async (deckID, cardID, data) => {
  return db.deckCard.update({
    where: { deckID, cardID },
    data,
    select: {
      deckID: true,
      cardID: true,
    },
  });
};

const deleteDeckCard = async (deckID, cardID) => {
  return db.deckCard.delete({
    where: {
      deckID,
      cardID,
    },
  });
};

const getRecentDecks = async () => {
  const min60Decks = await db.deckCard.groupBy({
    by: ["deckID"],
    _sum: {
      quantity: true,
    },
    where: {
      boardType: "deck",
    },
    having: {
      quantity: {
        _sum: {
          gte: 60,
        },
      },
    },
  });

  const deckIds = min60Decks.map((d) => d.deckID);

  const recentDecks = await db.deck.findMany({
    where: {
      id: {
        in: deckIds,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 20,
    include: {
      deckCard: true,
      creator: true,
      likes: true,
    },
  });
  return recentDecks;
};

const getMostLikeDecks = async () => {
  const mostLikedDecks = await db.userDeckLike.groupBy({
    by: ["deckID"],
    _count: {
      deckID: true,
    },
    orderBy: {
      _count: {
        deckID: "desc",
      },
    },
    take: 20,
  });

  const deckIds = mostLikedDecks.map((d) => d.deckID);

  const topDecks = await db.deck.findMany({
    where: {
      id: {
        in: deckIds,
      },
    },
    include: {
      creator: true, // Include creator details if needed
      deckCard: true, // Include deckCard details if needed
      likes: true, // Include likes if needed
    },
  });

  return topDecks;
};

module.exports = {
  createDeck,
  updateDeck,
  getDeck,
  deleteDeck,
  getDeckList,
  addCardToDeck,
  addNewCard,
  updateDeckCard,
  getRecentDecks,
  getMostLikeDecks,
  deleteDeckCard,
};
