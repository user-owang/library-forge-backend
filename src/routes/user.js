"use strict";

import jsonschema from "jsonschema";

import express from "express";
const router = new express.Router();
import newDeckSchema from "../schemas/newDeck.json";
import { BadRequestError, UnauthorizedError, NotFoundError } from "../../expressError";
import * as UserService from "../models/user.service"
import { ensureLoggedIn } from "../../middleware/auth";
import axios from 'axios'
import { db } from "../utils/db.server";
require('dotenv').config()


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

module.exports = router;
