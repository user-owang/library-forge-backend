"use strict";

const jsonschema = require("jsonschema");

const express = require("express");
const router = new express.Router();
const { createToken } = require("../../helpers/tokens");
const userAuthSchema = require("../../schemas/userAuth.json");
const userRegisterSchema = require("../../schemas/userRegister.json");
const { BadRequestError, UnauthorizedError } = require("../../expressError");
const UserService = require("../models/user.service")
const bcrypt = require("bcrypt")
require('dotenv').config()
const BCRYPT_WORK_FACTOR = parseInt(process.env.BCRYPT_WORK_FACTOR, 10)

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
    const user = await UserService.authUser(email);
    console.log(user)
    if(!user || !(await bcrypt.compare(password, user.password))){
      throw new UnauthorizedError
    }
    const token = createToken({username: user.username});
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
    const newUser = await UserService.createUser(username,hashedPassword,email);
    const token = createToken(newUser);
    return res.status(201).json({ token });
  } catch (err) {
    return next(err);
  }
});


module.exports = router;
