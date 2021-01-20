const debug = require('debug')('contacts-router');
const express = require('express');
const httpError = require('http-errors');
const { USER_NOT_FOUND } = require('./userDb');
const contactsApiRouter = express.Router();

contactsApiRouter.get('/api/contacts', async (req, res, next) => {
    let session = req.session;
    let {
        num,    // Number of contacts to retrieve.
        offset, // Offset of first contact in the order list.
        orderBy
    } = req.query;

    num = Number.parseInt(num);
    offset = Number.parseInt(num);

    if (num)
    {
        if (!Number.isInteger(num) || num < 0)
        {
            next(httpError(400, 'Request parameter \'num\' is invalid.'));
        }
    }

    if (offset)
    {
        if (!Number.isInteger(offset) || offset < 0)
        {
            next(httpError(400, 'Request parameter \'offset\' is invalid.'));
        }
    }

    if (orderBy)
    {
        if (!Array.isArray(orderBy))
        {
            next(httpError(400, 'Request parameter \'orderBy\' is invalid.'));
        }
    }

    if (session)
    {
        let userDb = req.app.get('user-db');
        let user = null;

        try
        {
            user = await userDb.getUser(session.username);
        }
        catch (error)
        {
            if (error.message === USER_NOT_FOUND)
            {
                next(httpError(404), error.message);
            }
            else
            {
                next(httpError(500));
            }

            return;
        }
    }
    else
    {
        next(httpError(401));
    }
});

module.exports = contactsApiRouter;