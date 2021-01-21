/*
* Common logic for DB tests.
*/
const { Password } = require('../userCreds');

const TEST_USERS = [
    {
        username: 'testuser_adam',
        password: {
            value: 'Test!Password1',
            hash: Password.hash('Test!Password1')
        },
        emailAddress: 'adam@coolmail.com',
        phoneNumber: '19051234567'
    },
    {
        username: 'testuser_bob',
        password: {
            value: 'Test!Password2',
            hash: Password.hash('Test!Password2')
        },
        emailAddress: 'bob@coolmail.com',
        phoneNumber: '19051234568'
    }
];

async function createUsers(userDb)
{
    console.log('Creating users.');

    for (let user of TEST_USERS)
    {
        await userDb.registerUser(user.username,
            user.password.value,
            user.emailAddress,
            user.phoneNumber);
    }

    console.log('Successfully created users.');
}

module.exports = {
    createUsers,
    TEST_USERS
}