const assert = require('assert');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, 'testdb.env')
});

const { connectToDb, disconnectDb, teardownDb } = require('../db');
const { createUsers, TEST_USERS } = require('./dbTest');
const { UserDb } = require('../userDb');

const userDb = new UserDb();

beforeEach(async () => {
    await teardownDb();
    userDb.connection = await connectToDb();
    await userDb.start();
    await createUsers(userDb);
});

afterEach(async () => {
    await userDb.stop();
    await disconnectDb();
});

afterAll(async () => {
    await teardownDb(); 
});

test('Test get contact list without session.', async () => {

});

test('Test get contact list.', async () => {

});

// TODO: Add more positive tests.

// TODO: Add more negative tests.