const crypto = require('crypto');
const debug = require('debug')('session-db');
const mongoose = require('mongoose');

const SESSION_COLLECTION = 'sessions';
const SESSION_SALT = 'SESSION_SALT';
const SESSION_ID_ENCODING = 'base64';
const SESSION_EXPIRY_MILLIS = 30 * 60 * 1000; // Default to 30 minute session expiry.
const SESSION_EXPIRY_INTERVAL_MILLIS = 5 * 1000; // Default to 5 second session expiry interval.
const SessionSchema = mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true
    },
    username: {
        type: String,
        required: true,
        unique: true
    },
    expires: {
        type: Number,
        required: true
    }
});

class SessionDb
{
    constructor(db)
    {
        this._db = db ? db : null;
        this._model = db ? db.model('SessionModel', SessionSchema, SESSION_COLLECTION) : null;
        this._timer = null;
    }

    set connection(db)
    {
        if (!db)
        {
            throw new Error('Invalid argument: db');
        }

        this._db = db;
        this._model = db.model('SessionModel', SessionSchema, SESSION_COLLECTION);
    }

    get connection()
    {
        return this._db;
    }

    async start()
    {
        debug('Starting SessionDb.');

        await this._model.init();
        this._timer = setInterval(() => {
            this.expireSessions();
        }, SESSION_EXPIRY_INTERVAL_MILLIS);

        debug('Started SessionDb.');
    }

    async stop()
    {
        debug('Stopping SessionDb.');

        if (this._timer)
        {
            clearInterval(this._timer);
            this._timer = null;
        }

        debug('Stopped SessionDb.');
    }

    static generateSessionId(username)
    {
        if (username === undefined || username === null || typeof username !== 'string' || username.length === 0)
        {
            throw new Error('Invalid argument: username');
        }

        let now = Date.now();

        return crypto.createHash('sha256')
                .update(username + now + SESSION_SALT, 'utf8')
                .digest(SESSION_ID_ENCODING);
    }

    async isSessionValid(sessionId)
    {
        if (sessionId === undefined || sessionId === null || typeof sessionId !== 'string' || sessionId.length === 0)
        {
            throw new Error('Invalid argument: sessionId');
        }

        let now = Date.now();
        let session = await this._model.findOne({ sessionId }).exec();

        if (!session)
        {
            return false;
        }

        return session.expires > now;
    }

    async registerSession(username)
    {
        if (username === undefined || username === null || typeof username !== 'string' || username.length === 0)
        {
            throw new Error('Invalid argument: username');
        }

        let session = await this._model.findOneAndDelete({ username }).exec();

        if (session)
        {
            debug(`Removed session for user ${username} (${session.sessionId})`);
        }

        let now = Date.now();
        let sessionId = generateSessionId(username);

        debug(`Registering session for user ${username}.`);
        session = await this._model.create({
            username,
            sessionId,
            expires: now + SESSION_EXPIRY_MILLIS
        });
        debug(`Registered session for user ${username} successfully.`);

        return session;
    }

    async unregisterSession(sessionId)
    {
        if (sessionId === undefined || sessionId === null || typeof sessionId !== 'string' || sessionId.length === 0)
        {
            throw new Error('Invalid argument: sessionId');
        }

        let session = await this._model.findOneAndDelete({ sessionId }).exec();

        if (session)
        {
            debug(`Removed session for user ${session.username} (${session.sessionId}).`);
        }
        else
        {
            debug(`Tried to unregister session (${sessionId}) but session was not found.`);
        }

        return session;
    }

    async heartbeatSession(sessionId)
    {
        if (sessionId === undefined || sessionId === null || typeof sessionId !== 'string' || sessionId.length === 0)
        {
            throw new Error('Invalid argument: sessionId');
        }

        let now = Date.now();
        let session = await this._model.findOne({ sessionId }).exec();

        if (session)
        {
            session.expires = now + SESSION_EXPIRY_MILLIS;
            await session.save();
            debug(`Heartbeat for user ${session.username} session (${sessionId}) was successful.`);
        }
        else
        {
            debug(`Tried to heartbeat session (${sessionId}) but session was not found.`);
        }

        return session;
    }

    async expireSessions()
    {
        let now = Date.now();
        let count = 0;

        //debug('Removing expired user sessions.');

        let cursor = await this._model.find({ expires: { $gte: now } }).cursor();

        for (let session = await cursor.next(); session !== null; session = await cursor.next())
        {
            let session = await this._model.findOneAndDelete({ sessionId: session.sessionId, expires: session.expires });

            if (session)
            {
                ++count;
            }
        }

        await cursor.close();

        if (count > 0)
        {
            debug(`Removed ${count} expired user sessions.`);
        }
    }
}

module.exports = {
    SessionDb,
    SessionSchema,
    SESSION_COLLECTION
};