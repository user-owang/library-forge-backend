"use strict";

const jsonschema = require("jsonschema");

const express = require("express");
const router = new express.Router();
const { createToken } = require("../../helpers/tokens");
const userAuthSchema = require("../../schemas/userAuth.json");
const userRegisterSchema = require("../../schemas/userRegister.json");
const { BadRequestError, UnauthorizedError } = require("../../expressError");
const UserService = require("../services/user.service");
const bcrypt = require("bcrypt");
require("dotenv").config();
const BCRYPT_WORK_FACTOR = parseInt(process.env.BCRYPT_WORK_FACTOR, 10);

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
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }

    const { email, password } = req.body;
    const authUser = await UserService.authUserEmail(email);
    if (!authUser || !(await bcrypt.compare(password, authUser.password))) {
      throw new UnauthorizedError();
    }
    const user = await UserService.getUser(authUser.username);
    const tokenData = { id: user.id, username: user.username };
    const token = createToken(tokenData);
    console.log(token);
    return res.json({ token, user });
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
      const errs = validator.errors.map((e) => e.stack);
      throw new BadRequestError(errs);
    }
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);
    const newUser = await UserService.createUser(
      username,
      hashedPassword,
      email
    );
    const token = createToken(newUser);
    const user = await UserService.getUser(username);
    return res.status(201).json({ token, user });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
