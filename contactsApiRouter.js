const debug = require('debug')('contacts-api-router');
const express = require('express');
const httpError = require('http-errors');
const { validateOrderBy } = require('./db');
const { CONTACT_NOT_FOUND, DEFAULT_CONTACTS_ORDERBY } = require('./contactDb');
const { USER_NOT_FOUND } = require('./userDb');
const contactsApiRouter = express.Router();

contactsApiRouter.put('/api/contacts/:id', async (req, res, next) => {

});

contactsApiRouter.get('/api/contacts', async (req, res, next) => {
    let session = req.session;
    let {
        limit,  // Number of contacts to retrieve.
        offset, // Offset of first contact in the order list.
        orderBy
    } = req.query;

    if (limit !== null && limit !== undefined)
    {
        limit = Number.parseInt(limit);

        if (!Number.isInteger(limit) || limit < 0)
        {
            next(httpError(400, 'Request parameter \'limit\' is invalid.'));
            return;
        }
    }
    else
    {
        limit = null;
    }

    if (offset !== null && offset !== undefined)
    {
        offset = Number.parseInt(offset);

        if (!Number.isInteger(offset) || offset < 0)
        {
            next(httpError(400, 'Request parameter \'offset\' is invalid.'));
            return;
        }
    }
    else
    {
        offset = 0;
    }

    if (orderBy !== null && orderBy !== undefined)
    {
        if (!validateOrderBy(orderBy))
        {
            next(httpError(400, 'Request parameter \'orderBy\' is invalid.'));
            return;
        }
    }
    else
    {
        orderBy = DEFAULT_CONTACTS_ORDERBY;
    }

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');
        let contactDb = req.app.get('contact-db');
        let user = null;
        let contacts = null;

        try
        {
            user = await userDb.getUser(session.username);
            debug(`Request user ${user.username}`);
            contacts = await contactDb.getContactList(user, limit, offset, orderBy);
            debug(`Retrieved ${contacts.length} contacts.`);
        }
        catch (error)
        {
            console.log(error);

            if (error.message === USER_NOT_FOUND)
            {
                next(httpError(404, error.message));
            }
            else
            {
                next(httpError(500, error.message));
            }

            return;
        }

        res.status(200)
            .send(contacts);
    }
    else
    {
        debug('Request does not have session.');
        next(httpError(401));
    }
});

contactsApiRouter.delete('/api/contacts/:id', async (req, res, next) => {
    let session = req.session;
    let contactId = req.params.id;

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');
        let contactDb = req.app.get('contact-db');
        let user = null;

        try
        {
            user = await userDb.getUser(session.username);
            debug(`Request user ${user.username}`);
            await contactDb.deleteContact(user, contactId);
            debug(`Successfully deleted contact ${contactId}`);
        }
        catch (error)
        {
            console.log(error);

            if (error.message === CONTACT_NOT_FOUND || error.message === USER_NOT_FOUND)
            {
                next(httpError(404, error.message));
            }
            else
            {
                next(httpError(500, error.message));
            }

            return;
        }

        res.status(200).send();
    }
    else
    {
        debug('Request does not have session.');
        next(httpError(401));
    }
});

contactsApiRouter.use((err, req, res, next) => {
    console.log(`Contacts API error: ${err.status} ${err.message} ${err}`);

    res.status(err.status)
        .send({
            status: err.status,
            message: err.message
        });
});

module.exports = contactsApiRouter;