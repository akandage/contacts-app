import queryString from 'query-string';
import { DEFAULT_CONTACTS_ORDERBY } from '../constants';

export const ACTION_TYPE = {
    SELECT_CONTACT: 'SELECT_CONTACT',
    DESELECT_CONTACT: 'DESELECT_CONTACT',
    CONFIRM_DELETE_CONTACT: 'CONFIRM_DELETE_CONTACT',
    CANCELLED_DELETE_CONTACT: 'CANCELLED_DELETE_CONTACT',
    DELETING_CONTACT: 'DELETING_CONTACT',
    ERROR_DELETING_CONTACT: 'ERROR_DELETING_CONTACT',
    DELETED_CONTACT: 'DELETED_CONTACT',
    RETRIEVING_CONTACTS: 'RETRIEVING_CONTACTS',
    RETRIEVED_CONTACTS: 'RETRIEVED_CONTACTS',
    ERROR_RETRIEVING_CONTACTS: 'ERROR_RETRIEVING_CONTACTS'
};

export function initContacts()
{
    return (dispatch) => {
        dispatch(retrieveContacts());
    }
}

export function selectContact(contact)
{
    return {
        type: ACTION_TYPE.SELECT_CONTACT,
        contact
    }
}

export function deselectContact(contact)
{
    return {
        type: ACTION_TYPE.DESELECT_CONTACT,
        contact
    }
}

export function confirmDeleteContact(contact)
{
    return {
        type: ACTION_TYPE.CONFIRM_DELETE_CONTACT,
        contact
    }
}

export function cancelledDeleteContact(contact)
{
    return {
        type: ACTION_TYPE.CANCELLED_DELETE_CONTACT,
        contact
    }
}

export function deleteContact(contact)
{
    return async (dispatch) => {
        dispatch(deletingContact(contact));

        try
        {
            let response = await fetch(`/api/contacts/${contact._id}`, {
                method: 'DELETE'
            });

            if (response.ok)
            {
                dispatch(deletedContact(contact));
            }
            else
            {
                dispatch(errorDeletingContact(contact, `Error deleting contact ${response.status} ${response.statusText}`));
            }
        }
        catch (error)
        {
            dispatch(errorDeletingContact(contact, `Error deleting contact: ${error.message}`));
        }
    }
}

export function deletingContact(contact)
{
    return {
        type: ACTION_TYPE.DELETING_CONTACT,
        contact
    }
}

export function deletedContact(contact)
{
    return {
        type: ACTION_TYPE.DELETED_CONTACT,
        contact
    }
}

export function errorDeletingContact(contact, error)
{
    return {
        type: ACTION_TYPE.ERROR_DELETING_CONTACT,
        contact,
        error
    }
}

export function retrieveContacts(limit = null, offset = 0, orderBy = DEFAULT_CONTACTS_ORDERBY)
{
    return async (dispatch) => {
        dispatch(retrievingContacts());

        try
        {
            let url = '/api/contacts';
            let qs = {};

            if (limit)
            {
                qs.limit = limit;
            }

            if (offset > 0)
            {
                qs.offset = offset;
            }

            if (orderBy != DEFAULT_CONTACTS_ORDERBY)
            {
                qs.orderBy = orderBy;
            }

            let response = await fetch(`/api/contacts?${queryString.stringify(qs)}`);
            
            if (response.ok)
            {
                let contacts = await response.json();

                dispatch(retrievedContacts(contacts));
            }
            else
            {
                dispatch(errorRetrievingContacts(`Error retrieving contacts: ${response.status} ${response.statusText}`));
            }
        }
        catch (error)
        {
            dispatch(errorRetrievingContacts(`Error retrieving contacts: ${error.message}`));
        }
    };
}

export function retrievingContacts()
{
    return {
        type: ACTION_TYPE.RETRIEVING_CONTACTS
    };
}

export function retrievedContacts(contacts)
{
    return {
        type: ACTION_TYPE.RETRIEVED_CONTACTS,
        contacts
    }
}

export function errorRetrievingContacts(error)
{
    return {
        type: ACTION_TYPE.ERROR_RETRIEVING_CONTACTS,
        error
    }
}