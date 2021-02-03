import { applyMiddleware, combineReducers, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { ACTION_TYPE } from '../actions/contactAppActions';

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

const INITIAL_STATE = {
    status: STATUS.START,
    error: null,
    contacts:[],
    disabled: false,
    confirmAction: {
        type: null,
        subjects: []
    },
};

const REDUCER = combineReducers({
    status: (state = INITIAL_STATE.status, action) => {
        let next = state;

        switch (action.type)
        {
            case ACTION_TYPE.CONFIRM_DELETE_CONTACT:
            case ACTION_TYPE.CONFIRM_DELETE_CONTACTS:
                next = STATUS.CONFIRM_ACTION;
                break;
            case ACTION_TYPE.RETRIEVING_CONTACTS:
                next = state !== STATUS.START ? STATUS.REFRESHING : STATUS.LOADING;
                break;
            default:
                next = state !== STATUS.START ? STATUS.IDLE : STATUS.START;
                break;
        }

        return next;
    },
    error: (state = INITIAL_STATE.error, action) => {
        let next = state;

        switch (action.type)
        {
            case ACTION_TYPE.ERROR_DELETING_CONTACT:
            case ACTION_TYPE.ERROR_FAVORITING_CONTACT:
            case ACTION_TYPE.ERROR_RETRIEVING_CONTACTS:
                next = action.error;
                break;
            default:
                break;
        }

        return next;
    },
    contacts: (state = INITIAL_STATE.contacts, action) => {
        let next = state;
        let contactIds = null;

        switch (action.type)
        {
            case ACTION_TYPE.SELECT_CONTACT:
            case ACTION_TYPE.DESELECT_CONTACT:
                next = state.map(contact => {
                    if (action.contact._id === contact.contact._id)
                    {
                        contact.selected = action.type === ACTION_TYPE.SELECT_CONTACT ? true : false;
                    }
                    
                    return contact;
                });
                break;
            case ACTION_TYPE.SELECT_ALL_CONTACTS:
            case ACTION_TYPE.DESELECT_ALL_CONTACTS:
                next = state.map(contact => {
                    contact.selected = action.type === ACTION_TYPE.SELECT_ALL_CONTACTS ? true : false;
                    
                    return contact;
                });
                break;
            case ACTION_TYPE.DELETING_CONTACT:
            case ACTION_TYPE.FAVORITING_CONTACT:
                next = state.map(contact => {
                    if (action.contact._id === contact.contact._id)
                    {
                        contact.disabled = true;
                    }

                    return contact;
                });
                break;
            case ACTION_TYPE.ERROR_DELETING_CONTACT:
            case ACTION_TYPE.ERROR_FAVORITING_CONTACT:
                next = state.map(contact => {
                    if (action.contact._id === contact.contact._id)
                    {
                        contact.disabled = false;
                    }

                    return contact;
                });
                break;
            case ACTION_TYPE.DELETING_CONTACTS:
                contactIds = new Set(action.contacts.map(contact => contact._id));

                next = state.map(contact => {
                    if (contactIds.has(contact.contact._id))
                    {
                        contact.disabled = true;
                    }

                    return contact;
                });
                break;
            case ACTION_TYPE.ERROR_DELETING_CONTACTS:
                contactIds = new Set(action.contacts.map(contact => contact._id));

                next = state.map(contact => {
                    if (contactIds.has(contact.contact._id))
                    {
                        contact.disabled = false;
                    }

                    return contact;
                });
                break;
            case ACTION_TYPE.DELETED_CONTACT:
                next = state.filter(contact => {
                    return contact.contact._id !== action.contact._id;
                });
                break;
            case ACTION_TYPE.DELETED_CONTACTS:
                contactIds = new Set(action.contacts.map(contact => contact._id));

                next = state.filter(contact => {
                    return !contactIds.has(contact.contact._id);
                });
                break;
            case ACTION_TYPE.FAVORITED_CONTACT:
                next = state.map(contact => {
                    if (action.contact._id === contact.contact._id)
                    {
                        contact.contact = action.contact;
                        contact.disabled = false;
                    }

                    return contact;
                });
                break;
            case ACTION_TYPE.RETRIEVED_CONTACTS:
                next = action.contacts.map(contact => {
                    return {
                        contact,
                        disabled: false,
                        selected: false,
                    }
                });
                break;
            default:
                break;
        }

        return next;
    },
    disabled: (state = INITIAL_STATE.disabled, action) => {
        let next = state;

        switch (action.type)
        {
            case ACTION_TYPE.CONFIRM_DELETE_CONTACT:
            case ACTION_TYPE.RETRIEVING_CONTACTS:
                next = true;
                break;
            default:
                next = false;
                break;
        }

        return next;
    },
    confirmAction: (state = INITIAL_STATE.confirmAction, action) => {
        let next = state;

        switch (action.type)
        {
            case ACTION_TYPE.CONFIRM_DELETE_CONTACT:
                next = {
                    type: CONFIRM_ACTION_TYPE.DELETE,
                    subjects: [ action.contact ]
                };
                break;
            case ACTION_TYPE.CONFIRM_DELETE_CONTACTS:
                next = {
                    type: CONFIRM_ACTION_TYPE.DELETE,
                    subjects: action.contacts
                };
                break;
            default:
                next = INITIAL_STATE.confirmAction;
                break;
        }

        return next;
    }
});

export default function ContactAppStore(initialState = INITIAL_STATE)
{
    let logger = createLogger();
    // Install the redux-thunk middleware to support async actions (ex. fetching data).
    let storeEnhancer = applyMiddleware(logger, thunkMiddleware);

    return createStore(REDUCER, initialState, storeEnhancer);
}