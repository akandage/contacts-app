const {
    INVALID_USERNAME,
    INVALID_PASSWORD,
    isUsernameValid,
    isPasswordValid
} = require('./userCredsValid');

const crypto = require('crypto');

const DEFAULT_PASSWORD_SALT = 'SECRET_SALT';
const DEFAULT_PASSWORD_HASH_ENCODING = 'base64';

class Username
{
    static isValid(username)
    {
        return isUsernameValid(username);
    }
}

class Password
{
    constructor(password)
    {
        this._passwordRaw = password;
        this._passwordHash = null;
    }

    //
    // Calculate the SHA-256 hash of the password.
    //
    static hash(password, secretSalt = DEFAULT_PASSWORD_SALT, encoding = DEFAULT_PASSWORD_HASH_ENCODING)
    {
        return crypto.createHash('sha256')
            .update(secretSalt + password, 'utf8')
            .digest(encoding);
    }

    //
    // Test whether given password is valid.
    // Will need to use separate methods to determine whether password policy
    // is satisfied.
    //
    static isValid(password)
    {
        return isPasswordValid(password);
    }
}

module.exports = {
    INVALID_PASSWORD,
    INVALID_USERNAME,
    Password,
    Username
}