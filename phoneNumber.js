const USA_CANADA_PHONE_NUMBER_PATTERN = '^\\+?(\\d{0,3})[ ]?(\\d\\d\\d)[ -]?(\\d\\d\\d)[ -]?(\\d\\d\\d\\d)$';
const USA_CANADA_COUNTRY_CODE = '1';
const INVALID_PHONE_NUMBER = 'Not a valid phone number.';

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
            throw new Error(INVALID_PHONE_NUMBER);
        }

        let matches = new RegExp(USA_CANADA_PHONE_NUMBER_PATTERN).exec(phoneNum);

        if (matches === null)
        {
            throw new Error(INVALID_PHONE_NUMBER);
        }

        this._countryCode = matches[1].length > 0 ? matches[1] : USA_CANADA_COUNTRY_CODE;
        this._areaCode = matches[2];
        this._phoneNumber = matches[2] + matches[3] + matches[4];
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

    static isValidUSAOrCanada(phoneNum)
    {
        if (phoneNum === undefined || phoneNum === null || typeof phoneNum !== 'string')
        {
            return false;
        }

        let matches = new RegExp(USA_CANADA_PHONE_NUMBER_PATTERN).exec(phoneNum);

        if (matches !== null)
        {
            if (matches[1].length > 0)
            {
                return matches[1] === USA_CANADA_COUNTRY_CODE;
            }

            return true;
        }

        return false;
    }
}

module.exports = PhoneNumber;