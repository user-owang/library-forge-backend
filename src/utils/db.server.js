const { PrismaClient } = require('@prisma/client');

let db;

if (!global.__db) {
  global.__db = new PrismaClient();
}

db = global.__db;

module.exports = { db };