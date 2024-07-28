"use strict";

import jsonschema from "jsonschema";

import express from "express";
const router = new express.Router();
import { createToken } from "../../helpers/tokens";
import userAuthSchema from "../../schemas/userAuth.json";
import userRegisterSchema from "../../schemas/userRegister.json";
import { BadRequestError, UnauthorizedError } from "../../expressError";
import * as UserService from "../models/user.service"
import bcrypt from "bcrypt"
require('dotenv').config()
const BCRYPT_WORK_FACTOR = process.env.BCRYPT_WORK_FACTOR

/** POST /auth/token:  { username, password } => { token }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/token", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userAuthSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
    const user = await UserService.authUser(email, hashedPassword);
    if (user === null){
      throw new UnauthorizedError
    }
    const token = createToken(user);
    console.log(token)
    return res.json({ token });
  } catch (err) {
    return next(err);
  }
});


/** POST /auth/register:   { user } => { token }
 *
 * user must include { username, password, firstName, lastName, email }
 *
 * Returns JWT token which can be used to authenticate further requests.
 *
 * Authorization required: none
 */

router.post("/register", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, userRegisterSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    const { username, email, password } = req.body
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR); 
    const newUser = await User.register(username,hashedPassword,email);
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
