/**
 * Common logic for MongoDB.
 */
const mongoose = require('mongoose');
const process = require('process');

const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const MONGODB_DBNAME = process.env.MONGODB_DBNAME || 'contacts-db';
const MONGODB_CONNECT_URL = `${MONGODB_URL}/${MONGODB_DBNAME}`;
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASS = process.env.MONGODB_PASS;

const ORDERBY_DIRECTIONS = [
    'ASC',
    'asc',
    'DESC',
    'desc'
];

async function connectToDb(create = false)
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

    let db;

    console.log(`Connecting to ${MONGODB_CONNECT_URL}.`);

    if (create)
    {
        db = await mongoose.createConnection(MONGODB_CONNECT_URL, connectOptions);
    }
    else
    {
        await mongoose.connect(MONGODB_CONNECT_URL, connectOptions);
        db = mongoose.connection;
    }

    console.log(`Successfully connected to ${MONGODB_CONNECT_URL}.`);

    db.on('error', error => {
        console.error(`MongoDB (${MONGODB_CONNECT_URL}) connection error: ${error}`);
    });

    return db;
}

async function disconnectDb(db)
{
    if (db === undefined || db === null)
    {
        db = mongoose.connection;
    }

    try
    {
        console.log(`Closing connection (${MONGODB_CONNECT_URL}).`);
        await db.close();
        console.log(`Successfully closed connection (${MONGODB_CONNECT_URL}).`);
    }
    catch (error)
    {
        console.warn(`Error closing connection (${MONGODB_CONNECT_URL}): ${error}`);
    }
}

async function teardownDb()
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

//
// Validate orderBy request parameter given to REST API method.
// 
function validateOrderBy(orderBy)
{
    if (!Array.isArray(orderBy) || orderBy.length === 0 || orderBy.length % 2 !== 0)
    {
        return false;
    }

    for (let i = 0; i < orderBy.length; i += 2)
    {
        let field = orderBy[i];
        let direction = orderBy[i+1];

        if (field === null || field === undefined || typeof field !== 'string'
            || field.length === 0 || ORDERBY_DIRECTIONS.indexOf(direction) === -1)
        {
            return false;
        }
    }

    return true;
}

module.exports = {
    connectToDb,
    disconnectDb,
    teardownDb,
    validateOrderBy
}