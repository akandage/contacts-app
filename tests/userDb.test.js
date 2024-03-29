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

test('Test successful user login.', async () => {
    assert.ok(await userDb.login(TEST_USERS[0].username, TEST_USERS[0].password.value));
    assert.ok(await userDb.login(TEST_USERS[1].username, TEST_USERS[1].password.value));
});

test('Test unsuccessful user login.', async () => {
    // Unknown user.
    assert.ok(!(await userDb.login('unknown_user', 'Password123')));
    // Incorrect password.
    assert.ok(!(await userDb.login(TEST_USERS[0].username, 'WrongPassword')));
});

// TODO: Add more positive tests.

// TODO: Add more negative tests.