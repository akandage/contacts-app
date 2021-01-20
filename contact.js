const mongoose = require('mongoose');
const { INVALID_EMAIL_ADDRESS, EmailAddress } = require('./emailAddress');
const { INVALID_PHONE_NUMBER, PhoneNumber } = require('./phoneNumber');

const INVALID_FIRST_NAME = 'Invalid first name.';
const INVALID_MIDDLE_NAME = 'Invalid middle name.'
const INVALID_LAST_NAME = 'Invalid last name.';
const INVALID_TITLE = 'Invalid title.';
const INVALID_EMAIL_ADDRESS_TYPE = 'Invalid email address type.';
const INVALID_PHONE_NUMBER_TYPE = 'Invalid phone number type.';

// Names (first, middle, last) may only contain letters and must start with a capital letter.
// Allow single letter names.
const NAME_REGEX = /^[A-Z][a-zA-Z]*$/;
const EMAIL_ADDRESS_TYPES = [
    'Personal',
    'Work',
    'Business',
    'Other'
];
const PHONE_NUMBER_TYPES = [
    'Home',
    'Work',
    'Cell (Personal)',
    'Cell (Work)',
    'Cell (Business)',
    'Fax (Home)',
    'Fax (Work)',
    'Fax (Business)',
    'Other'
];

const ContactSchema = mongoose.Schema({
    title: {
        type: String,
        required: false,
        validate: {
            validator: title => title !== '',
            message: INVALID_TITLE
        }
    },
    firstName: {
        type: String,
        required: true,
        validate: {
            validator: firstName => NAME_REGEX.test(firstName),
            message: INVALID_FIRST_NAME
        }
    },
    middleNames: [
        {
            type: String,
            validate: {
                validator: middleName => NAME_REGEX.test(middleName),
                message: INVALID_MIDDLE_NAME
            }
        }    
    ],
    lastName: {
        type: String,
        required: true,
        validate: {
            validator: lastName => NAME_REGEX.test(lastName),
            message: INVALID_LAST_NAME
        }
    },
    emailAddresses: [
        {
            emailAddress: {
                type: String,
                required: true,
                validate: {
                    validator: emailAddress => EmailAddress.isValid(emailAddress),
                    message: INVALID_EMAIL_ADDRESS
                }
            },
            type: {
                type: String,
                required: true,
                validate: {
                    validator: type => EMAIL_ADDRESS_TYPES.indexOf(type) !== -1,
                    message: INVALID_EMAIL_ADDRESS_TYPE
                }
            }
        }
    ],
    phoneNumbers: [
        {
            phoneNumber: {
                type: String,
                required: true,
                validate: {
                    validator: phoneNumber => PhoneNumber.isValid(phoneNumber),
                    message: INVALID_PHONE_NUMBER
                }
            },
            type: {
                type: String,
                required: true,
                validate: {
                    validator: type => PHONE_NUMBER_TYPES.indexOf(type) !== -1,
                    message: INVALID_PHONE_NUMBER_TYPE
                }
            }
        }
    ]
});

module.exports = {
    ContactSchema,
    EMAIL_ADDRESS_TYPES,
    PHONE_NUMBER_TYPES
};