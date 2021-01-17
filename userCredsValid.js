/**
 * Logic for user credentials validation, password strength etc.
 * Separate this out so both client and server can use it.
 */

const PASSWORD_REGEX = /[a-zA-Z0-9-_`'"~!?@#$%^&*()+=\[\]{|}\\/;:,<.>]+/;
const INVALID_PASSWORD = 'Invalid password. Must only contain alphanumeric characters, dashes, underscores and special characters (!,@,? etc.).';
const USERNAME_REGEX = /^[a-zA-Z][a-zA-Z0-9_]*$/;
const MIN_USERNAME_LENGTH = 8;
const INVALID_USERNAME = `Invalid username. Must start with a letter, can only contain alphanumeric characters and underscores and must be at least ${MIN_USERNAME_LENGTH} characters in length.`;

function isUsernameValid(username)
{
    if (username === undefined || username === null
        || typeof username !== 'string' || username.length < MIN_USERNAME_LENGTH)
    {
        return false;
    }

    return USERNAME_REGEX.test(username);
}

function isPasswordValid(password)
{
    if (password === undefined || password === null
        || typeof password !== 'string' || password.length === 0)
    {
        return false;
    }

    return PASSWORD_REGEX.test(password);
}

module.exports = {
    INVALID_USERNAME,
    INVALID_PASSWORD,
    MIN_USERNAME_LENGTH,
    isUsernameValid,
    isPasswordValid
}