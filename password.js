const crypto = require('crypto');
const INVALID_PASSWORD = 'Invalid password.';
const DEFAULT_PASSWORD_SALT = 'SECRET_SALT';
const DEFAULT_PASSWORD_HASH_ENCODING = 'base64';

class Password
{
    constructor(password)
    {
        if (password === undefined || password === null
            || typeof password !== 'string' || password.length === 0)
        {
            throw new Error(INVALID_PASSWORD);
        }

        this._passwordRaw = password;
        this._passwordHash = null;
    }

    //
    // Calculate the SHA-256 hash of the password.
    //
    static hash(password, secretSalt = DEFAULT_PASSWORD_SALT, encoding = DEFAULT_PASSWORD_HASH_ENCODING)
    {
        return crypto.createHash('sha256')
            .update(secretSalt + this._passwordRaw, 'utf8')
            .digest(encoding);
    }
}

module.exports = Password;