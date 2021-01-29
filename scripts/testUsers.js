const { GIVEN_NAMES, LAST_NAMES } = require('./contactNames');
const { EMAIL_ADDRESS_TYPES, PHONE_NUMBER_TYPES } = require('../contactDb');
const { Password } = require('../userCreds');

const emailAddresses = new Set();
const phoneNumbers = new Set();

function getRandomInt(min, max)
{
    return Math.ceil(Math.random() * (max - min) + min);
}

function selectRandom(list)
{
    if (list)
    {
        return list[Math.ceil(Math.random() * (list.length-1))];
    }

    return null;
}

function generateEmailAddress(contact, type, localPartSuffix = '')
{
    let emailDomain = '';

    switch (type)
    {
        case 'Personal':
        case 'Other':
            emailDomain = 'coolmail.com';
            break;
        case 'Work':
            emailDomain = 'workmail.com';
            break;
        case 'Business':
            emailDomain = 'srsbusiness.com';
            break;
        default:
            break;
    }

    return `${contact.firstName.toLowerCase()}.${contact.lastName.toLowerCase()}${localPartSuffix}@${emailDomain}`;
}

function addEmailAddress(contact, type)
{
    if (!contact.emailAddresses)
    {
        contact.emailAddresses = [];
    }

    let emailAddress = generateEmailAddress(contact, type);

    // Make sure the email address is unique.
    while(emailAddresses.has(emailAddress))
    {
        emailAddress = generateEmailAddress(contact, type, `${getRandomInt(1,100)}`);
    }

    contact.emailAddresses.push({
        emailAddress,
        type
    });

    return contact;
}

function generateLocalPhoneNumber()
{
    let localNumber = getRandomInt(0, 9999999).toString();

    return localNumber.padStart(7, '0');
}

function generatePhoneNumber(contact, type)
{
    let areaCode = '';

    if (type === 'Home' || type === 'Work' || type.startsWith('Fax'))
    {
        areaCode = '111';
    }
    else if (type.startsWith('Cell'))
    {
        areaCode = '222';
    }
    else
    {
        areaCode = '333';
    }

    return `1${areaCode}${generateLocalPhoneNumber()}`;
}

function addPhoneNumber(contact, type)
{
    if (!contact.phoneNumbers)
    {
        contact.phoneNumbers = [];
    }

    let phoneNumber = generatePhoneNumber(contact, type);

    // Make sure phone number is unique.
    while (phoneNumbers.has(phoneNumber))
    {
        phoneNumber = generatePhoneNumber(contact, type);
    }

    contact.phoneNumbers.push({
        phoneNumber,
        type
    });

    return contact;
}

function generateContact()
{
    let rand = Math.random();
    let middleNames = 0;

    // 50% of contacts have no middle name.
    // 40% of contacts have a middle name.
    // 10% of contacts have two middle names.
    if (rand <= 0.5)
    {
        middleNames = [];
    }
    else if (rand > 0.5 && rand <= 0.9)
    {
        middleNames = [ selectRandom(GIVEN_NAMES) ];
    }
    else
    {
        middleNames = [
            selectRandom(GIVEN_NAMES),
            selectRandom(GIVEN_NAMES)
        ];
    }

    let contact = {
        firstName: selectRandom(GIVEN_NAMES),
        middleNames,
        lastName: selectRandom(LAST_NAMES)
    };

    // Every contact has a personal email address.
    addEmailAddress(contact, 'Personal');

    // 50% of contacts have a work email address.
    rand = Math.random();
    if (rand <= 0.5)
    {
        addEmailAddress(contact, 'Work');
    }

    // 10% of contacts have a business email address.
    rand = Math.random();
    if (rand <= 0.1)
    {
        addEmailAddress(contact, 'Business');
    }

    // 5% of contacts have a email address categorized as 'Other'.
    rand = Math.random();
    if (rand <= 0.05)
    {
        addEmailAddress(contact, 'Other');
    }

    // Every contact has a cell number.
    addPhoneNumber(contact, 'Cell (Personal)');

    // 50% of contacts have a home number.
    addPhoneNumber(contact, 'Home');

    // No favorites by default.
    contact.favorite = false;

    return contact;
}

function generateContacts(numContacts)
{
    emailAddresses.clear();
    phoneNumbers.clear();

    let contacts = [];

    for (let i = 0; i < numContacts; ++i)
    {
        contacts.push(generateContact());
    }

    return contacts;
}

const testUsers = [
    {
        username: 'testuser_adam',
        password: {
            hash: Password.hash('Test!Password1')
        },
        emailAddress: 'adam@coolmail.com',
        phoneNumber: '19051234567'
    },
    {
        username: 'testuser_bob',
        password: {
            hash: Password.hash('Test!Password2')
        },
        emailAddress: 'bob@coolmail.com',
        phoneNumber: '19051234568'
    }
];

module.exports = {
    generateContact,
    generateContacts,
    testUsers
}
