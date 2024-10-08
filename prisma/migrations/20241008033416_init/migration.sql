-- CreateEnum
CREATE TYPE "Format" AS ENUM ('standard', 'future', 'historic', 'timeless', 'gladiator', 'pioneer', 'explorer', 'modern', 'legacy', 'pauper', 'vintage', 'penny', 'commander', 'oathbreaker', 'standardbrawl', 'brawl', 'alchemy', 'paupercommander', 'oldschool', 'premodern', 'predh');

-- CreateEnum
CREATE TYPE "BoardType" AS ENUM ('deck', 'sideboard', 'maybeboard', 'commandzone');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deck" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "imgURL" TEXT NOT NULL,
    "format" "Format" NOT NULL,
    "creatorID" TEXT,

    CONSTRAINT "Deck_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "arenaID" TEXT,
    "oracleID" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "manaCost" TEXT NOT NULL,
    "cmc" INTEGER NOT NULL,
    "colorIdentity" JSONB NOT NULL,
    "typeLine" TEXT NOT NULL,
    "rarity" TEXT NOT NULL,
    "img_url" TEXT NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeckCard" (
    "deckID" TEXT NOT NULL,
    "cardID" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "boardType" "BoardType" NOT NULL,

    CONSTRAINT "DeckCard_pkey" PRIMARY KEY ("deckID","cardID")
);

-- CreateTable
CREATE TABLE "UserDeckLike" (
    "userID" TEXT NOT NULL,
    "deckID" TEXT NOT NULL,

    CONSTRAINT "UserDeckLike_pkey" PRIMARY KEY ("userID","deckID")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Deck_creatorID_name_key" ON "Deck"("creatorID", "name");

-- AddForeignKey
ALTER TABLE "Deck" ADD CONSTRAINT "Deck_creatorID_fkey" FOREIGN KEY ("creatorID") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_deckID_fkey" FOREIGN KEY ("deckID") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeckCard" ADD CONSTRAINT "DeckCard_cardID_fkey" FOREIGN KEY ("cardID") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDeckLike" ADD CONSTRAINT "UserDeckLike_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDeckLike" ADD CONSTRAINT "UserDeckLike_deckID_fkey" FOREIGN KEY ("deckID") REFERENCES "Deck"("id") ON DELETE CASCADE ON UPDATE CASCADE;
