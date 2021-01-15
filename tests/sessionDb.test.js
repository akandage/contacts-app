const assert = require('assert');
const { connectToDb, disconnectDb, teardownDb } = require('../db');
const { SessionDb } = require('../sessionDb');

const USER1 = 'testuser_adam';
const USER2 = 'testuser_bob';
const SESSION_ID_LENGTH = 44; // Number of characters in the base64 representation of a SHA256 hash.

const sessionDb = new SessionDb();

beforeEach(async () => {
    await teardownDb();
    sessionDb.connection = await connectToDb();
});

afterEach(async () => {
    disconnectDb();
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

// TODO: Add more positive tests.

// TODO: Add more negative tests.

// TODO: Fix MongoDB environment warning.