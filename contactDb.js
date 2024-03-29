const debug = require('debug')('contact-db');
const mongoose = require('mongoose');
const { orderByToString, validateOrderBy } = require('./db');
const { INVALID_EMAIL_ADDRESS, EmailAddress } = require('./emailAddress');
const { INVALID_PHONE_NUMBER, PhoneNumber } = require('./phoneNumber');

const INVALID_FIRST_NAME = 'Invalid first name.';
const INVALID_MIDDLE_NAME = 'Invalid middle name.'
const INVALID_LAST_NAME = 'Invalid last name.';
const INVALID_TITLE = 'Invalid title.';
const INVALID_EMAIL_ADDRESS_TYPE = 'Invalid email address type.';
const INVALID_PHONE_NUMBER_TYPE = 'Invalid phone number type.';
const INVALID_CONTACT = 'Invalid contact.';
const INVALID_GROUP = 'Invalid group.';
const INVALID_SEARCH_TERMS = 'Invalid search terms.';
const INVALID_USER = 'Invalid user.';
const CONTACT_NOT_FOUND = 'Contact not found.';
const GROUP_NOT_FOUND = 'Group not found.';

const CONTACT_COLLECTION = 'contacts';
const GROUP_COLLECTION = 'groups';
const DEFAULT_CONTACTS_ORDERBY = ['firstName', 'ASC', 'lastName', 'ASC'];
const DEFAULT_GROUPS_ORDERBY = ['name', 'ASC'];
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

const ContactSchema = new mongoose.Schema({
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
    ],
    favorite: {
        type: Boolean,
        required: true,
        default: false
    },
    profilePictureUrl: {
        type: String,
        required: false,
        default: null
    }
});

const GroupSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel'
    },
    name: {
        type: String,
        required: true
    },
    contacts: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ContactModel'
        }
    ]
});

class ContactDb
{
    constructor(db)
    {
        this._db = db ? db : null;
        this._contactModel = db ? db.model('ContactModel', ContactSchema, CONTACT_COLLECTION) : null;
        this._groupModel = db ? db.model('GroupModel', GroupSchema, GROUP_COLLECTION) : null;
    }

    set connection(db)
    {
        if (!db)
        {
            throw new Error('Invalid argument: db');
        }

        this._db = db;
        this._contactModel = db.model('ContactModel', ContactSchema, CONTACT_COLLECTION);
        this._groupModel = db.model('GroupModel', GroupSchema, GROUP_COLLECTION);
    }

    get connection()
    {
        return this._db;
    }

    async start()
    {
        debug('Starting ContactDb.');

        await this._contactModel.init();
        await this._groupModel.init();

        debug('Started ContactDb.');
    }

    async stop()
    {
        debug('Stopping ContactDb.');

        debug('Stopped ContactDb.');
    }

    async validateContact(contact)
    {
        if (contact === null || contact === undefined)
        {
            throw new Error(INVALID_CONTACT);
        }

        try
        {
            await this._contactModel.validate(contact);
        }
        catch (error)
        {
            if (error instanceof mongoose.Error.ValidationError)
            {
                throw new Error(INVALID_CONTACT);
            }
        }
    }

    async createContact(user, contact)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        await this.validateContact(contact);

        contact.owner = user._id;
        contact = await this._contactModel.create(contact);

