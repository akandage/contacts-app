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
const { SessionDb } = require('./sessionDb');
const { UserDb } = require('./userDb');

const app = express();
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
app.use(function(req, res, next) {
    let sessionId = req.cookies["Session-Id"];

    if (sessionId)
    {
        let session = sessionDb.heartbeatSession(sessionId);

        if (session)
        {
            req.session = session;
        }
        else
        {
            req.session = null;
            res.clearCookie("Session-Id");
        }
    }

    next();
});

/**
 * Server startup function.
 */

app.startup = async function()
{
    let db = await connectToDb();

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

/**
 * Default middleware will be executed for any request that doesn't match
 * another request handler. Therefore if we get here send a 404 Not Found
 * error.
 */
app.use(function(req, res, next) {
    next(httpError.NotFound());
});

const NOT_FOUND_PAGE = path.resolve(__dirname, 'html', 'not_found.html');
const ERROR_PAGE = path.resolve(__dirname, 'html', 'error.html');

/**
 * Error handler middleware.
 */
app.use(function(err, req, res, next) {
    switch (err.status)
    {
        case 404:
            res.status(404).sendFile(NOT_FOUND_PAGE);
            break;
        case 500:
            res.status(500).sendFile(ERROR_PAGE);
            break;
        default:
            break;
    }
});

module.exports = app;