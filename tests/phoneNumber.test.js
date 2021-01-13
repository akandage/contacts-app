const assert = require('assert');
const PhoneNumber = require('../phoneNumber');

test('Test valid US/Canada phone number.', () => {
    let phoneNum;

    assert.ok(PhoneNumber.isValidUSAOrCanada('1234567890'));
    assert.doesNotThrow(() => {
        phoneNum = new PhoneNumber('1234567890');
    });
    assert.strictEqual(phoneNum.countryCode, '1');
    assert.strictEqual(phoneNum.areaCode, '123');
    assert.strictEqual(phoneNum.phoneNumber, '1234567890');
});

test('Test valid US/Canada phone number with spaces between parts.', () => {
    let phoneNum;

    assert.ok(PhoneNumber.isValidUSAOrCanada('123 456 7890'));
    assert.doesNotThrow(() => {
        phoneNum = new PhoneNumber('123 456 7890');
    });
    assert.strictEqual(phoneNum.countryCode, '1');
    assert.strictEqual(phoneNum.areaCode, '123');
    assert.strictEqual(phoneNum.phoneNumber, '1234567890');
});

test('Test valid US/Canada phone number with dashes between parts.', () => {
    let phoneNum;

    assert.ok(PhoneNumber.isValidUSAOrCanada('123-456-7890'));
    assert.doesNotThrow(() => {
        phoneNum = new PhoneNumber('123-456-7890');
    });
    assert.strictEqual(phoneNum.countryCode, '1');
    assert.strictEqual(phoneNum.areaCode, '123');
    assert.strictEqual(phoneNum.phoneNumber, '1234567890');
});

test('Test valid US/Canada phone number with country code.', () => {
    let phoneNum;

    assert.ok(PhoneNumber.isValidUSAOrCanada('11234567890'));
    assert.doesNotThrow(() => {
        phoneNum = new PhoneNumber('11234567890');
    });
    assert.strictEqual(phoneNum.countryCode, '1');
    assert.strictEqual(phoneNum.areaCode, '123');
    assert.strictEqual(phoneNum.phoneNumber, '1234567890');

    assert.ok(PhoneNumber.isValidUSAOrCanada('+11234567890'));
    assert.doesNotThrow(() => {
        phoneNum = new PhoneNumber('+11234567890');
    });
    assert.strictEqual(phoneNum.countryCode, '1');
    assert.strictEqual(phoneNum.areaCode, '123');
    assert.strictEqual(phoneNum.phoneNumber, '1234567890');

    assert.ok(PhoneNumber.isValidUSAOrCanada('1 123 456 7890'));
    assert.doesNotThrow(() => {
        phoneNum = new PhoneNumber('1 123 456 7890');
    });
    assert.strictEqual(phoneNum.countryCode, '1');
    assert.strictEqual(phoneNum.areaCode, '123');
    assert.strictEqual(phoneNum.phoneNumber, '1234567890');

    assert.ok(PhoneNumber.isValidUSAOrCanada('+1 123 456 7890'));
    assert.doesNotThrow(() => {
        phoneNum = new PhoneNumber('+1 123 456 7890');
    });
    assert.strictEqual(phoneNum.countryCode, '1');
    assert.strictEqual(phoneNum.areaCode, '123');
    assert.strictEqual(phoneNum.phoneNumber, '1234567890');

    assert.ok(PhoneNumber.isValidUSAOrCanada('+1 123-456-7890'));
    assert.doesNotThrow(() => {
        phoneNum = new PhoneNumber('+1 123-456-7890');
    });
    assert.strictEqual(phoneNum.countryCode, '1');
    assert.strictEqual(phoneNum.areaCode, '123');
    assert.strictEqual(phoneNum.phoneNumber, '1234567890');
});

test('Test invalid US/Canada phone number.', () => {
    assert.ok(!PhoneNumber.isValidUSAOrCanada('123'));
    assert.throws(() => {
        new PhoneNumber('123');
    });
    assert.ok(!PhoneNumber.isValidUSAOrCanada('123456'));
    assert.throws(() => {
        new PhoneNumber('123456');
    });
    assert.ok(!PhoneNumber.isValidUSAOrCanada('123 456'));
    assert.throws(() => {
        new PhoneNumber('123 456');
    });
    assert.ok(!PhoneNumber.isValidUSAOrCanada('123-456'));
    assert.throws(() => {
        new PhoneNumber('123-456');
    });
    assert.ok(!PhoneNumber.isValidUSAOrCanada('123 4567 7890'));
    assert.throws(() => {
        new PhoneNumber('123 4567 7890');
    });
    assert.ok(!PhoneNumber.isValidUSAOrCanada('123 456 78901'));
    assert.throws(() => {
        new PhoneNumber('123 456 78901');
    });
});

test('Test invalid US/Canada phone number (incorrect country code).', () => {
    assert.ok(!PhoneNumber.isValidUSAOrCanada('21234567890'));
    assert.doesNotThrow(() => {
        new PhoneNumber('21234567890');
    });
    assert.ok(!PhoneNumber.isValidUSAOrCanada('+21234567890'));
    assert.doesNotThrow(() => {
        new PhoneNumber('21234567890');
    });
    assert.ok(!PhoneNumber.isValidUSAOrCanada('221234567890'));
    assert.doesNotThrow(() => {
        new PhoneNumber('221234567890');
    });
    assert.ok(!PhoneNumber.isValidUSAOrCanada('+221234567890'));
    assert.doesNotThrow(() => {
        new PhoneNumber('+221234567890');
    });
    assert.ok(!PhoneNumber.isValidUSAOrCanada('2221234567890'));
    assert.doesNotThrow(() => {
        new PhoneNumber('2221234567890');
    });
    assert.ok(!PhoneNumber.isValidUSAOrCanada('+2221234567890'));
    assert.doesNotThrow(() => {
        new PhoneNumber('+2221234567890');
    });
});