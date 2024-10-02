"use strict";

const express = require("express");
const router = new express.Router();
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
  ForbiddenError,
} = require("../../expressError");
const UserService = require("../services/user.service");
const DeckService = require("../services/deck.service");

/** GET /search/ac/users/:term => { autocomplete: [user, user ...] }
 *
 * Accepts a string (term) and returns a list of at most 20 autocompleted users in results
 *
 * Authorization required: none
 */

router.get("/ac/users/:term", async function (req, res, next) {
  try {
    const term = req.params.term;
    if (term.length < 3) {
      return res.json({ autocomplete: [] });
    }
    const autocomplete = await UserService.searchUsername(term, 20);
    return res.json({ autocomplete });
  } catch (err) {
    return next(err);
  }
});

/** GET /search/ac/decks/:term => { autocomplete: [deck, deck ...] }
 *
 * Accepts a string (term) and returns a list of at most 20 autocompleted decks in results
 *
 * Authorization required: none
 */

router.get("/ac/decks/:term", async function (req, res, next) {
  try {
    const term = req.params.term;
    if (term.length < 3) {
      return res.json({ autocomplete: [] });
    }
    const autocomplete = await DeckService.searchDeckName(term, 20);
    return res.json({ autocomplete });
  } catch (err) {
    return next(err);
  }
});

/** GET /search/users/:term/:page => { autocomplete: [deckName, deckName ...] }
 *
 * Accepts a string (term) and int page and returns a list of at most 60 matching users in results
 *
 * Authorization required: none
 */

router.get("/users/:term/:page", async function (req, res, next) {
  try {
    const term = req.params.term;
    const page = parseInt(req.params.page);
    const data = await UserService.searchUsername(term, 175, page);
    return res.json({ data });
  } catch (err) {
    return next(err);
  }
});

/** GET /autocomplete/decks/:term => { autocomplete: [deckName, deckName ...] }
 *
 * Accepts a string (term) and int page and returns a list of at most 60 matching decks in results
 *
 * Authorization required: none
 */

router.get("/decks/:term/:page", async function (req, res, next) {
  try {
    const term = req.params.term;
    const page = parseInt(req.params.page);
    const data = await DeckService.searchDeckName(term, 175, page);
    return res.json({ data });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
