const debug = require('debug')('user-db');
const mongoose = require('mongoose');
const { EmailAddress, INVALID_EMAIL_ADDRESS } = require('./emailAddress');
const { PhoneNumber, INVALID_USA_CANADA_PHONE_NUMBER } = require('./phoneNumber');
const { Password, INVALID_PASSWORD } = require('./password');

const USER_COLLECTION = 'users';
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;
const MIN_USERNAME_LENGTH = 8;
const INVALID_USERNAME = `Invalid username. Must start with a letter, can only contain alphanumeric characters and underscores and must be at least ${MIN_USERNAME_LENGTH} characters in length.`;

class UserDb
{
    constructor(db)
    {
        this._db = db ? db : null;
        this._model = db ? db.model('UserModel', UserSchema, USER_COLLECTION) : null;
    }

    set connection(db)
    {
        if (!db)
        {
            throw new Error('Invalid argument: db');
        }

        this._db = db;
        this._model = db.model('UserModel', UserSchema, USER_COLLECTION);
    }

    get connection()
    {
        return this._db;
    }

    async start()
    {
        debug('Starting UserDb.');

        await this._model.init();

        debug('Started UserDb.');
    }

    async stop()
    {
        debug('Stopping UserDb.');

        debug('Stopped UserDb.');
    }

    static isValidUsername(username)
    {
        if (username === undefined || username === null
            || typeof username !== 'string' || username.length < MIN_USERNAME_LENGTH)
        {
            return false;
        }
    
        return USERNAME_REGEX.test(username);
    }

    async registerUser(username, password, emailAddress, phoneNumber)
    {
        if (!UserDb.isValidUsername(username))
        {
            throw new Error(INVALID_USERNAME);
        }

        if (!Password.isValid(password))
        {
            throw new Error(INVALID_PASSWORD);
        }

        // TODO: Checks for password policy.

        if (!EmailAddress.isValid(emailAddress))
        {
            throw new Error(INVALID_EMAIL_ADDRESS);
        }

        if (!PhoneNumber.isValidUSAOrCanada(phoneNumber))
        {
            throw new Error(INVALID_USA_CANADA_PHONE_NUMBER);
        }

        let user = await this._model.create({
            username,
            password: {
                hash: Password.hash(password)
            },
            emailAddress,
            phoneNumber
        });

        return user;
    }

    async login(username, password)
    {
        if (!UserDb.isValidUsername(username))
        {
            throw new Error(INVALID_USERNAME);
        }

        if (!Password.isValid(password))
        {
            throw new Error(INVALID_PASSWORD);
        }

        let count = await this._model.find({ username,
            password: {
                hash: Password.hash(password)
            }
        }).countDocuments().exec();
        let loginOk = count === 1;

        debug(loginOk ? `User ${username} login successful.` : `User ${username} login failed.`);

        return loginOk;
    }
}

// TODO: Common logic. Move this somewhere else.
const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: [ true, 'User already exists with this username.' ],
        validate: {
            validator: UserDb.isValidUsername,
            message: INVALID_USERNAME
        }
    },
    password: {
        hash: {
            type: String,
            required: true
        }
    },
    emailAddress: {
        type: String,
        required: true,
        unique: [ true, 'User already exists with this email address.' ],
        validate: {
            validator: EmailAddress.isValid,
            message: INVALID_EMAIL_ADDRESS
        }
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: [ true, 'User already exists with this phone number.' ],
        validate: {
            validator: PhoneNumber.isValidUSAOrCanada,
            message: INVALID_USA_CANADA_PHONE_NUMBER
        }
    }
});

module.exports = {
    INVALID_USERNAME,
    UserDb,
    UserSchema,
    USER_COLLECTION
};