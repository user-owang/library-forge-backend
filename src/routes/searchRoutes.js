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

/** POST /search/ac/users/:term => { autocomplete: [username, username ...] }
 *
 * Accepts a string (term) and returns a list of at most 20 autocompleted users in results
 *
 * Authorization required: none
 */

router.post("/ac/users/:term", async function (req, res, next) {
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

/** POST /autocomplete/decks/:term => { autocomplete: [deckName, deckName ...] }
 *
 * Accepts a string (term) and returns a list of at most 20 autocompleted decks in results
 *
 * Authorization required: none
 */

router.post("/ac/decks/:term", async function (req, res, next) {
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

module.exports = router;
