export const STATUS = {
    START: 'START',
    LOADING: 'LOADING',
    REFRESHING: 'REFRESHING',
    ADD_CONTACT: 'ADD_CONTACT',
    CONFIRM_ACTION: 'CONFIRM_ACTION',
    IDLE: 'IDLE'
}

export const CONFIRM_ACTION_TYPE = {
    DELETE: 'DELETE'
};

export const CONTACTS_ORDERBY_FIRSTNAME_ASC = ['firstName', 'ASC', 'lastName', 'ASC'];
export const DEFAULT_CONTACTS_ORDERBY = CONTACTS_ORDERBY_FIRSTNAME_ASC;
export const CONTACTS_ORDERBY_FIRSTNAME_DESC = ['firstName', 'DESC', 'lastName', 'DESC'];
export const CONTACTS_ORDERBY_LASTNAME_ASC = ['lastName', 'ASC', 'firstName', 'ASC'];
export const CONTACTS_ORDERBY_LASTNAME_DESC = ['lastName', 'DESC', 'firstName', 'DESC'];

// Names (first, middle, last) may only contain letters and must start with a capital letter.
// Allow single letter names.
export const NAME_REGEX = /^[A-Z][a-zA-Z-']*$/;

export const EMAIL_ADDRESS_TYPES = [
    'Personal',
    'Work',
    'Business',
    'Other'
];
export const PHONE_NUMBER_TYPES = [
    'Home',
    'Work',
    'Cell (Personal)',
    'Cell (Work)',
    'Cell (Business)',
    'Fax (Home)',
    'Fax (Work)',
    'Fax (Business)',
    'Other'
];