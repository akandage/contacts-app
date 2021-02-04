export const STATUS = {
    START: 'START',
    LOADING: 'LOADING',
    REFRESHING: 'REFRESHING',
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