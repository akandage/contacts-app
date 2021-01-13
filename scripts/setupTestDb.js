const dotenv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

const { UserSchema } = require('../userSchema');
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

const MONGODB_CONNECT_URL = `${MONGODB_URL}/${MONGODB_DBNAME}`;

console.log('MONGODB_URL: ' + MONGODB_URL);
console.log('MONGODB_DBNAME: ' + MONGODB_DBNAME);

async function connectToDb()
{
    let connectOptions = {
        useUnifiedTopology: true
    };

    if (MONGODB_USER)
    {
        connectOptions.user = MONGODB_USER;
    }
    if (MONGODB_PASS)
    {
        connectOptions.pass = MONGODB_PASS;
    }

    console.log(`Connecting to ${MONGODB_CONNECT_URL}`);
    await mongoose.connect(MONGODB_CONNECT_URL, connectOptions);
    console.log(`Successfully connected to ${MONGODB_CONNECT_URL}`);

    mongoose.connection.on('error', error => {
        console.error(`MongoDB (${MONGODB_CONNECT_URL}) connection error: ${error}`);
    });
}

async function disconnectDb()
{
    try
    {
        console.log(`Closing connection (${MONGODB_CONNECT_URL}).`);
        await mongoose.connection.close();
        console.log(`Successfully closed connection (${MONGODB_CONNECT_URL}).`);
    }
    catch (error)
    {
        console.warn(`Error closing connection (${MONGODB_CONNECT_URL}): ${error}`);
    } 
}

async function createUserModel()
{
    const UserModel = mongoose.connection.model('UserModel', UserSchema, 'users');

    // Ensure UserModel indexes are built.
    console.log('Initializing user model.');
    await UserModel.init();
    console.log('Initialized user model.');

    console.log('Loading test users.');
    await UserModel.create(testUsers);
    console.log('Loaded test users.');

    return UserModel;
}

async function setupTestDb()
{
    await connectToDb();
    
    try
    {
        const userModel = await createUserModel();
    }
    catch (error)
    {
        await disconnectDb();
        throw error;
    }

    await disconnectDb();
}

async function teardownTestDb()
{
    await connectToDb();

    try
    {
        console.log(`Dropping database (${MONGODB_DBNAME}).`);
        await mongoose.connection.dropDatabase();
        console.log(`Dropped database (${MONGODB_DBNAME}).`);
    }
    catch (error)
    {
        console.warn(`Error dropping database (${MONGODB_DBNAME}): ${error}`);
    }

    await disconnectDb();
}

teardownTestDb().then(
    () => setupTestDb()
);
// setupTestDb().then(
//     () => teardownTestDb()
// )