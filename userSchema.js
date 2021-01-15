const mongoose = require('mongoose');
const { EmailAddress, INVALID_EMAIL_ADDRESS } = require('./emailAddress');
const { PhoneNumber, INVALID_USA_CANADA_PHONE_NUMBER } = require('./phoneNumber');

const USER_COLLECTION = 'users';
const USERNAME_REGEX = /[a-zA-Z][a-zA-Z0-9_]*/;
const MIN_USERNAME_LENGTH = 8;
const INVALID_USERNAME = `Invalid username. Must start with a letter, can only contain alphanumeric characters and underscores and must be at least ${MIN_USERNAME_LENGTH} characters in length.`;

// TODO: Common logic. Move this somewhere else.
const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: [ true, 'User already exists with this username.' ],
        validate: {
            validator: validateUsername,
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

function validateUsername(username)
{
    if (username === undefined || username === null
        || typeof username !== 'string' || username.length < MIN_USERNAME_LENGTH)
    {
        return false;
    }

    return USERNAME_REGEX.test(username);
}

module.exports = {
    UserSchema,
    USER_COLLECTION,
    validateUsername
};