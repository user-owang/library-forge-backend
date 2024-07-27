"use strict";

import jsonschema from "jsonschema";

import express from "express";
const router = new express.Router();
import { createToken } from "../../helpers/tokens";
import newDeckSchema from "../schemas/newDeck.json";
import { BadRequestError, UnauthorizedError } from "../../expressError";
import * as DeckService from "../models/deck.service"
import { ensureLoggedIn } from "../../middleware/auth";
import axios from 'axios'
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
    const token = createToken(user);
    console.log(token)
    return res.json({ token });
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
 * Authorization required: Logged in
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
    // need to hash password and pass through to register
    const newUser = await User.register();
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
