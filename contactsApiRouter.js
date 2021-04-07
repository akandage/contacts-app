const debug = require('debug')('contacts-api-router');
const express = require('express');
const fs = require('fs');
const httpError = require('http-errors');
const jimp = require('jimp');
const path = require('path');
const uuid = require('uuid');
const { validateOrderBy } = require('./db');
const { CONTACT_NOT_FOUND, DEFAULT_CONTACTS_ORDERBY, DEFAULT_GROUPS_ORDERBY, INVALID_CONTACT, INVALID_GROUP, INVALID_SEARCH_TERMS } = require('./contactDb');
const { FILE_NOT_FOUND, FILE_UUID_NOT_UNIQUE, INVALID_FILE_UUID, INVALID_FILE_EXTENSION, INVALID_USER } = require('./uploadedFilesDb');
const { INVALID_EMAIL_ADDRESS, INVALID_OLD_PASSWORD, INVALID_PASSWORD, INVALID_PHONE_NUMBER, INVALID_USERNAME, USER_EXISTS_WITH_EMAIL_ADDRESS, USER_EXISTS_WITH_PHONE_NUMBER, USER_NOT_FOUND } = require('./userDb');
const contactsApiRouter = express.Router();

const UPLOAD_IMAGE_TYPES = [
    'image/x-png',
    'image/jpeg'
];
const UPLOAD_IMAGE_EXTS = {
    'image/x-png': 'png',
    'image/jpeg': 'jpg'
};

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

