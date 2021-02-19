/**
 * Set process.env variables from .env.
 */

const dotenv = require('dotenv');
dotenv.config();

/**
 * Module dependencies.
 */

const debug = require('debug')('contacts-app');
const { connectToDb, disconnectDb } = require('./db');
const express = require('express');
const cookieParser = require('cookie-parser');
const httpError = require('http-errors');
const mongoose = require('mongoose');
const path = require('path');
const { ContactDb } = require('./contactDb');
const { SessionDb } = require('./sessionDb');
const contactsApiRouter = require('./contactsApiRouter');
const sessionRouter = require('./sessionRouter');
const { UserDb } = require('./userDb');

const HTML_ROOT = path.resolve(__dirname, 'html');
const CONTACTS_DEFAULT_PAGE = 'index.html';
const CONTACTS_APP_PAGE = 'contacts.html';
const NOT_FOUND_PAGE = 'not_found.html';
const ERROR_PAGE = 'error.html';

const app = express();
const contactDb = new ContactDb();
const sessionDb = new SessionDb();
const userDb = new UserDb();

/**
 * Set up request logger.
 */
const morgan = require('morgan');
app.use(morgan('dev'));

/**
 * Set up middleware to parse HTTP cookies.
 */
app.use(cookieParser());

/**
 * Set up middleware to parse URL-encoded key-value pairs in request body.
 */
app.use(express.urlencoded({ extended: false }));

/**
 * Set up middleware to parse JSON in request body.
 */
app.use(express.json());

/**
 * Setup the static files directory.
 */
app.use(express.static('public'));

/**
 * Method to setup the database.
 */
app.set('mongodb-url', process.env.MONGODB_URL || 'mongodb://localhost:27017');
app.set('mongodb-name', process.env.MONGODB_DBNAME || 'contacts-db');

/**
 * Set up middleware to attach Session-Id cookie to the request object
 * if present in the request.
 */
app.use(async (req, res, next) => {
    let sessionId = req.cookies['Session-Id'];

    if (sessionId)
    {
        let session = null;
        
        try
        {
            session = await sessionDb.getSession(sessionId);
        }
        catch (error)
        {
            console.error(`Error while trying to heartbeat session ${sessionId}: ${error}`);
        }

        if (session)
        {
            req.session = session;
        }
        else
        {
            req.session = null;
            // res.clearCookie('Session-Id');
        }
    }

    next();
});

/**
 * Set up route handlers.
 */

// GET /
app.use(/^\/(contacts|favorites|settings)?$/, (req, res, next) => {
    let session = req.session;
    let page = session ? CONTACTS_APP_PAGE : CONTACTS_DEFAULT_PAGE;

    res.status(200)
        .sendFile(req.app.pathToHtml(page));
});
app.use(contactsApiRouter);
app.use(sessionRouter);

/**
 * Server startup function.
 */

app.startup = async function()
{
    let db = await connectToDb();

    contactDb.connection = db;
    await contactDb.start();
    app.set('contact-db', contactDb);

    sessionDb.connection = db;
    await sessionDb.start();
    app.set('session-db', sessionDb);

    userDb.connection = db;
    await userDb.start();
    app.set('user-db', userDb);
}

/**
 * Server shutdown function.
 */
app.shutdown = async function()
{
    await userDb.stop();
    await sessionDb.stop();
    await disconnectDb();
}

app.pathToHtml = function(html)
{
    return path.resolve(HTML_ROOT, html);
}

/**
 * Default middleware will be executed for any request that doesn't match
 * another request handler. Therefore if we get here send a 404 Not Found
 * error.
 */
app.use(function(req, res, next) {
    next(httpError.NotFound());
});

/**
 * Error handler middleware.
 */
app.use(function(err, req, res, next) {
    switch (err.status)
    {
        case 404:
            res.status(err.status).sendFile(app.pathToHtml(NOT_FOUND_PAGE));
            break;
        default:
            res.status(err.status).sendFile(app.pathToHtml(ERROR_PAGE));
            break;
    }
});

module.exports = app;