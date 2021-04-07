const debug = require('debug')('session-router');
const express = require('express');
const httpError = require('http-errors');
const sessionRouter = express.Router();
const { INVALID_USERNAME, INVALID_PASSWORD, INVALID_EMAIL_ADDRESS, INVALID_USA_CANADA_PHONE_NUMBER } = require('./userDb');

const CONTACTS_WELCOME_PAGE = 'contacts_welcome.html';
const LOGIN_PAGE = 'login.html';
const LOGIN_FAILED_PAGE = 'login_failed.html';
const LOGGED_OUT_PAGE = 'logged_out.html';
const SIGNUP_PAGE = 'signup.html';
const SIGNUP_ERROR_PAGE = 'signup_error.html';

sessionRouter.get('/login', (req, res, next) => {
    res.status(200)
        .sendFile(req.app.pathToHtml(LOGIN_PAGE));
});

sessionRouter.post('/login', async (req, res, next) => {
    let sessionDb = req.app.get('session-db');
    let userDb = req.app.get('user-db');
    let { username, password } = req.body;

    try
    {
        debug(`Login ${username} ${password}`);

        let loginOk = await userDb.login(username, password);

        if (loginOk)
        {
            let session = await sessionDb.registerSession(username);

            res.cookie('Session-Id', session.sessionId, {
                expires: 0,
                httpOnly: true,
                sameSite: 'Strict'
            });
            res.redirect('/');
        }
        else
        {
            res.status(401)
                .sendFile(req.app.pathToHtml(LOGIN_FAILED_PAGE));
        }
    }
    catch (error)
    {
        console.error(`Error while trying to login user ${username}: ${error}`);

        if (error.message.startsWith('Invalid argument') ||
                error.message.startsWith('Invalid username') ||
                error.message.startsWith('Invalid password'))
        {
            res.status(401)
                .sendFile(req.app.pathToHtml(LOGIN_FAILED_PAGE));
        }
        else
        {
            next(httpError(500));
            return;
        }
    }
});

sessionRouter.get('/logout', async (req, res, next) => {
    let sessionDb = req.app.get('session-db');
    let session = req.session;

    if (session)
    {
        try
        {
            await sessionDb.unregisterSession(session.sessionId);
        }
        catch (error)
        {
            console.error(`Error while trying to logout user ${session.username}: ${error}`);
            next(httpError(500));
            return;
        }

        res.clearCookie('Session-Id', {
            expires: 0,
            httpOnly: true,
            sameSite: 'Strict'
        });
        res.status(200)
            .sendFile(req.app.pathToHtml(LOGGED_OUT_PAGE));
    }
    else
    {
        res.redirect('/login');
    }
});

sessionRouter.get('/session/username', async (req, res, next) => {
    let session = req.session;

    if (session)
    {
        res.status(200)
            .send({
                username: session.username
            });
    }
    else
    {
        res.status(401)
            .send({
                status: 401,
                message: 'User is not logged in.'
            });
    }
});

sessionRouter.put('/session/heartbeat', async (req, res, next) => {
    let session = req.session;

    if (session)
    {
        let sessionDb = req.app.get('session-db');

        try
        {
            await sessionDb.heartbeatSession(session.sessionId);
        }
        catch (error)
        {
            res.status(500)
                .send({
                    status: 500,
                    message: 'Session heartbeat error.'
                });
            return;
        }

        res.status(200)
            .send({
                username: session.username
            });
    }
    else
    {
        res.status(401)
            .send({
                status: 401,
                message: 'User is not logged in.'
            });
    }
});

sessionRouter.get('/signup', async (req, res, next) => {
    res.status(200)
        .sendFile(req.app.pathToHtml(SIGNUP_PAGE));
});

sessionRouter.post('/signup', async (req, res, next) => {
    let userDb = req.app.get('user-db');
    let sessionDb = req.app.get('session-db');

    let {
        username,
        emailAddress,
        phoneNumber,
        password
    } = req.body;

    try
    {
        debug(`Registering user ${username}`);
        await userDb.registerUser(username, password, emailAddress, phoneNumber);
        debug(`Successfully registered user ${username}`);

        if (userDb.login(username, password))
        {
            if (req.session)
            {
                try
                {
                    await sessionDb.unregisterSession(req.session.sessionId);
                }
                catch (error)
                {
                    console.error(`Error while trying to logout user ${req.session.username}: ${error}`);
                    res.status(500)
                        .sendFile(req.app.pathToHtml(SIGNUP_ERROR_PAGE));
                    return;
                }
            }

            let session = await sessionDb.registerSession(username);

            res.cookie('Session-Id', session.sessionId, {
                expires: 0,
                httpOnly: true,
                sameSite: 'Strict'
            });
            res.redirect('/welcome');
        }
        else
        {
            res.status(500)
                .sendFile(req.app.pathToHtml(SIGNUP_ERROR_PAGE));
        }
    }
    catch (error)
    {
        let status = 500;

        if (error.message === INVALID_USERNAME || error.message === INVALID_PASSWORD ||
                error.message === INVALID_EMAIL_ADDRESS || error.message === INVALID_USA_CANADA_PHONE_NUMBER)
        {
            status = 400;
        }

        res.status(status)
            .sendFile(req.app.pathToHtml(SIGNUP_ERROR_PAGE));
    }
});

module.exports = sessionRouter;