"use strict";

const jsonschema = require("jsonschema");

const express = require("express");
const router = new express.Router();
const newDeckSchema = require("../../schemas/newDeck.json");
const editDeckSchema = require("../../schemas/editDeck.json");
const cardObjectLinkSchema = require("../../schemas/cardObjectLink.json");
const editDeckCardSchema = require("../../schemas/editDeckCard.json");
const {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} = require("../../expressError");
const DeckService = require("../services/deck.service");
const { ensureLoggedIn, ensureDeckCreator } = require("../../middleware/auth");
const axios = require("axios");

/** POST /decks/:  { name, description, imgURL, format } => { deck }
 *
 * Returns newly created deck object.
 *
 * Authorization required: Logged in
 */

router.post("/", ensureLoggedIn, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, newDeckSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const newDeck = await DeckService.createDeck(req.body);
    return res.json({ newDeck });
  } catch (err) {
    return next(err);
  }
});

/** GET /decks/recent => { recentDecks: [deck, deck] }
 *
 * Returns the 20 most recently created decks that have at least 60 cards.
 *
 * Authorization required: none
 */

router.get("/recent", async function (req, res, next) {
  try {
    const recentDecks = await DeckService.getRecentDecks();
    return res.status(200).json({ recentDecks });
  } catch (err) {
    return next(err);
  }
});

/** GET /decks/top => { likedDecks: [deck, deck] }
 *
 * Returns the 20 most liked decks.
 *
 * Authorization required: none
 */

router.get("/top", async function (req, res, next) {
  try {
    const likedDecks = await DeckService.getTopDecks();
    return res.status(200).json({ likedDecks });
  } catch (err) {
    return next(err);
  }
});

/** GET /decks/:id => { deck }
 *
 * Returns deck object with id=req.params.id .
 *
 * Authorization required: none
 */

router.get("/:id", async function (req, res, next) {
  try {
    const deck = await DeckService.getDeck(req.params.id);
    if (deck) {
      return res.json({ deck });
    } else {
      throw new NotFoundError();
    }
  } catch (err) {
    return next(err);
  }
});

/** PUT /decks/:id  { name, description, imgURL, format } => { deck }
 *
 * Returns newly edited deck object.
 *
 * Authorization required: correct user
 */

router.put("/:id", ensureDeckCreator, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, editDeckSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    await DeckService.updateDeck(req.params.id, req.body);
    const updatedDeck = await DeckService.getDeck(req.params.id);
    return res.status(200).json({ updatedDeck });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /decks/:id => { status: success }
 *
 * Deletes deck (all deckCards cascade on delete).
 *
 * Authorization required: correct user
 */

router.delete("/:id", ensureDeckCreator, async function (req, res, next) {
  try {
    await DeckService.deleteDeck(req.params.id);
    return res.status(200).json({ status: "success" });
  } catch (err) {
    return next(err);
  }
});

/** POST /decks/:id/card  { uri: "https://api.scryfall.com/[xxxxx]", boardType } => { deckList: [deckCard, deckCard] }
 *
 * Takes json object with uri field that is a link to a direct link to a json card object from the scryfall API
 * Adds that card to the card table if not in it already, then adds that card to the deck.
 * Returns the updated deckList
 *
 * Authorization required: correct user
 */

router.post("/:id/card", ensureDeckCreator, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, cardObjectLinkSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const link = await axios(req.body.uri);
    const cardInDb = await DeckService.addNewCard(link.data);
    if (cardInDb) {
      await DeckService.addCardToDeck(
        req.params.id,
        link.data.id,
        req.body.boardType
      );
      const deckList = await DeckService.getDeckList(req.params.id);
      return res.status(201).json({ deckList });
    }
  } catch (err) {
    return next(err);
  }
});

/** PATCH /decks/:id/card  { cardID, data } => { deckList: [deckCard, deckCard] }
 *
 * Takes json object with deckID, cardID and data to change
 * Edits location or count and then returns updated deckList
 *
 * Authorization required: Correct user
 */

router.patch("/:id/card", ensureDeckCreator, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, editDeckCardSchema);
    if (!validator.valid) {
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    await DeckService.updateDeckCard(
      req.params.id,
      req.body.cardID,
      req.body.data
    );
    const deckList = await DeckService.getDeckList(req.params.id);
    return res.status(200).json({ deckList });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /decks/:id/card  { cardID } => { deckList: [deckCard, deckCard] }
 *
 * Deletes deckCard and returns updated deckList
 *
 * Authorization required: Correct user
 */

router.delete("/:id/card", ensureDeckCreator, async function (req, res, next) {
  try {
    if (req.body.cardID === undefined) {
      throw new BadRequestError();
    }
    await DeckService.deleteDeckCard(req.params.id, req.body.cardID);
    const deckList = await DeckService.getDeckList(req.params.id);
    return res.status(200).json({ deckList });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
