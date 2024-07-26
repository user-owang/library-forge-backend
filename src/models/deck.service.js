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
    where: {id}
  })
}

export const updateDeck = async (id,data) => {
  return db.deck.update({
    where: {id},
    data
  })
}