const crypto = require('crypto');
const PASSWORD_REGEX = /[a-zA-Z0-9-_`'"~!?@#$%^&*()+=\[\]{|}\\/;:,<.>]+/;
const INVALID_PASSWORD = 'Invalid password.';
const DEFAULT_PASSWORD_SALT = 'SECRET_SALT';
const DEFAULT_PASSWORD_HASH_ENCODING = 'base64';

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
        if (password === undefined || password === null
            || typeof password !== 'string' || password.length === 0)
        {
            throw new Error(INVALID_PASSWORD);
        }

        return PASSWORD_REGEX.test(password);
    }
}

module.exports = {
    INVALID_PASSWORD,
    Password
}