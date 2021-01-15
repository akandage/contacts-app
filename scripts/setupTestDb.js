const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

const { connectToDb, disconnectDb, teardownDb } = require('../db');
const { SessionSchema, SESSION_COLLECTION } = require('../sessionDb');
const { UserSchema, USER_COLLECTION } = require('../userSchema');
const testUsers = require('./testUsers');

dotenv.config({
    path: path.resolve(__dirname, 'testdb.env')
});

const MONGODB_URL = process.env.MONGODB_URL;
const MONGODB_DBNAME = process.env.MONGODB_DBNAME;
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASS = process.env.MONGODB_PASS;

if (!MONGODB_URL)
{
    throw new Error('MONGODB_URL is not configured!');
}
if (!MONGODB_DBNAME)
{
    throw new Error('MONGODB_DBNAME is not configured!');
}

console.log('MONGODB_URL: ' + MONGODB_URL);
console.log('MONGODB_DBNAME: ' + MONGODB_DBNAME);

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