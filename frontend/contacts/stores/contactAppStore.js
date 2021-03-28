import { applyMiddleware, combineReducers, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { ACTION_TYPE } from '../actions/contactAppActions';
import { STATUS, CONFIRM_ACTION_TYPE, DEFAULT_CONTACTS_ORDERBY, DEFAULT_GROUPS_ORDERBY } from '../constants';

const INITIAL_STATE = {
    status: STATUS.START,
    error: null,
    contact: null,
    contacts: [],
    searchContacts: [],
    searchContactsSearchTerms: [],
    group: null,
    groups: [],
    disabled: false,
    orderContactsBy: DEFAULT_CONTACTS_ORDERBY,
    orderGroupsBy: DEFAULT_GROUPS_ORDERBY,
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
            case ACTION_TYPE.ADD_CONTACT:
                next = STATUS.ADD_CONTACT;
                break;
            case ACTION_TYPE.EDIT_CONTACT:
                next = STATUS.EDIT_CONTACT;
                break;
            case ACTION_TYPE.EDIT_GROUP:
                next = STATUS.EDIT_GROUP;
                break;
            case ACTION_TYPE.ADD_GROUP:
            case ACTION_TYPE.CONFIRM_DELETE_CONTACT:
            case ACTION_TYPE.CONFIRM_DELETE_CONTACTS:
            case ACTION_TYPE.CONFIRM_DELETE_GROUP:
            case ACTION_TYPE.CONFIRM_DELETE_GROUPS:
            case ACTION_TYPE.CONFIRM_FAVORITE_CONTACTS:
            case ACTION_TYPE.CONFIRM_UNFAVORITE_CONTACT:
            case ACTION_TYPE.CONFIRM_UNFAVORITE_CONTACTS:
                next = STATUS.CONFIRM_ACTION;
                break;
            case ACTION_TYPE.RETRIEVING_CONTACTS:
            case ACTION_TYPE.SEARCHING_CONTACTS:
            case ACTION_TYPE.RETRIEVING_GROUPS:
                next = state !== STATUS.START && state !== STATUS.LOADING ? STATUS.REFRESHING : STATUS.LOADING;
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
            case ACTION_TYPE.ADD_CONTACT_ERROR_SAVING:
            case ACTION_TYPE.EDIT_CONTACT_ERROR_SAVING:
            case ACTION_TYPE.ADD_GROUP_ERROR_SAVING:
            case ACTION_TYPE.ERROR_DELETING_CONTACT:
            case ACTION_TYPE.ERROR_DELETING_CONTACTS:
            case ACTION_TYPE.ERROR_FAVORITING_CONTACT:
            case ACTION_TYPE.ERROR_FAVORITING_CONTACTS:
            case ACTION_TYPE.ERROR_RETRIEVING_CONTACTS:
            case ACTION_TYPE.ERROR_RETRIEVING_SEARCH_CONTACTS:
            case ACTION_TYPE.ERROR_RETRIEVING_GROUPS:
                next = action.error;
                break;
            default:
                break;
        }

        return next;
    },
    contact: (state = INITIAL_STATE.contact, action) => {
        let next = state;

        switch (action.type)
        {
            case ACTION_TYPE.EDIT_CONTACT:
                next = action.contact;
                break;
            default:
                next = null;
                break;
        }

        return next;
    },
    contacts: (state = INITIAL_STATE.contacts, action) => {
        let next = state;
        let contactIds = null;
        let contactsMap = null;

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
            case ACTION_TYPE.ADD_GROUP_SAVING:
            case ACTION_TYPE.DELETING_CONTACTS:
            case ACTION_TYPE.FAVORITING_CONTACTS:
                contactIds = new Set(action.contacts.map(contact => contact._id));

                next = state.map(contact => {
                    if (contactIds.has(contact.contact._id))
                    {
                        contact.disabled = true;
                    }

                    return contact;
                });
                break;
            case ACTION_TYPE.ADD_GROUP_ERROR_SAVING:
            case ACTION_TYPE.ERROR_DELETING_CONTACTS:
            case ACTION_TYPE.ERROR_FAVORITING_CONTACTS:
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
                        contact.selected = false;
                    }

                    return contact;
                });
                break;
            case ACTION_TYPE.ADD_GROUP_SAVED:
                contactIds = new Set(action.contacts.map(contact => contact._id));

                next = state.map(contact => {
                    if (contactIds.has(contact.contact._id))
                    {
                        contact.disabled = false;
                        contact.selected = false;
                    }

                    return contact;
                });
                break;
            case ACTION_TYPE.FAVORITED_CONTACTS:
                contactIds = new Set(action.contacts.map(contact => contact._id));
                contactsMap = new Map(action.contacts.map(contact => [contact._id, contact]));

                next = state.map(contact => {
                    if (contactIds.has(contact.contact._id))
                    {
                        contact.contact = contactsMap.get(contact.contact._id);
                        contact.disabled = false;
                        contact.selected = false;
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
    searchContacts: (state = INITIAL_STATE.searchContacts, action) => {
        let next = state;

        switch (action.type)
        {
            case ACTION_TYPE.RETRIEVED_SEARCH_CONTACTS:
                next = action.contacts;
                break;
            case ACTION_TYPE.CLEAR_SEARCH_CONTACTS:
            case ACTION_TYPE.ERROR_RETRIEVING_SEARCH_CONTACTS:
                next = [];
                break;
            default:
                break;
        }

        return next;
    },
    searchContactsSearchTerms: (state = INITIAL_STATE.searchContactsSearchTerms, action) => {
        let next = state;

        switch (action.type)
        {
            case ACTION_TYPE.SEARCHING_CONTACTS:
                next = action.searchTerms;
                break;
            case ACTION_TYPE.CLEAR_SEARCH_CONTACTS:
                next = [];
                break;
            default:
                break;
        }

        return next;
    },
    group: (state = INITIAL_STATE.group, action) => {
        let next = state;

        switch (action.type)
        {
            case ACTION_TYPE.EDIT_GROUP:
                next = action.group;
                break;
            default:
                next = null;
                break;
        }

        return next;
    },
    groups: (state = INITIAL_STATE.groups, action) => {
        let next = state;
        let groupIds = null;
        let groupsMap = null;

        switch (action.type)
        {
            case ACTION_TYPE.SELECT_GROUP:
            case ACTION_TYPE.DESELECT_GROUP:
                next = state.map(group => {
                    if (action.group._id === group.group._id)
                    {
                        group.selected = action.type === ACTION_TYPE.SELECT_GROUP ? true : false;
                    }
                    
                    return group;
                });
                break;
            case ACTION_TYPE.SELECT_ALL_GROUPS:
            case ACTION_TYPE.DESELECT_ALL_GROUPS:
                next = state.map(group => {
                    group.selected = action.type === ACTION_TYPE.SELECT_ALL_GROUPS ? true : false;
                    
                    return group;
                });
                break;
            case ACTION_TYPE.DELETING_GROUP:
                next = state.map(group => {
                    if (action.group._id === group.group._id)
                    {
                        group.disabled = true;
                    }

                    return group;
                });
                break;
            case ACTION_TYPE.ERROR_DELETING_GROUP:
                next = state.map(group => {
                    if (action.group._id === group.group._id)
                    {
                        group.disabled = false;
                    }

                    return group;
                });
                break;
            case ACTION_TYPE.DELETING_GROUPS:
                groupIds = new Set(action.groups.map(group => group._id));

                next = state.map(group => {
                    if (groupIds.has(group.group._id))
                    {
                        group.disabled = true;
                    }

                    return group;
                });
                break;
            case ACTION_TYPE.ERROR_DELETING_GROUPS:
                groupIds = new Set(action.groups.map(group => group._id));

                next = state.map(group => {
                    if (groupIds.has(group.group._id))
                    {
                        group.disabled = false;
                    }

                    return group;
                });
                break;
            case ACTION_TYPE.DELETED_GROUP:
                next = state.filter(group => {
                    return group.group._id !== action.group._id;
                });
                break;
            case ACTION_TYPE.DELETED_GROUPS:
                groupIds = new Set(action.groups.map(group => group._id));

                next = state.filter(group => {
                    return !groupIds.has(group.group._id);
                });
                break;
            case ACTION_TYPE.RETRIEVED_GROUPS:
                next = action.groups.map(group => {
                    return {
                        group,
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
            case ACTION_TYPE.SEARCHING_CONTACTS:
            case ACTION_TYPE.RETRIEVING_GROUPS:
                next = true;
                break;
            default:
                next = false;
                break;
        }

        return next;
    },
    orderContactsBy: (state = INITIAL_STATE.orderContactsBy, action) => {
        let next = state;

        switch (action.type)
        {
            case ACTION_TYPE.RETRIEVED_CONTACTS:
                next = action.orderBy;
                break;
            default:
                break;
        }

        return next;
    },
    orderGroupsBy: (state = INITIAL_STATE.orderGroupsBy, action) => {
        let next = state;

        switch (action.type)
        {
            case ACTION_TYPE.RETRIEVED_GROUPS:
                next = action.orderBy;
                break;
            default:
                break;
        }

        return next;
    },
    confirmAction: (state = INITIAL_STATE.confirmAction, action) => {
        let next = state;

        switch (action.type)
        {
            case ACTION_TYPE.ADD_GROUP:
                next = {
                    type: CONFIRM_ACTION_TYPE.GROUP,
                    subjects: action.contacts
                }
                break;
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
            case ACTION_TYPE.CONFIRM_DELETE_GROUP:
                next = {
                    type: CONFIRM_ACTION_TYPE.DELETE,
                    subjects: [ action.group ]
                };
                break;
            case ACTION_TYPE.CONFIRM_DELETE_GROUPS:
                next = {
                    type: CONFIRM_ACTION_TYPE.DELETE,
                    subjects: action.groups
                };
                break;
            case ACTION_TYPE.CONFIRM_FAVORITE_CONTACTS:
                next = {
                    type: CONFIRM_ACTION_TYPE.FAVORITE,
                    subjects: action.contacts
                }
                break;
            case ACTION_TYPE.CONFIRM_UNFAVORITE_CONTACT:
                next = {
                    type: CONFIRM_ACTION_TYPE.UNFAVORITE,
                    subjects: [ action.contact ]
                };
                break;
            case ACTION_TYPE.CONFIRM_UNFAVORITE_CONTACTS:
                    next = {
                        type: CONFIRM_ACTION_TYPE.UNFAVORITE,
                        subjects: action.contacts
                    }
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