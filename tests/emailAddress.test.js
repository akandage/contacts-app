const assert = require('assert');
const { EmailAddress } = require('../emailAddress');

test('Test valid email address.', () => {
    let email;

    assert.doesNotThrow(() => {
        email = new EmailAddress('adam@coolmail.com');
    });
    assert.strictEqual(email.localPart, 'adam');
    assert.strictEqual(email.domain, 'coolmail.com');
});

test('Test valid email address with \".\" in local part.', () => {
    let email;

    assert.doesNotThrow(() => {
        email = new EmailAddress('adam.ant@coolmail.com');
    });
    assert.strictEqual(email.localPart, 'adam.ant');
    assert.strictEqual(email.domain, 'coolmail.com');
});

// TODO: More positive tests.

test('Test invalid email address (no domain).', () => {
    assert.throws(() => {
        new EmailAddress('adam');
    });
});

test('Test invalid email address (no local part).', () => {
    assert.throws(() => {
        new EmailAddress('@coolmail.com');
    });
});

// TODO: More negative tests.