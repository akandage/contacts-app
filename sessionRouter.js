const debug = require('debug')('session-router');
const express = require('express');
const httpError = require('http-errors');
const sessionRouter = express.Router();

const LOGIN_PAGE = 'login.html';
const LOGIN_FAILED_PAGE = 'login_failed.html';
const LOGGED_OUT_PAGE = 'logged_out.html';

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
        let loginOk = await userDb.login(username, password);

        if (loginOk)
        {
            let session = await sessionDb.registerSession(username);

            res.cookie('Session-Id', session.sessionId, {
                httpOnly: true
            });
            res.redirect('/');
        }
        else
        {
            res.status(200)
                .sendFile(req.app.pathToHtml(LOGIN_FAILED_PAGE));
        }
    }
    catch (error)
    {
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
        }
    }
});

sessionRouter.get('/logout', async (req, res, next) => {
    let session = req.session;

    if (session)
    {
        try
        {
            await sessionDb.unregisterSession(session.sessionId);
        }
        catch (error)
        {
            next(httpError(500));
        }

        res.clearCookie('Session-Id');
    }

    res.status(200)
        .sendFile(req.app.pathToHtml(LOGGED_OUT_PAGE));
});

module.exports = sessionRouter;