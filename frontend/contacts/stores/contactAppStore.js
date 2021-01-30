import { applyMiddleware, combineReducers, createStore } from 'redux';
import { createLogger } from 'redux-logger';
import thunkMiddleware from 'redux-thunk';
import { ACTION_TYPE } from '../actions/contactAppActions';

const STATUS = {
    START: 'START',
    LOADING: 'LOADING',
    REFRESHING: 'REFRESHING',
    IDLE: 'IDLE'
}

const INITIAL_STATE = {
    status: STATUS.START,
    error: null,
    contacts:[],
    disabled: false
};

const REDUCER = combineReducers({
    status: (state = INITIAL_STATE.status, action) => {
        let next = state;
        
        switch (action.type)
        {
            case ACTION_TYPE.RETRIEVING_CONTACTS:
                next = state !== STATUS.START ? STATUS.REFRESHING : STATUS.LOADING;
                break;
            case ACTION_TYPE.ERROR_RETRIEVING_CONTACTS:
            case ACTION_TYPE.RETRIEVED_CONTACTS:
                next = STATUS.IDLE;
                break;
            default:
                break;
        }

        return next;
    },
    error: (state = INITIAL_STATE.error, action) => {
        let next = state;

        switch (action.type)
        {
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

        switch (action.type)
        {
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
            case ACTION_TYPE.RETRIEVING_CONTACTS:
                next = true;
                break;
            case ACTION_TYPE.RETRIEVED_CONTACTS:
                next = false;
                break;
            default:
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