contactsApiRouter.get('/api/contacts/search', async (req, res, next) => {
    let session = req.session;
    let {
        searchTerms,
        limit
    } = req.query;

    if (!Array.isArray(searchTerms))
    {
        if (searchTerms !== null && searchTerms !== undefined && searchTerms !== '')
        {
            searchTerms = [ searchTerms ];
        }
        else
        {
            searchTerms = [];
        }
    }

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
            contacts = await contactDb.searchContacts(user, searchTerms, limit);
            debug(`Search found ${contacts.length} contacts`);
        }
        catch (error)
        {
            console.log(error);

            if (error.message === USER_NOT_FOUND)
            {
                next(httpError(404, error.message));
            }
            else if (error.message === INVALID_SEARCH_TERMS)
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
        let contact = null;

        try
        {
            user = await userDb.getUser(session.username);
            debug(`Request user ${user.username}`);
            contact = await contactDb.getContact(user, contactId);

            if (contact.profilePictureUrl !== null)
            {
                let uploadedFilesDb = req.app.get('uploaded-files-db');

                try
                {
                    let urlParts = contact.profilePictureUrl.split('/');
                    let fileUuid = urlParts[urlParts.length - 1];

                    await uploadedFilesDb.unregisterUploadedFile(user, fileUuid);
                    debug(`Deleted contact ${contactId} profile picture: ${fileUuid}`);
                }
                catch (error)
                {
                    console.log(`Error deleting contact ${contactId} profile picture ${fileUuid}: ${error}`);
                }
            }

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

contactsApiRouter.post(/^\/api\/(contacts|user)\/profile-picture$/, async (req, res, next) => {
    let session = req.session;
    let uploadFiles = req.files;

    if (!Array.isArray(uploadFiles) || uploadFiles.length === 0)
    {
        next(httpError(400, 'No images uploaded.'));
        return;
    }

    if (uploadFiles.length !== 1 || !UPLOAD_IMAGE_TYPES.includes(uploadFiles[0].type))
    {
        next(httpError(400, 'Only a single jpeg or png image may be uploaded.'))
        return;
    }

    let uploadFile = uploadFiles[0];

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');
        let uploadedFilesDb = req.app.get('uploaded-files-db');
        let user = null;

        try
        {
            user = await userDb.getUser(session.username);
            debug(`Request user ${user.username}`);

            let uploadImageId = null;
            let uploadImageDir = req.app.get('uploads-directory');
            let uploadImagePath = null;
            let uploadImageFile = null;
            let ext = UPLOAD_IMAGE_EXTS[uploadFile.type];

            while (true)
            {
                try
                {
                    uploadImageId = uuid.v4();
                    uploadImagePath = path.join(__dirname, uploadImageDir, `${uploadImageId}.${ext}`);
                    uploadImageFile = fs.openSync(uploadImagePath, 'wx');
                    break;
                }
                catch (error)
                {
                    if (!error.message.includes('EEXISTS'))
                    {
                        throw error;
                    }
                }
            }

            try
            {
                // Register the file before generating it to avoid it being deleted
                // the background cleanup task.
                await uploadedFilesDb.registerUploadedFile(user, uploadImageId, ext);
            }
            catch (error)
            {
                try
                {
                    fs.closeSync(uploadImageFile);
                }
                catch (error1)
                {
                    // Ignore.
                }

                throw error;
            }

            try
            {
                for (let chunk of uploadFile.chunks)
                {
                    fs.writeSync(uploadImageFile, chunk);
                }

                fs.closeSync(uploadImageFile);
            }
            catch (error)
            {
                try
                {
                    fs.closeSync(uploadImageFile);
                }
                catch (error1)
                {
                    // Ignore.
                }

                throw error;
            }

            const cropWidth = req.app.get('contact-profile-picture-width');
            const cropHeight = req.app.get('contact-profile-picture-height');
            let processedImage = await jimp.read(uploadImagePath);
            // let origImageWidth = processedImage.bitmap.width;
            // let origImageHeight = processedImage.bitmap.height;

            processedImage.cover(cropWidth, cropHeight);
            await processedImage.writeAsync(uploadImagePath);
            
            res.set('Location', `${req.path}/${uploadImageId}`);
            res.status(200).send();
        }
        catch (error)
        {
            console.log(error);

            if (error.message === INVALID_FILE_UUID || error.message === INVALID_FILE_EXTENSION || error.message === INVALID_USER)
            {
                next(httpError(400, error.message));
            }
            else if (error.message === USER_NOT_FOUND)
            {
                next(httpError(404, error.message));
            }
            else if (error.message === FILE_UUID_NOT_UNIQUE)
            {
                next(httpError(409, error.message));
            }
            else
            {
                next(httpError(500, error.message));
            }

            return;
        }
    }
    else
    {
        debug('Request does not have session.');
        next(httpError(401));
    }
});

contactsApiRouter.get(/^\/api\/(contacts|user)\/profile-picture\/([\w-]+)$/, async (req, res, next) => {
    let session = req.session;
    let fileUuid = req.params[1];

    if (fileUuid === null || fileUuid === undefined || !uuid.validate(fileUuid) || uuid.version(fileUuid) !== 4)
    {
        next(httpError(400, 'File UUID is invalid.'));
        return;
    }

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');
        let uploadedFilesDb = req.app.get('uploaded-files-db');
        let user = null;

        try
        {
            user = await userDb.getUser(session.username);
            debug(`Request user ${user.username}`);
            
            let file = await uploadedFilesDb.getUploadedFile(user, fileUuid);
            let filePath = path.join(__dirname, req.app.get('uploads-directory'), `${file.uuid}.${file.fileExtension}`);

            if (!fs.existsSync(filePath))
            {
                try
                {
                    await uploadedFilesDb.unregisterUploadedFile(user, fileUuid);
                }
                catch (error)
                {
                    // Ignore.
                }

                next(httpError(404, 'File not found.'));
                return;
            }

            res.sendFile(filePath, (err) => {
                if (err)
                {
                    next(err);
                }
            });
        }
        catch (error)
        {
            console.log(error);

            if (error.message === FILE_NOT_FOUND || error.message === USER_NOT_FOUND)
            {
                next(httpError(404, error.message));
            }
            else
            {
                next(httpError(500, error.message));
            }

            return;
        }
    }
    else
    {
        debug('Request does not have session.');
        next(httpError(401));
    }
});

contactsApiRouter.delete(/^\/api\/(contacts|user)\/profile-picture\/([\w-]+)$/, async (req, res, next) => {
    let session = req.session;
    let fileUuid = req.params[1];

    if (fileUuid === null || fileUuid === undefined || !uuid.validate(fileUuid) || uuid.version(fileUuid) !== 4)
    {
        next(httpError(400, 'File UUID is invalid.'));
        return;
    }

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');
        let uploadedFilesDb = req.app.get('uploaded-files-db');
        let user = null;

        try
        {
            user = await userDb.getUser(session.username);
            debug(`Request user ${user.username}`);
            await uploadedFilesDb.unregisterUploadedFile(user, fileUuid);
        }
        catch (error)
        {
            console.log(error);

            if (error.message === FILE_NOT_FOUND || error.message === USER_NOT_FOUND)
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

contactsApiRouter.put('/api/groups/:id', async (req, res, next) => {
    let session = req.session;
    let groupId = req.params.id;

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');
        let contactDb = req.app.get('contact-db');
        let user = null;
        let group = Object.assign({}, req.body);

        group._id = groupId;

        try
        {
            user = await userDb.getUser(session.username);
            debug(`Request user ${user.username}`);
            await contactDb.putGroup(user, group);
            debug(`Put group ${group._id}`);
        }
        catch (error)
        {
            console.log(error);

            if (error.message === GROUP_NOT_FOUND || error.message === USER_NOT_FOUND)
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

contactsApiRouter.delete('/api/groups/:id', async (req, res, next) => {
    let session = req.session;
    let groupId = req.params.id;

    if (groupId === null || groupId === undefined || groupId.length === 0)
    {
        next(httpError(400, 'Group id is invalid.'));
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
            await contactDb.deleteGroup(user, groupId);
            debug(`Successfully deleted group ${groupId}`);
        }
        catch (error)
        {
            console.log(error);

            if (error.message === GROUP_NOT_FOUND || error.message === USER_NOT_FOUND)
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

contactsApiRouter.get('/api/user', async (req, res, next) => {
    let session = req.session;
    let {
        username,
        emailAddress,
        phoneNumber
    } = req.query;

    if (username !== null && username !== undefined && (typeof username !== 'string' || username.length === 0))
    {
        next(httpError(400, 'Request parameter \'username\' is invalid.'));
        return;
    }

    if (emailAddress !== null && emailAddress !== undefined && (typeof emailAddress !== 'string' || emailAddress.length === 0))
    {
        next(httpError(400, 'Request parameter \'emailAddress\' is invalid.'));
        return;
    }

    if (phoneNumber !== null && phoneNumber !== undefined && (typeof phoneNumber !== 'string' || phoneNumber.length === 0))
    {
        next(httpError(400, 'Request parameter \'phoneNumber\' is invalid.'));
        return;
    }

    let userDb = req.app.get('user-db');
    let user = null;

    try
    {
        if (username)
        {
            user = await userDb.getUser(username);
        }
        else if (emailAddress)
        {
            user = await userDb.getUserByEmailAddress(emailAddress);
        }
        else if (phoneNumber)
        {
            user = await userDb.getUserByPhoneNumber(phoneNumber);
        }
        else if (session)
        {
            debug(`Request session ${session.sessionId}`);
            user = await userDb.getUser(session.username);
        }
        else
        {
            debug('Request does not have session.');
            next(httpError(401));
            return;
        }

        debug(`Request user ${user.username}`);

        // Remove the password field.
        delete user.password;
    }
    catch (error)
    {
        if (error.message === USER_NOT_FOUND)
        {
            next(httpError(404, error.message));
        }
        else
        {
            console.log(error);
            next(httpError(500, error.message));
        }

        return;
    }

    res.status(200)
        .send(user);
});

contactsApiRouter.put('/api/user/profile-picture', async (req, res, next) => {
    let session = req.session;
    let {
        value
    } = req.query;

    if (value === null || value === undefined || typeof value !== 'string' || value.length === 0)
    {
        next(httpError(400, 'Request parameter \'value\' is invalid.'));
        return;
    }

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');

        try
        {
            debug(`Request user ${session.username}`);
            await userDb.changeUserProfilePicture(session.username, `/api/user/profile-picture/${value}`);
            debug(`Successfully changed user ${session.username} profile picture.`);
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

        res.status(200).send();
    }
    else
    {
        debug('Request does not have session.');
        next(httpError(401));
    }
});

contactsApiRouter.put('/api/user/email-address', async (req, res, next) => {
    let session = req.session;
    let {
        value
    } = req.query;

    if (value === null || value === undefined || typeof value !== 'string' || value.length === 0)
    {
        next(httpError(400, 'Request parameter \'value\' is invalid.'));
        return;
    }

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');

        try
        {
            debug(`Request user ${session.username}`);
            await userDb.changeUserEmailAddress(session.username, value);
            debug(`Successfully changed user ${session.username} email address.`);
        }
        catch (error)
        {
            console.log(error);

            if (error.message === INVALID_EMAIL_ADDRESS)
            {
                next(httpError(400, error.message));
            }
            else if (error.message === USER_NOT_FOUND)
            {
                next(httpError(404, error.message));
            }
            else if (error.message === USER_EXISTS_WITH_EMAIL_ADDRESS)
            {
                next(httpError(409, error.message));
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

contactsApiRouter.put('/api/user/phone-number', async (req, res, next) => {
    let session = req.session;
    let {
        value
    } = req.query;

    if (value === null || value === undefined || typeof value !== 'string' || value.length === 0)
    {
        next(httpError(400, 'Request parameter \'value\' is invalid.'));
        return;
    }

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');

        try
        {
            debug(`Request user ${session.username}`);
            await userDb.changeUserPhoneNumber(session.username, value);
            debug(`Successfully changed user ${session.username} phone number.`);
        }
        catch (error)
        {
            console.log(error);

            if (error.message === INVALID_PHONE_NUMBER)
            {
                next(httpError(400, error.message));
            }
            else if (error.message === USER_NOT_FOUND)
            {
                next(httpError(404, error.message));
            }
            else if (error.message === USER_EXISTS_WITH_PHONE_NUMBER)
            {
                next(httpError(409, error.message));
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

contactsApiRouter.put('/api/user/password', async (req, res, next) => {
    let session = req.session;
    let {
        oldPassword,
        newPassword
    } = req.query;

    if (oldPassword === null || oldPassword === undefined || typeof oldPassword !== 'string' || oldPassword.length === 0)
    {
        next(httpError(400, 'Request parameter \'oldPassword\' is invalid.'));
        return;
    }

    if (newPassword === null || newPassword === undefined || typeof newPassword !== 'string' || newPassword.length === 0)
    {
        next(httpError(400, 'Request parameter \'newPassword\' is invalid.'));
        return;
    }

    if (session)
    {
        debug(`Request session ${session.sessionId}`);

        let userDb = req.app.get('user-db');

        try
        {
            debug(`Request user ${session.username}`);
            await userDb.changeUserPassword(session.username, oldPassword, newPassword);
            debug(`Successfully changed user ${session.username} password.`);
        }
        catch (error)
        {
            console.log(error);

            if (error.message === INVALID_PASSWORD)
            {
                next(httpError(400, error.message));
            }
            else if (error.message === USER_NOT_FOUND)
            {
                next(httpError(404, error.message));
            }
            else if (error.message === INVALID_OLD_PASSWORD)
            {
                next(httpError(409, error.message));
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