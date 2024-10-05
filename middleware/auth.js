const jwt = require("jsonwebtoken");
const UserService = require("../src/services/user.service");
const DeckService = require("../src/services/deck.service");
const bcrypt = require("bcrypt");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_KEY;
const BCRYPT_WORK_FACTOR = parseInt(process.env.BCRYPT_WORK_FACTOR);
const { UnauthorizedError, NotFoundError } = require("../expressError");

function authenticateJWT(req, res, next) {
  try {
    const authHeader = req.headers && req.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace(/^[Bb]earer /, "").trim();
      res.locals.user = jwt.verify(token, SECRET_KEY);
      console.log("asdf", res.locals.user);
    }
    return next();
  } catch (err) {
    return next();
  }
}

/** Middleware to use when they must be logged in.
 *
 * If not, raises Unauthorized.
 */

function ensureLoggedIn(req, res, next) {
  try {
    if (!res.locals.user) throw new UnauthorizedError();
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use to verify password in req.body is correct.
 *
 *  If not, raises Unauthorized.
 */

async function ensureCorrectPassword(req, res, next) {
  try {
    const user = await UserService.authUserUsername(res.locals.user.username);
    if (user === null) {
      throw new NotFoundError();
    }
    if (!(await bcrypt.compare(req.body.password, user.password))) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use to verify that the request submitter is logged in as the creator of the deck.
 *
 *  If not, raises Unauthorized.
 */

async function ensureDeckCreator(req, res, next) {
  try {
    const deck = await DeckService.getDeck(req.params.id);
    if (deck.creator.username !== res.locals.user.username) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

/** Middleware to use when they must provide a valid token & be user matching
 *  username provided as route param.
 *
 *  If not, raises Unauthorized.
 */

function ensureCorrectUser(req, res, next) {
  try {
    const user = res.locals.user;
    if (!(user && user.username === req.params.username)) {
      throw new UnauthorizedError();
    }
    return next();
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureDeckCreator,
  ensureCorrectPassword,
  ensureCorrectUser,
};
