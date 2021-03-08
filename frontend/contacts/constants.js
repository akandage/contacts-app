export const STATUS = {
    START: 'START',
    LOADING: 'LOADING',
    REFRESHING: 'REFRESHING',
    ADD_CONTACT: 'ADD_CONTACT',
    EDIT_CONTACT: 'EDIT_CONTACT',
    EDIT_GROUP: 'EDIT_GROUP',
    CONFIRM_ACTION: 'CONFIRM_ACTION',
    IDLE: 'IDLE'
}

export const CONFIRM_ACTION_TYPE = {
    DELETE: 'DELETE',
    FAVORITE: 'FAVORITE',
    GROUP: 'GROUP',
    UNFAVORITE: 'UNFAVORITE'
};

export const CONTACTS_ORDERBY_FIRSTNAME_ASC = ['firstName', 'ASC', 'lastName', 'ASC'];
export const DEFAULT_CONTACTS_ORDERBY = CONTACTS_ORDERBY_FIRSTNAME_ASC;
export const CONTACTS_ORDERBY_FIRSTNAME_DESC = ['firstName', 'DESC', 'lastName', 'DESC'];
export const CONTACTS_ORDERBY_LASTNAME_ASC = ['lastName', 'ASC', 'firstName', 'ASC'];
export const CONTACTS_ORDERBY_LASTNAME_DESC = ['lastName', 'DESC', 'firstName', 'DESC'];

export const GROUPS_ORDERBY_NAME_ASC = ['name', 'ASC'];
export const GROUPS_ORDERBY_NAME_DESC = ['name', 'DESC'];
export const DEFAULT_GROUPS_ORDERBY = GROUPS_ORDERBY_NAME_ASC;

// Names (first, middle, last) may only contain letters and must start with a capital letter.
// Allow single letter names.
export const NAME_REGEX = /^[A-Z][a-zA-Z-']*$/;
// Group name must begin with a capital letter.
export const GROUP_NAME_REGEX = /^[A-Z].*$/;

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

export const DELETE_BUTTON_WIDTH = 24;
export const DELETE_BUTTON_HEIGHT = 24;
export const FAVORITE_BUTTON_WIDTH = 24;
export const FAVORITE_BUTTON_HEIGHT = 24;

export const ADD_TOOLBAR_BUTTON_WIDTH = 24;
export const ADD_TOOLBAR_BUTTON_HEIGHT = 24;
export const DELETE_TOOLBAR_BUTTON_WIDTH = 24;
export const DELETE_TOOLBAR_BUTTON_HEIGHT = 24;
export const FAVORITE_TOOLBAR_BUTTON_WIDTH = 24;
export const FAVORITE_TOOLBAR_BUTTON_HEIGHT = 24;
export const GROUP_TOOLBAR_BUTTON_WIDTH = 24;
export const GROUP_TOOLBAR_BUTTON_HEIGHT = 24;
export const REFRESH_TOOLBAR_BUTTON_WIDTH = 24;
export const REFRESH_TOOLBAR_BUTTON_HEIGHT = 24;