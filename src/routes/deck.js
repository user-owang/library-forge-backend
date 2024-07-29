"use strict";

const jsonschema = require("jsonschema");

const express = require("express");
const router = new express.Router();
const newDeckSchema = require("../../schemas/newDeck.json");
const cardObjectLinkSchema = require("../../schemas/cardObjectLink.json")
const editDeckCardSchema = require("../../schemas/editDeckCard.json")
const { BadRequestError, UnauthorizedError } = require("../../expressError");
const DeckService = require("../models/deck.service")
const { ensureLoggedIn } = require("../../middleware/auth");
const axios = require('axios')


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
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const newDeck = await DeckService.createDeck(req.body);
    return res.status(201).json({ newDeck });
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
    return res.json({ deck });
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

router.put("/:id", async function (req, res, next) {
  try {
    const deck = await DeckService.getDeck(req.params.id)
    if(deck.creator.username !== res.locals.user.username){
      throw new UnauthorizedError
    }
    const validator = jsonschema.validate(req.body, newDeckSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    await DeckService.updateDeck(req.params.id, req.body);
    const updatedDeck = DeckService.getDeck(req.params.id);
    return res.status(200).json({ updatedDeck });
  } catch (err) {
    return next(err);
  }
});

/** POST /decks/:id/card  { uri: "https://api.scryfall.com/[xxxxx]" } => { deckList: [deckCard, deckCard] }
 *
 * Takes json object with uri field that is a link to a direct link to a json card object from the scryfall API
 * Adds that card to the card table if not in it already, then adds that card to the deck.
 * Returns the updated deckList
 *
 * Authorization required: correct user
 */

router.post("/:id/card", async function (req, res, next) {
  try {
    const deck = await DeckService.getDeck(req.params.id)
    if(deck.creator.username !== res.locals.user.username){
      throw new UnauthorizedError
    }
    const validator = jsonschema.validate(req.body, cardObjectLinkSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const cardData = await axios(req.body.uri);
    const cardInDb = await DeckService.addNewCard(cardData)
    if(cardInDb) {
      await DeckService.addCardToDeck(cardData)
      const deckList = await DeckService.getDeckList(req.params.id)
      return res.status(201).json( {deckList} )
    }
  } catch (err) {
    return next(err);
  }
})

/** PATCH /decks/:id/card  { deckID, cardID, data } => { deckList: [deckCard, deckCard] }
 *
 * Takes json object with deckID, cardID and data to change
 * Edits location or count and then returns updated deckList
 *
 * Authorization required: Logged in
 */

router.patch("/:id/card", async function (req, res, next) {
  try {
    const deck = await DeckService.getDeck(req.params.id)
    if(deck.creator.username !== res.locals.user.username){
      throw new UnauthorizedError
    }
    const validator = jsonschema.validate(req.body, editDeckCardSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    await DeckService.updateDeckCard(req.params.id, req.body.cardID, req.body.data)
    const deckList = await DeckService.getDeckList(req.params.id)
    return res.status(200).json( {deckList} )
  } catch (err) {
    return next(err);
  }
})

/** GET /decks/recent => { recentDecks: [deck, deck] }
 *
 * Returns the 20 most recently created decks that have at least 60 cards.
 *
 * Authorization required: none
 */

router.patch("/recent", async function (req, res, next) {
  try {
    const recentDecks = await DeckService.getRecentDecks(req.params.id)    
    return res.status(200).json( {recentDecks} )
  } catch (err) {
    return next(err);
  }
})

/** GET /decks/liked => { likedDecks: [deck, deck] }
 *
 * Returns the 20 most liked decks.
 *
 * Authorization required: none
 */

router.patch("/liked", async function (req, res, next) {
  try {
    const likedDecks = await DeckService.getMostLikedDecks(req.params.id)    
    return res.status(200).json( {likedDecks} )
  } catch (err) {
    return next(err);
  }
})

module.exports = router;
