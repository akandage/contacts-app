const debug = require('debug')('user-db');
const mongoose = require('mongoose');
const { EmailAddress, INVALID_EMAIL_ADDRESS } = require('./emailAddress');
const { PhoneNumber, INVALID_USA_CANADA_PHONE_NUMBER } = require('./phoneNumber');
const { Password, Username, INVALID_PASSWORD, INVALID_USERNAME } = require('./userCreds');

const USER_COLLECTION = 'users';
const INVALID_USER = 'Invalid user.';
const INVALID_OLD_PASSWORD = 'Old password does not match.';
const USER_EXISTS_WITH_USERNAME = 'User already exists with this username.';
const USER_EXISTS_WITH_EMAIL_ADDRESS = 'User already exists with this email address.';
const USER_EXISTS_WITH_PHONE_NUMBER = 'User already exists with this phone number.';
const USER_NOT_FOUND = 'User not found.';

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

    async validateUser(user)
    {
        if (user === null || user === undefined)
        {
            throw new Error(INVALID_USER);
        }

        try
        {
            await this._model.validate(user);
        }
        catch (error)
        {
            console.log(error);

            if (error instanceof mongoose.Error.ValidationError)
            {
                throw new Error(INVALID_USER);
            }
        }
    }

    async registerUser(username, password, emailAddress, phoneNumber)
    {
        if (!Username.isValid(username))
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
        if (!Username.isValid(username))
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

    async getUser(username)
    {
        if (!Username.isValid(username))
        {
            throw new Error(INVALID_USERNAME);
        }

        let user = await this._model.findOne({ username }).exec();

        if (!user)
        {
            throw new Error(USER_NOT_FOUND);
        }

        return user;
    }

    async putUser(user)
    {
        await this.validateUser(user);
        
        // Since we're using replace, the version field won't be updated.
        let prevUser = await this._model.findOneAndReplace({ _id: user._id }, user).exec();

        if (!prevUser)
        {
            throw new Error(USER_NOT_FOUND);
        }

        return prevUser;
    }

    async changeUserPassword(username, oldPassword, newPassword)
    {
        let user = await this.getUser(username);

        if (Password.isValid(oldPassword))
        {
            let oldPasswordHash = Password.hash(oldPassword);

            if (user.password.hash !== oldPasswordHash)
            {
                throw new Error(INVALID_OLD_PASSWORD);
            }
        }
        else
        {
            throw new Error(INVALID_OLD_PASSWORD);
        }

        if (!Password.isValid(newPassword))
        {
            throw new Error(INVALID_PASSWORD);
        }

        let passwordHash = Password.hash(newPassword);

        user.password.hash = passwordHash;
        await user.save();
    }

    async changeUserPhoneNumber(username, phoneNumber)
    {
        let user = await this.getUser(username);

        user.phoneNumber = phoneNumber;
        await user.save();
    }

    async changeUserEmailAddress(username, emailAddress)
    {
        let user = await this.getUser(username);

        user.emailAddress = emailAddress;
        await user.save();
    }

    async changeUserProfilePicture(username, profilePictureUrl)
    {
        let user = await this.getUser(username);

        user.profilePictureUrl = profilePictureUrl;
        await user.save();
    }
}

// TODO: Common logic. Move this somewhere else.
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: [ true, USER_EXISTS_WITH_USERNAME ],
        validate: {
            validator: Username.isValid,
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
        unique: [ true, USER_EXISTS_WITH_EMAIL_ADDRESS ],
        validate: {
            validator: EmailAddress.isValid,
            message: INVALID_EMAIL_ADDRESS
        }
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: [ true, USER_EXISTS_WITH_PHONE_NUMBER ],
        validate: {
            validator: PhoneNumber.isValidUSAOrCanada,
            message: INVALID_USA_CANADA_PHONE_NUMBER
        }
    },
    contacts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ContactModel'
        }
    ],
    profilePictureUrl: {
        type: String
    }
});

module.exports = {
    UserDb,
    UserSchema,
    USER_COLLECTION,
    INVALID_EMAIL_ADDRESS,
    INVALID_USA_CANADA_PHONE_NUMBER,
    INVALID_OLD_PASSWORD,
    INVALID_USER,
    INVALID_USERNAME,
    USER_EXISTS_WITH_USERNAME,
    USER_EXISTS_WITH_EMAIL_ADDRESS,
    USER_EXISTS_WITH_PHONE_NUMBER,
    USER_NOT_FOUND
};