        return contact;
    }

    async createGroup(user, name, contactIds)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        if (name === null || name === undefined || typeof name !== 'string' || name.length === 0)
        {
            throw new Error(INVALID_GROUP);
        }

        if (!Array.isArray(contactIds) || contactIds.length === 0)
        {
            throw new Error(INVALID_GROUP);
        }

        let group = await this._groupModel.create({
            owner: user._id,
            name,
            contacts: contactIds
        });

        await group.execPopulate('contacts');

        return group;
    }

    async putGroup(user, group)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        if (group.name === null || group.name === undefined || typeof group.name !== 'string' || group.name.length === 0)
        {
            throw new Error(INVALID_GROUP);
        }

        if (!Array.isArray(group.contacts) || group.contacts.length === 0)
        {
            throw new Error(INVALID_GROUP);
        }

        group.owner = user._id;

        // Since we're using replace, the version field won't be updated.
        let prevGroup = await this._groupModel.findOneAndReplace({ _id: group._id }, group).exec();

        if (!prevGroup)
        {
            throw new Error(GROUP_NOT_FOUND);
        }

        return prevGroup;
    }

    async getGroup(user, id)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        let group = await this._groupModel.findOne({ owner: user._id, _id: id }).exec();

        if (!group)
        {
            throw new Error(GROUP_NOT_FOUND);
        }

        return group;
    }

    async deleteGroup(user, id)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        let group = await this.getGroup(user, id);

        await group.remove();
    }

    async getGroupList(user, limit = null, offset = 0, orderBy = DEFAULT_GROUPS_ORDERBY)
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

        let query = this._groupModel.find({ owner: user._id });
        let queryOptions = {};
        let groups = [];

        if (Array.isArray(orderBy) && orderBy.length > 0)
        {
            if (!validateOrderBy(orderBy))
            {
                throw new Error('Invalid argument: orderBy');
            }

            queryOptions.sort = orderByToString(orderBy);
        }

        if (limit !== null)
        {
            queryOptions.limit = limit;

            if (offset !== 0)
            {
                queryOptions.skip = offset;
            }
        }

        query.setOptions(queryOptions);
        query.populate('contacts');
        groups = await query.exec();

        return groups;
    }

    async putContact(user, contact)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        await this.validateContact(contact);

        contact.owner = user._id;

        // Since we're using replace, the version field won't be updated.
        let prevContact = await this._contactModel.findOneAndReplace({ _id: contact._id }, contact).exec();

        if (!prevContact)
        {
            throw new Error(CONTACT_NOT_FOUND);
        }

        return prevContact;
    }

    async getContact(user, id)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        let contact = await this._contactModel.findOne({ owner: user._id, _id: id }).exec();

        if (!contact)
        {
            throw new Error(CONTACT_NOT_FOUND);
        }

        return contact;
    }

    async favoriteContact(user, id, favorite = true)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        let contact = await this.getContact(user, id);

        contact.favorite = favorite;
        await contact.save();

        return contact;
    }

    async deleteContact(user, id)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        let contact = await this.getContact(user, id);
        let contactGroups = await this._groupModel.find({
            contacts: {
                $elemMatch: { $eq: contact._id }
            }
        }).exec();

        for (let group of contactGroups)
        {
            group.contacts = group.contacts.filter(contactId => contactId !== contact._id);
            await group.save();
        }

        await contact.remove();
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

        let query = this._contactModel.find({ owner: user._id });
        let queryOptions = {};
        let contacts = [];

        if (Array.isArray(orderBy) && orderBy.length > 0)
        {
            if (!validateOrderBy(orderBy))
            {
                throw new Error('Invalid argument: orderBy');
            }

            queryOptions.sort = orderByToString(orderBy);
        }

        if (limit !== null)
        {
            queryOptions.limit = limit;

            if (offset !== 0)
            {
                queryOptions.skip = offset;
            }
        }

        query.setOptions(queryOptions);
        contacts = await query.exec();

        return contacts;
    }

    async searchContacts(user, searchTerms, limit = null)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        for (let searchTerm of searchTerms)
        {
            if (!NAME_REGEX.test(searchTerm))
            {
                throw new Error(INVALID_SEARCH_TERMS);
            }
        }

        let contacts = [];

        // TODO: Use the MongoDB text search.
        if (searchTerms.length > 0 && searchTerms.length <= 2)
        {
            let query = null;
            let queryOptions = {};

            if (limit !== null)
            {
                queryOptions.limit = limit;
            }

            queryOptions.sort = orderByToString(DEFAULT_CONTACTS_ORDERBY);

            if (searchTerms.length === 2)
            {
                query = this._contactModel.find({ owner: user._id,
                    firstName: searchTerms[0],
                    lastName: new RegExp(searchTerms[1])
                });
                query.setOptions(queryOptions);
                contacts = await query.exec();
            }
            else if (searchTerms.length === 1)
            {
                let results = [];

                query = this._contactModel.find({ owner: user._id,
                    $or: [
                        { firstName: new RegExp(searchTerms[0]) },
                        { lastName: new RegExp(searchTerms[0]) }
                    ]
                });
                query.setOptions(queryOptions);
                results = await query.exec();
                results.map(result => contacts.push(result));
            }
        }

        return contacts;
    }
}

module.exports = {
    CONTACT_COLLECTION,
    CONTACT_NOT_FOUND,
    GROUP_NOT_FOUND,
    INVALID_CONTACT,
    INVALID_GROUP,
    INVALID_SEARCH_TERMS,
    INVALID_USER,
    ContactDb,
    ContactSchema,
    DEFAULT_CONTACTS_ORDERBY,
    EMAIL_ADDRESS_TYPES,
    PHONE_NUMBER_TYPES
};