import {db} from "../utils/db.server"

export const createDeck = async (deck) =>{
  
  return db.deck.create({
    data: deck,
    select: {
      id: true
    }
  })
}

export const getDeck = async (id) => {
  return db.deck.findUnique({
    where: {id},
    include: {
      creator: true
    }
  })
}

export const updateDeck = async (id,data) => {
  return db.deck.update({
    where: {id},
    data,
    include:{
      creator: true
    }
  })
}

export const getDeckList = async (deckID) => {
  return db.deckCard.findMany({
    where:{deckID},
    include: {
      card:true,
      deck:true
    }
  })
}

export const addCardToDeck = async (data) => {
  return db.deckCard.create({
    data
  })
}

export const addNewCard = async (cardData) => {
  const exisitingCard = await db.card.findUnique({
    where:{
      id: cardData.id
    }
  })

  if(exisitingCard !== null){
    return true
  }
  
  let uploadData = {}
  if (cardData.arena_id !== undefined){
    uploadData["arenaID"] = cardData.arena_id
  }
  uploadData['id'] = cardData.id
  uploadData['oracleID'] = cardData.oracle_id
  uploadData['name'] = cardData.name
  uploadData['cmc'] = cardData.cmc
  uploadData['manaCost'] = cardData.mana_cost
  uploadData['colorIdentity'] = cardData.color_identity
  uploadData['typeLine'] = cardData.type_line

  
  const newCard = await db.card.create({
    data: uploadData,
  })

  return true
}

export const updateDeckCard = async (deckID, cardID, data) => {
  return db.deckCard.update({
    where: {deckID, cardID},
    data,
    select: {
      deckID: true,
      cardID: true
    }
  })
}