/**
 * Set process.env variables from .env.
 */

const dotenv = require('dotenv');
dotenv.config();

/**
 * Module dependencies.
 */

const busboy = require('busboy');
const debug = require('debug')('contacts-app');
const { connectToDb, disconnectDb } = require('./db');
const express = require('express');
const fs = require('fs');
const cookieParser = require('cookie-parser');
const httpError = require('http-errors');
const mongoose = require('mongoose');
const path = require('path');
const { ContactDb } = require('./contactDb');
const { SessionDb } = require('./sessionDb');
const contactsApiRouter = require('./contactsApiRouter');
const sessionRouter = require('./sessionRouter');
const { UploadedFilesDb } = require('./uploadedFilesDb');
const { UserDb } = require('./userDb');

const HTML_ROOT = path.resolve(__dirname, 'html');
const CONTACTS_DEFAULT_PAGE = 'index.html';
const CONTACTS_APP_PAGE = 'contacts.html';
const CONTACTS_WELCOME_PAGE = 'contacts_welcome.html';
const NOT_FOUND_PAGE = 'not_found.html';
const ERROR_PAGE = 'error.html';

const app = express();
const contactDb = new ContactDb();
const sessionDb = new SessionDb();
const uploadedFilesDb = new UploadedFilesDb();
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
 * Directory to store uploaded image files.
 */
app.set('uploads-directory', process.env.UPLOADS_DIRECTORY || './uploads');

/**
 * Dimensions of uploaded profile picture files.
 */
app.set('contact-profile-picture-width', Number.parseInt(process.env.CONTACT_PROFILE_PICTURE_WIDTH, 10) || 128);
app.set('contact-profile-picture-height', Number.parseInt(process.env.CONTACT_PROFILE_PICTURE_HEIGHT, 10) || 128);

/**
 * Set up middleware to parse form data.
 * 
 */
app.use((req, res, next) => {
    if (req.method === 'POST')
    {
        let contentType = req.get('Content-Type');

        if (contentType && contentType.startsWith('multipart/form-data'))
        {
            let parser = new busboy({ headers: req.headers });
            let files = [];

            parser.on('file', (name, f, filename, encoding, type) => {
                let file = {
                    filename,
                    encoding,
                    type,
                    chunks: [],
                    truncated: false
                };
                let fileLength = 0;

                f.on('data', (chunk) => {
                    file.chunks.push(chunk);
                    fileLength += chunk.length;
                });

                f.on('end', () => {
                    file.length = fileLength;
                    file.truncated = f.truncated === true;
                    files.push(file);
                });
            });

            parser.on('finish', () => {
                req.files = files;
                next();
            });

            req.pipe(parser);
        }
        else
        {
            next();
        }
    }
    else
    {
        next();
    }
});

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
app.use(/^\/(contacts|favorites|groups|search|settings)?/, (req, res, next) => {
    let session = req.session;
    let page = session ? CONTACTS_APP_PAGE : CONTACTS_DEFAULT_PAGE;

    res.status(200)
        .sendFile(req.app.pathToHtml(page));
});
app.use('/welcome', (req, res, next) => {
    let session = req.session;
    let page = session ? CONTACTS_WELCOME_PAGE : CONTACTS_DEFAULT_PAGE;

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
    let uploadsDir = app.get('uploads-directory');

    if (!fs.existsSync(uploadsDir))
    {
        fs.mkdirSync(uploadsDir, {
            recursive: true
        });
    }

    contactDb.connection = db;
    await contactDb.start();
    app.set('contact-db', contactDb);

    sessionDb.connection = db;
    await sessionDb.start();
    app.set('session-db', sessionDb);

    uploadedFilesDb.connection = db;
    await uploadedFilesDb.start();
    app.set('uploaded-files-db', uploadedFilesDb);

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