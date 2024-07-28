"use strict";

import jsonschema from "jsonschema";

import express from "express";
const router = new express.Router();
import { BadRequestError, UnauthorizedError, NotFoundError, ForbiddenError } from "../../expressError";
import * as UserService from "../models/user.service"
import { ensureLoggedIn } from "../../middleware/auth";
import editUserSchema from "../../schemas/editUser.json"
import bcrypt from "bcrypt"
require('dotenv').config()
const BCRYPT_WORK_FACTOR = process.env.BCRYPT_WORK_FACTOR


/** GET users/:username => { user }
 *
 * Returns user object matching username including created and liked decks
 *
 * Authorization required: Logged in
 */

router.get("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    const user = UserService.getUser(req.params.username)
    if (user === null){
      throw new NotFoundError
    }
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** PATCH users/:username {password, data} => { user }
 * 
 * Accepts json object with password and data to update which contains username and email
 * Returns user object matching username including created and liked decks
 *
 * Authorization required: Correct user
 */

router.patch("/:username", ensureLoggedIn, async function (req, res, next) {
  try {
    if (res.locals.user.username !== req.params.username) {
      throw new ForbiddenError
    }
    const validator = jsonschema.validate(req.body, editUserSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const {password, data} = req.body
    hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
    const authUsername = await UserService.authUser(email, hashedPassword);
    if (authUsername === null){
      throw new UnauthorizedError()
    }
    const user = UserService.updateUser(req.params.username,data)
    if (user === null){
      throw new NotFoundError
    }
    return res.json({ user });
  } catch (err) {
    return next(err);
  }
});

/** POST users/like/:deckID => { userLikes }
 * 
 * Creates a UserDeckLike for the logged in user returns a list of liked deckIDs
 *
 * Authorization required: logged in
 */

router.post("/like/:deckID", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = res.locals.user.username
    const user = await UserService.userLikeDeck(username,req.params.deckID)
    const likedDecks = await UserService.getLikedDecks(user.id)
    const userLikes = likedDecks.map(d=>d.deckID)
    return res.json({ userLikes });
  } catch (err) {
    return next(err);
  }
});

/** DELETE users/like/:deckID => { userLikes }
 * 
 * Deletes a UserDeckLike for the logged in user returns a list of liked deckIDs
 *
 * Authorization required: logged in
 */

router.delete("/like/:deckID", ensureLoggedIn, async function (req, res, next) {
  try {
    const username = res.locals.user.username
    const user = await UserService.userUnlikeDeck(username,req.params.deckID)
    const likedDecks = await UserService.getLikedDecks(user.id)
    const userLikes = likedDecks.map(d=>d.deckID)
    return res.json({ userLikes });
  } catch (err) {
    return next(err);
  }
});



module.exports = router;
