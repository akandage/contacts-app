const debug = require('debug')('contacts-api-router');
const express = require('express');
const httpError = require('http-errors');
const { validateOrderBy } = require('./db');
const { CONTACT_NOT_FOUND, DEFAULT_CONTACTS_ORDERBY, DEFAULT_GROUPS_ORDERBY, INVALID_CONTACT, INVALID_GROUP } = require('./contactDb');
const { USER_NOT_FOUND } = require('./userDb');
const contactsApiRouter = express.Router();

contactsApiRouter.post('/api/contacts', async (req, res, next) => {
    let session = req.session;

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');
        let contactDb = req.app.get('contact-db');
        let user = null;
        let contact = null;

        try
        {
            user = await userDb.getUser(session.username);
            debug(`Request user ${user.username}`);
            contact = await contactDb.createContact(user, req.body);
            debug(`Created contact ${contact._id}`);
        }
        catch (error)
        {
            console.log(error);

            if (error.message === USER_NOT_FOUND)
            {
                next(httpError(404, error.message));
            }
            else if (error.message === INVALID_CONTACT)
            {
                next(httpError(400, error.message));
            }
            else
            {
                next(httpError(500, error.message));
            }

            return;
        }

        res.set('Location', `/api/contacts/${contact._id}`);
        res.status(200)
            .send(contact);
    }
    else
    {
        debug('Request does not have session.');
        next(httpError(401));
    }
});

contactsApiRouter.put('/api/contacts/:id', async (req, res, next) => {
    let session = req.session;
    let contactId = req.params.id;

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');
        let contactDb = req.app.get('contact-db');
        let user = null;
        let contact = Object.assign({}, req.body);

        contact._id = contactId;

        try
        {
            user = await userDb.getUser(session.username);
            debug(`Request user ${user.username}`);
            await contactDb.putContact(user, contact);
            debug(`Put contact ${contact._id}`);
        }
        catch (error)
        {
            console.log(error);

            if (error.message === USER_NOT_FOUND)
            {
                next(httpError(404, error.message));
            }
            else if (error.message === INVALID_CONTACT)
            {
                next(httpError(400, error.message));
            }
            else
            {
                next(httpError(500, error.message));
            }

            return;
        }

        res.status(200)
            .send();
    }
    else
    {
        debug('Request does not have session.');
        next(httpError(401));
    }
});

contactsApiRouter.put('/api/contacts/:id/favorite', async (req, res, next) => {
    let session = req.session;
    let contactId = req.params.id;
    let {
        value
    } = req.query;

    if (contactId === null || contactId === undefined || contactId.length === 0)
    {
        next(httpError(400, 'Contact id is invalid.'));
        return;
    }

    if (value !== 'true' && value !== 'false')
    {
        next(httpError(400, 'Request parameter \'value\' is invalid.'));
        return;
    }

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');
        let contactDb = req.app.get('contact-db');
        let user = null;
        let contact = null;

        try
        {
            user = await userDb.getUser(session.username);
            debug(`Request user ${user.username}`);
            contact = await contactDb.favoriteContact(user, contactId, value === 'true');
            debug(`Set contact ${contactId} favorite=${value}`);
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

        res.status(200)
            .send(contact);
    }
    else
    {
        debug('Request does not have session.');
        next(httpError(401));
    }
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

    if (contactId === null || contactId === undefined || contactId.length === 0)
    {
        next(httpError(400, 'Contact id is invalid.'));
        return;
    }

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

contactsApiRouter.post('/api/groups', async (req, res, next) => {
    let session = req.session;
    let {
        name,
        contactIds
    } = req.body;

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');
        let contactDb = req.app.get('contact-db');
        let user = null;
        let group = null;

        try
        {
            user = await userDb.getUser(session.username);
            debug(`Request user ${user.username}`);
            group = await contactDb.createGroup(user, name, contactIds);
            debug(`Created group ${group._id}`);
        }
        catch (error)
        {
            console.log(error);

            if (error.message === USER_NOT_FOUND)
            {
                next(httpError(404, error.message));
            }
            else if (error.message === INVALID_GROUP)
            {
                next(httpError(400, error.message));
            }
            else
            {
                next(httpError(500, error.message));
            }

            return;
        }

        res.set('Location', `/api/groups/${group._id}`);
        res.status(200)
            .send(group);
    }
    else
    {
        debug('Request does not have session.');
        next(httpError(401));
    }
});

contactsApiRouter.get('/api/groups', async (req, res, next) => {
    let session = req.session;
    let {
        limit,  // Number of groups to retrieve.
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
        orderBy = DEFAULT_GROUPS_ORDERBY;
    }

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');
        let contactDb = req.app.get('contact-db');
        let user = null;
        let groups = null;

        try
        {
            user = await userDb.getUser(session.username);
            debug(`Request user ${user.username}`);
            groups = await contactDb.getGroupList(user, limit, offset, orderBy);
            debug(`Retrieved ${groups.length} groups.`);
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
            .send(groups);
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