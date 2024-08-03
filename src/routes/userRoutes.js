"use strict";

const jsonschema = require("jsonschema");

const express = require("express");
const { createToken } = require("../../helpers/tokens");
const router = new express.Router();
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} = require("../../expressError");
const UserService = require("../services/user.service");
const {
  ensureLoggedIn,
  ensureCorrectUser,
  ensureCorrectPassword,
} = require("../../middleware/auth");
const editUserSchema = require("../../schemas/editUser.json");
const bcrypt = require("bcrypt");
require("dotenv").config();
const BCRYPT_WORK_FACTOR = parseInt(process.env.BCRYPT_WORK_FACTOR);

/** POST users/like/:deckID => { userLikes }
 *
 * Creates a UserDeckLike for the logged in user returns a list of liked deckIDs
 *
 * Authorization required: logged in
 */

router.post("/like/:deckID", ensureLoggedIn, async function (req, res, next) {
  try {
    const { id, username } = res.locals.user;
    await UserService.userLikeDeck(username, req.params.deckID);
    const likedDecks = await UserService.getLikedDecks(id);
    const userLikes = likedDecks.map((d) => d.deckID);
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
    const { id, username } = res.locals.user;
    await UserService.userUnlikeDeck(username, req.params.deckID);
    const likedDecks = await UserService.getLikedDecks(id);
    const userLikes = likedDecks.map((d) => d.deckID);
    return res.json({ userLikes });
  } catch (err) {
    return next(err);
  }
});

/** GET users/:username => { user }
 *
 * Returns user object matching username including created and liked decks
 *
 * Authorization required: none
 */

router.get("/:username", async function (req, res, next) {
  try {
    const user = await UserService.getUser(req.params.username);
    if (user === null) {
      throw new NotFoundError();
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
 * Authorization required: Correct user, correct password
 */

router.patch(
  "/:username",
  ensureCorrectUser,
  ensureCorrectPassword,
  async function (req, res, next) {
    try {
      const validator = jsonschema.validate(req.body, editUserSchema);
      if (!validator.valid) {
        const errs = validator.errors.map((e) => e.stack);
        throw new BadRequestError(errs);
      }
      const user = await UserService.updateUser(
        req.params.username,
        req.body.data
      );
      if (user === null) {
        throw new NotFoundError();
      }
      const token = createToken(user);
      return res.json({ token });
    } catch (err) {
      return next(err);
    }
  }
);

/** DELETE users/:username { password } =>
 *
 * Deletes user.
 *
 * Authorization required: Correct user
 */

router.delete(
  "/:username",
  ensureCorrectUser,
  ensureCorrectPassword,
  async function (req, res, next) {
    try {
      const user = await UserService.deleteUser(req.params.username);
      if (user === null) {
        throw new ForbiddenError();
      }
      return res.json({ status: "success" });
    } catch (err) {
      return next(err);
    }
  }
);

module.exports = router;
