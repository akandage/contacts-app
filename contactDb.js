const debug = require('debug')('contact-db');
const mongoose = require('mongoose');
const { validateOrderBy } = require('./db');
const { INVALID_EMAIL_ADDRESS, EmailAddress } = require('./emailAddress');
const { INVALID_PHONE_NUMBER, PhoneNumber } = require('./phoneNumber');

const INVALID_FIRST_NAME = 'Invalid first name.';
const INVALID_MIDDLE_NAME = 'Invalid middle name.'
const INVALID_LAST_NAME = 'Invalid last name.';
const INVALID_TITLE = 'Invalid title.';
const INVALID_EMAIL_ADDRESS_TYPE = 'Invalid email address type.';
const INVALID_PHONE_NUMBER_TYPE = 'Invalid phone number type.';
const INVALID_USER = 'Invalid user.';

const CONTACT_COLLECTION = 'contacts';
const DEFAULT_CONTACTS_ORDERBY = ['firstName', 'ASC', 'lastName', 'ASC'];
// Names (first, middle, last) may only contain letters and must start with a capital letter.
// Allow single letter names.
const NAME_REGEX = /^[A-Z][a-zA-Z-']*$/;
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
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel'
    },
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
                    message: emailAddress => `Invalid email address ${emailAddress.value}`
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
                    validator: phoneNumber => PhoneNumber.isValidUSAOrCanada(phoneNumber),
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

class ContactDb
{
    constructor(db)
    {
        this._db = db ? db : null;
        this._model = db ? db.model('ContactModel', ContactSchema, CONTACT_COLLECTION) : null;
    }

    set connection(db)
    {
        if (!db)
        {
            throw new Error('Invalid argument: db');
        }

        this._db = db;
        this._model = db.model('ContactModel', ContactSchema, CONTACT_COLLECTION);
    }

    get connection()
    {
        return this._db;
    }

    async start()
    {
        debug('Starting ContactDb.');

        await this._model.init();

        debug('Started ContactDb.');
    }

    async stop()
    {
        debug('Stopping ContactDb.');

        debug('Stopped ContactDb.');
    }

    async createContact(user, contact)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        contact = await this._model.create(contact);

        return contact;
    }

    async getContactList(user, limit = null, offset = 0, orderBy = DEFAULT_CONTACTS_ORDERBY)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        if (limit !== null && (!Number.isInteger(limit) || limit < 0))
        {
            throw new Error('Invalid argument: limit');
        }

        if (!Number.isInteger(offset) || offset < 0)
        {
            throw new Error('Invalid argument: offset');
        }

        let query = this._model.find({ owner: user._id });
        let contacts = [];

        if (Array.isArray(orderBy) && orderBy.length > 0)
        {
            if (!validateOrderBy(orderBy))
            {
                throw new Error('Invalid argument: orderBy');
            }

            let sort = '';

            for (let i = 0; i < orderBy.length; i += 2)
            {
                let field = orderBy[i];
                let direction = orderBy[i+1];

                if (i > 0)
                {
                    sort += ' ';
                }

                sort += direction.toLowerCase() === 'desc' ? `-${field}` : field;
            }

            query.sort(sort);
        }

        if (limit !== null)
        {
            let cursor = null;

            try
            {
                cursor = query.cursor();

                for (let contact = await cursor.next(), i = 0, n = limit; (limit === null || n > 0) && contact !== null; contact = await cursor.next(), ++i)
                {
                    if (i >= offset && (limit === null || n > 0))
                    {
                        contacts.push(contact);

                        if (n)
                        {
                            --n;
                        }
                    }
                }
            }
            catch (error)
            {
                // Ensure the cursor is closed.
                if (cursor)
                {
                    try
                    {
                        await cursor.close();
                    }
                    catch (error)
                    {
                        debug(`Error closing cursor: ${error}`);
                    }
                }

                throw error;
            }
        }
        else
        {
            contacts = await query.exec();
        }

        return contacts;
    }
}

module.exports = {
    CONTACT_COLLECTION,
    ContactDb,
    ContactSchema,
    DEFAULT_CONTACTS_ORDERBY,
    EMAIL_ADDRESS_TYPES,
    PHONE_NUMBER_TYPES
};