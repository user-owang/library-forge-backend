import { hash } from "crypto"
import {db} from "../utils/db.server"

// Creates new user with given username, password (hashed), and email. Returns new user's username.

export const createUser = async (username,password,email) =>{
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

// Finds user with given email and password (hashed). Returns matching user's username or empty set.

export const authUser = async (email, password) =>{
  return db.user.findUnique({
    where: {
      email,
      password
    },
    select:{
      username: true
    }
  })
}

export const getUser = async (username) => {
  return db.user.findUnique({
    where:{ username },
    include: {
      decks: true,
      likes:{
        include: {
          decks: true
        }
      }
    }
  })
}