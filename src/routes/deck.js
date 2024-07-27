"use strict";

import jsonschema from "jsonschema";

import express from "express";
const router = new express.Router();
import { createToken } from "../../helpers/tokens";
import newDeckSchema from "../schemas/newDeck.json";
import cardObjectLinkSchema from "../schemas/cardObjectLink.json"
import editDeckCardSchema from "../schemas/editDeckCard.json"
import { BadRequestError, UnauthorizedError } from "../../expressError";
import * as DeckService from "../models/deck.service"
import { ensureLoggedIn } from "../../middleware/auth";
import axios from 'axios'
import { db } from "../utils/db.server";
require('dotenv').config()
const BCRYPT_WORK_FACTOR = process.env.BCRYPT_WORK_FACTOR


/** POST /deck/:  { name, description, imgURL, format } => { deck }
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

/** GET /deck/:id => { deck }
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


/** PUT /deck/:id  { name, description, imgURL, format } => { deck }
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
    await db.deck.updateDeck(req.params.id, req.body);
    const updatedDeck = DeckService.getDeck(req.params.id);
    return res.status(200).json({ updatedDeck });
  } catch (err) {
    return next(err);
  }
});

/** POST /deck/:id/card  { uri: "https://api.scryfall.com/[xxxxx]" } => { deckList: [deckCard, deckCard] }
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

/** PATCH /deck/:id/card  { deckID, cardID, data } => { deckList: [deckCard, deckCard] }
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


module.exports = router;
