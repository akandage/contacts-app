const assert = require('assert');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, 'testdb.env')
});

const { connectToDb, disconnectDb, teardownDb } = require('../db');
const { SessionDb } = require('../sessionDb');

const USER1 = 'testuser_adam';
const USER2 = 'testuser_bob';
const SESSION_ID_LENGTH = 44; // Number of characters in the base64 representation of a SHA256 hash.

const sessionDb = new SessionDb();

beforeEach(async () => {
    await teardownDb();
    sessionDb.connection = await connectToDb();
    await sessionDb.start();
});

afterEach(async () => {
    await sessionDb.stop();
    await disconnectDb();
});

afterAll(async () => {
    await teardownDb(); 
});

test('Test register a user session.', async () => {
    let session1 = await sessionDb.registerSession(USER1);

    assert.strictEqual(session1.username, USER1);
    assert.notEqual(session1.sessionId, null);
    assert.equal(session1.sessionId.length, SESSION_ID_LENGTH);
    assert.ok(session1.expires > Date.now());

    let sessionId = session1.sessionId;

    assert.ok(await sessionDb.isSessionValid(sessionId));
    session1 = await sessionDb.registerSession(USER1);
    assert.strictEqual(session1.username, USER1);
    assert.notEqual(session1.sessionId, null);
    assert.equal(session1.sessionId.length, SESSION_ID_LENGTH);
    assert.ok(session1.expires > Date.now());
    // New session-id is assigned.
    assert.notStrictEqual(session1.sessionId, sessionId);
    // Old session-id is no longer valid.
    assert.ok(!(await sessionDb.isSessionValid(sessionId)));
});

test('Test unregister a user session.', async () => {
    let session1 = await sessionDb.registerSession(USER1);

    assert.strictEqual(session1.username, USER1);
    assert.notEqual(session1.sessionId, null);
    assert.equal(session1.sessionId.length, SESSION_ID_LENGTH);
    assert.ok(session1.expires > Date.now());
    assert.ok(sessionDb.isSessionValid(session1.sessionId));
    
    let session2 = await sessionDb.registerSession(USER2);

    assert.strictEqual(session2.username, USER2);
    assert.notEqual(session2.sessionId, null);
    assert.equal(session2.sessionId.length, SESSION_ID_LENGTH);
    assert.notStrictEqual(session2.sessionId, session1.sessionId);
    assert.ok(session2.expires > Date.now());
    assert.ok((await sessionDb.isSessionValid(session1.sessionId)));
    assert.ok((await sessionDb.isSessionValid(session2.sessionId)));

    let sessionId1 = session1.sessionId;
    let sessionId2 = session2.sessionId;

    await sessionDb.unregisterSession(sessionId1);

    assert.ok(!(await sessionDb.isSessionValid(sessionId1)));
    assert.ok((await sessionDb.isSessionValid(sessionId2)));

    await sessionDb.unregisterSession(sessionId2);

    assert.ok(!(await sessionDb.isSessionValid(sessionId1)));
    assert.ok(!(await sessionDb.isSessionValid(sessionId2)));
});

// TODO: Add more positive tests.

// TODO: Add more negative tests.