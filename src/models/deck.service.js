import {db} from "../utils/db.server"

export const createDeck = async (username,password,email) =>{
  return db.user.create({
    data: {
      username,
      password,
      email
    },
    select: {
      username: true
    }
  })
}