# Library Forge

Library Forge is an onlline Magic the Gathering (MTG) resource that helps users create decks of their own and interact with decks made by others. This is the repository for the front end and is utilizing the Scryfall API and Vite to structure a React framework. This is my second capstone project for my software engineering bootcamp.

## Features

The key feature that set Library Forge apart is the visual interface when building a deck. As a casual fan of MTG, I struggle with remembering card names, but I associate card effects with the card art. Partially inspired by the MTG Arena video game, I wanted to create a tool that would combine the complete encyclopedic data and search tools available from scryfall and combine it with a deck editor that displays card art instead of just text.

## How to set up the app

### Required technologies for the backend

- Node v 20.15.0
- psql (PostgreSQL) 14.13
- npm v10.7.0

### Instructions

1. Clone this distro and cd into folder.
2. Create a psql database named library-forge by running:
   ```
   createdb library-forge
   ```
3. Create a file named '.env'
4. In the .env file, define your DATABASE_URL, SECRET_KEY, BCRYPT_WORK_FACTOR, and PORT. It should look similar to the following:
   ```
   DATABASE_URL = "postgresql://<USERNAME>:<PASSWORD>@<HOST>:<PORT>/<DATABASE>"
   SECRET_KEY = "your_secret_key_here"
   BCRYPTH_WORK_FACTOR = 12
   PORT = 3001
   ```
5. In your console the following code to install all dependencies
   ```
   npm install
   ```
6. In the console, generate and migrate the prisma schema to your database by running:
   ```
   npx prisma migrate deploy
   npx prisma generate
   ```
7. Finally launch the app by running:
   ```
   npm run start
   ```
8. Proceed [here](https://github.com/user-owang/library-forge-frontend/blob/main/README.md) for instructions to launch the frontend

