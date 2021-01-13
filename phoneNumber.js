const USA_CANADA_COUNTRY_CODE = '1';
const INVALID_USA_CANADA_PHONE_NUMBER = 'Not a valid US or Canadian phone number.';

//
// PhoneNumber class only supports USA and Canada phone numbers for now.
// See: https://en.wikipedia.org/wiki/North_American_Numbering_Plan#Dialing_procedures
//
class PhoneNumber
{
    constructor(phoneNum)
    {
        if (phoneNum === undefined || phoneNum === null || typeof phoneNum !== 'string')
        {
            throw new Error(INVALID_USA_CANADA_PHONE_NUMBER);
        }

        let matches = /^\+?(\d{0,3})(\d\d\d)[ -]?(\d\d\d)[ -]?(\d\d\d\d)$/.exec(phoneNum);

        if (matches === null)
        {
            throw new Error(INVALID_USA_CANADA_PHONE_NUMBER);
        }

        if (matches.length > 4)
        {
            // Check the country code.
            if(matches[1] !== USA_CANADA_COUNTRY_CODE)
            {
                throw new Error(INVALID_USA_CANADA_PHONE_NUMBER);
            }

            this._countryCode = matches[1];
            this._areaCode = matches[2];
            this._phoneNumber = matches[2] + matches[3] + matches[4];
        }
        else
        {
            this._countryCode = USA_CANADA_COUNTRY_CODE;
            this._areaCode = matches[1];
            this._phoneNumber = matches[1] + matches[2] + matches[3];
        }
    }

    get countryCode()
    {
        return this._countryCode;
    }

    get areaCode()
    {
        return this._areaCode;
    }

    get phoneNumber()
    {
        return this._phoneNumber;
    }

    static isValidUSAOrCanada()
    {
        if (phoneNum === undefined || phoneNum === null || typeof phoneNum !== 'string')
        {
            throw new Error(INVALID_USA_CANADA_PHONE_NUMBER);
        }

        let matches = /^\+?(\d{0,3})(\d\d\d)[ -]?(\d\d\d)[ -]?(\d\d\d\d)$/.exec(phoneNum);

        if (matches !== null)
        {
            if (matches.length > 4)
            {
                return matches[1] === USA_CANADA_COUNTRY_CODE;
            }

            return true;
        }

        return false;
    }
}

module.exports = PhoneNumber;