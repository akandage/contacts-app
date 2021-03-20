const debug = require('debug')('uploaded-files-db');
const fs = require('fs');
const mongoose = require('mongoose');
const path = require('path');
const uuid = require('uuid');

const UPLOADED_FILES_SCHEMA = 'uploaded-files';
const CLEANUP_TIMER_INTERVAL = 60 * 1000;
const FILE_NOT_FOUND = 'Uploaded file not found.';
const FILE_UUID_NOT_UNIQUE = 'Uploaded file UUID is not unique.';
const INVALID_FILE_UUID = 'Invalid file UUID.';
const INVALID_FILE_EXTENSION = 'Invalid file extension.';
const INVALID_USER = 'Invalid user.';

const UPLOADS_DIRECTORY = process.env.UPLOADS_DIRECTORY || './uploads';
const UPLOADS_DIRECTORY_PATH = path.join(__dirname, UPLOADS_DIRECTORY);

const UploadedFileSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UserModel'
    },
    uuid: {
        type: String,
        required: true,
        unique: [ true, FILE_UUID_NOT_UNIQUE ]
    },
    fileExtension: {
        type: String,
        required: true
    }
});

class UploadedFilesDb
{
    constructor(db)
    {
        this._db = db ? db : null;
        this._model = db ? db.model('UploadedFilesModel', UploadedFileSchema, UPLOADED_FILES_SCHEMA) : null;
    }

    set connection(db)
    {
        if (!db)
        {
            throw new Error('Invalid argument: db');
        }

        this._db = db;
        this._model = db.model('UploadedFilesModel', UploadedFileSchema, UPLOADED_FILES_SCHEMA);
        this._cleanupTimer = null;
    }

    get connection()
    {
        return this._db;
    }

    async start()
    {
        debug('Starting UploadedFilesDb.');

        await this._model.init();
        this.setCleanupTimeout();

        debug('Started UploadedFilesDb.');
    }

    async stop()
    {
        debug('Stopping UploadedFilesDb.');

        if (this._cleanupTimer)
        {
            clearTimeout(this._cleanupTimer);
            this._cleanupTimer = null;
        }

        debug('Stopped UploadedFilesDb.');
    }

    setCleanupTimeout()
    {
        this._cleanupTimer = setTimeout(
            () => {
                this.cleanup();
            }, CLEANUP_TIMER_INTERVAL
        );
    }

    async cleanup()
    {
        // Cleanup uploaded files which have been unregistered.
        debug('Cleaning uploaded files.');

        try
        {
            let numRemovedFiles = 0;
            let uploadedFiles = fs.readdirSync(UPLOADS_DIRECTORY_PATH);

            for (let fileName of uploadedFiles)
            {
                let parts = fileName.split('.');

                if (parts.length === 2)
                {
                    let fileUuid = parts[0];

                    if (uuid.validate(fileUuid) && uuid.version(fileUuid) === 4)
                    {
                        let isRegistered = await this.isUploadedFile(null, fileUuid);

                        if (!isRegistered)
                        {
                            try
                            {
                                fs.rmSync(path.join(UPLOADS_DIRECTORY_PATH, fileName));
                                debug(`Removed uploaded file ${fileName}.`);
                                ++numRemovedFiles;
                            }
                            catch (error)
                            {
                                console.error(`Error removing uploaded file ${fileName}: ${error}`);
                            }
                        }
                    }
                }
            }

            debug(`Cleaned uploaded files. Removed ${numRemovedFiles} files.`);
        }
        catch (error)
        {
            console.error(`Error trying to clean uploaded files: ${error}`);
            this.setCleanupTimeout();
            return;
        }

        this.setCleanupTimeout();
    }

    async registerUploadedFile(user, fileUuid, fileExtension)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        if (fileUuid === null || fileUuid === undefined || !uuid.validate(fileUuid) || uuid.version(fileUuid) !== 4)
        {
            throw new Error(INVALID_FILE_UUID);
        }

        if (fileExtension === null || fileExtension === undefined || typeof fileExtension !== 'string' || fileExtension.length === 0)
        {
            throw new Error(INVALID_FILE_EXTENSION);
        }

        let uploadedFile = await this._model.create({
            owner: user._id,
            uuid: fileUuid,
            fileExtension
        });

        return uploadedFile;
    }

    async isUploadedFile(user, fileUuid)
    {
        if (fileUuid === null || fileUuid === undefined || !uuid.validate(fileUuid) || uuid.version(fileUuid) !== 4)
        {
            throw new Error(INVALID_FILE_UUID);
        }

        let uploadedFile = null;

        if (user !== null && user !== undefined && user._id !== null && user._id !== undefined)
        {
            uploadedFile = await this._model.findOne({
                owner: user._id,
                uuid: fileUuid
            }).exec();
        }
        else
        {
            uploadedFile = await this._model.findOne({
                uuid: fileUuid
            }).exec();
        }

        if (!uploadedFile)
        {
            return false;
        }

        return true;
    }

    async getUploadedFile(user, fileUuid)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        if (fileUuid === null || fileUuid === undefined || !uuid.validate(fileUuid) || uuid.version(fileUuid) !== 4)
        {
            throw new Error(INVALID_FILE_UUID);
        }

        let uploadedFile = await this._model.findOne({
            owner: user._id,
            uuid: fileUuid
        }).exec();

        if (!uploadedFile)
        {
            throw new Error(FILE_NOT_FOUND);
        }

        return uploadedFile;
    }

    async unregisterUploadedFile(user, fileUuid)
    {
        if (user === null || user === undefined || user._id === null || user._id === undefined)
        {
            throw new Error(INVALID_USER);
        }

        if (fileUuid === null || fileUuid === undefined || !uuid.validate(fileUuid) || uuid.version(fileUuid) !== 4)
        {
            throw new Error(INVALID_FILE_UUID);
        }

        let uploadedFile = await this.getUploadedFile(user, fileUuid);

        await uploadedFile.remove();
    }
}

module.exports = {
    UploadedFilesDb,
    FILE_NOT_FOUND,
    FILE_UUID_NOT_UNIQUE,
    INVALID_FILE_UUID,
    INVALID_FILE_EXTENSION,
    INVALID_USER
};