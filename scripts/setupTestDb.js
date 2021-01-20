const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config({
    path: path.resolve(__dirname, 'testdb.env')
});

const MONGODB_URL = process.env.MONGODB_URL;
const MONGODB_DBNAME = process.env.MONGODB_DBNAME;

if (!MONGODB_URL)
{
    throw new Error('MONGODB_URL is not configured!');
}
if (!MONGODB_DBNAME)
{
    throw new Error('MONGODB_DBNAME is not configured!');
}

const { connectToDb, disconnectDb, teardownDb } = require('../db');
const { ContactSchema, CONTACT_COLLECTION } = require('../contactDb');
const { SessionSchema, SESSION_COLLECTION } = require('../sessionDb');
const { UserSchema, USER_COLLECTION } = require('../userDb');
const { generateContacts, testUsers } = require('./testUsers');

console.log('MONGODB_URL: ' + MONGODB_URL);
console.log('MONGODB_DBNAME: ' + MONGODB_DBNAME);

async function createContactModel(users)
{
    const ContactModel = mongoose.connection.model('ContactModel', ContactSchema, CONTACT_COLLECTION);

    // Ensure ContactModel indexes are built.
    console.log('Initializing contact model.');
    await ContactModel.init();
    console.log('Initialized contact model.');
    
    for (let user of users)
    {
        console.log(`Loading test user '${user.username}' contacts.`);
        await ContactModel.create(generateContacts().map(contact => Object.assign(contact, { owner: user._id })));
        console.log(`Loaded test user '${user.username}' contacts.`);
    }

    return ContactModel;
}

async function createUserModel()
{
    const UserModel = mongoose.connection.model('UserModel', UserSchema, USER_COLLECTION);

    // Ensure UserModel indexes are built.
    console.log('Initializing user model.');
    await UserModel.init();
    console.log('Initialized user model.');

    console.log('Loading test users.');
    await UserModel.create(testUsers);
    console.log('Loaded test users.');

    return UserModel;
}

async function createSessionModel()
{
    const SessionModel = mongoose.connection.model('SessionModel', SessionSchema, SESSION_COLLECTION);

    // Ensure SessionModel indexes are built.
    console.log('Initializing session model.');
    await SessionModel.init();
    console.log('Initialized session model.');

    return SessionModel;
}

async function setupTestDb()
{
    await connectToDb();
    
    try
    {
        const userModel = await createUserModel();
        const sessionModel = await createSessionModel();
        let users = await userModel.find({}).exec();
        const contactModel = await createContactModel(users);
    }
    catch (error)
    {
        await disconnectDb();
        throw error;
    }

    await disconnectDb();
}

teardownDb().then(
    () => setupTestDb()
);