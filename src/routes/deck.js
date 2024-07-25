"use strict";

import jsonschema from "jsonschema";

import express from "express";
const router = new express.Router();
import { createToken } from "../../helpers/tokens";
import newDeckSchema from "../schemas/newDeck.json";
import { BadRequestError } from "../../expressError";
import * as DeckService from "../models/deck.service"
import bcrypt from "bcrypt"
require('dotenv').config()
const BCRYPT_WORK_FACTOR = process.env.BCRYPT_WORK_FACTOR


/** POST /deck/:  { name, description, imgURL, format } => { deck }
 *
 * Returns newly created deck object.
 *
 * Authorization required: Logged in
 */

router.post("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, newDeckSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    // const user = await User.authenticate(username, password);
    const token = createToken(user);
    console.log(token)
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});


/** POST /:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: logged in
 */

router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
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
