# Contacts App

Contacts app using MERN stack.

## Prerequisites

- Node.js
- MongoDB
- npm

## Setup

1. Ensure MongoDB is running ('sudo service mongod start' on Linux). 
2. Run 'npm install' to install dependencies.
3. Setup the test database. Run 'node ./scripts/setupTestDb'.

## Install and Run

1. Run 'npm start'. Use the DEBUG environment to enable debugging for server components ex. DEBUG=contacts-app,session-db

## Run in Development Mode

1. Run 'npx webpack --config ./frontend/login/webpack.config.js --watch' to have webpack monitor for changes and rebuild the 'login' bundle.
2. Run 'npx webpack --config ./frontend/contacts/webpack.config.js --watch' to have webpack monitor for changes and rebuild

## Running the Tests

1. TODO
2. TODO
