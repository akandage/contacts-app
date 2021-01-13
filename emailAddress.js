const emailValidator = require('email-validator');
const INVALID_EMAIL_ADDRESS = 'Invalid email address.';

class EmailAddress
{
    constructor(email)
    {
        if (!EmailAddress.isValid(email))
        {
            throw new Error(INVALID_EMAIL_ADDRESS);
        }

        this._email = email;
        this._emailParts = email.split('@');
    }

    get localPart()
    {
        return this._emailParts[0];
    }

    get domain()
    {
        return this._emailParts[1];
    }

    static isValid(email)
    {
        if (email === undefined || email === null || typeof email !== 'string')
        {
            return false;
        }

        return emailValidator.validate(email);
    }

    toString()
    {
        return this._email;
    }
}

module.exports = {
    EmailAddress,
    INVALID_EMAIL_ADDRESS
};