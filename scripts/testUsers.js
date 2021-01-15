const { Password } = require('../password');

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

module.exports = testUsers;