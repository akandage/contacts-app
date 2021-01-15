const assert = require('assert');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, 'testdb.env')
});

const { connectToDb, disconnectDb, teardownDb } = require('../db');
const { Password } = require('../password');
const { UserDb } = require('../userDb');
const testUsers = [
    {
        username: 'testuser_adam',
        password: {
            value: 'Test!Password1',
            hash: Password.hash('Test!Password1')
        },
        emailAddress: 'adam@coolmail.com',
        phoneNumber: '19051234567'
    },
    {
        username: 'testuser_bob',
        password: {
            value: 'Test!Password2',
            hash: Password.hash('Test!Password2')
        },
        emailAddress: 'bob@coolmail.com',
        phoneNumber: '19051234568'
    }
];

const userDb = new UserDb();

async function createUsers()
{
    console.log('Creating users.');

    for (let user of testUsers)
    {
        await userDb.registerUser(user.username,
            user.password.value,
            user.emailAddress,
            user.phoneNumber);
    }

    console.log('Successfully created users.');
}

beforeEach(async () => {
    await teardownDb();
    userDb.connection = await connectToDb();
    await userDb.start();
    await createUsers();
});

afterEach(async () => {
    await userDb.stop();
    await disconnectDb();
});

afterAll(async () => {
    await teardownDb(); 
});

test('Test successful user login.', async () => {
    assert.ok(await userDb.login(testUsers[0].username, testUsers[0].password.value));
});

test('Test unsuccessful user login.', async () => {
    // Unknown user.
    assert.ok(!(await userDb.login('unknown_user', 'Password123')));
    // Incorrect password.
    assert.ok(!(await userDb.login(testUsers[0].username, 'WrongPassword')));
});

// TODO: Add more positive tests.

// TODO: Add more negative tests.