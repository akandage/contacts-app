import queryString from 'query-string';
import { DEFAULT_CONTACTS_ORDERBY } from '../constants';

export const ACTION_TYPE = {
    SELECT_CONTACT: 'SELECT_CONTACT',
    SELECT_ALL_CONTACTS: 'SELECT_ALL_CONTACTS',
    DESELECT_CONTACT: 'DESELECT_CONTACT',
    DESELECT_ALL_CONTACTS: 'DESELECT_ALL_CONTACTS',
    CONFIRM_DELETE_CONTACT: 'CONFIRM_DELETE_CONTACT',
    CONFIRM_DELETE_CONTACTS: 'CONFIRM_DELETE_CONTACTS',
    CANCELLED_DELETE_CONTACT: 'CANCELLED_DELETE_CONTACT',
    CANCELLED_DELETE_CONTACTS: 'CANCELLED_DELETE_CONTACTS',
    DELETING_CONTACT: 'DELETING_CONTACT',
    ERROR_DELETING_CONTACT: 'ERROR_DELETING_CONTACT',
    DELETED_CONTACT: 'DELETED_CONTACT',
    DELETING_CONTACTS: 'DELETING_CONTACTS',
    ERROR_DELETING_CONTACTS: 'ERROR_DELETING_CONTACTS',
    DELETED_CONTACTS: 'DELETED_CONTACTS',
    FAVORITING_CONTACT: 'FAVORITING_CONTACT',
    ERROR_FAVORITING_CONTACT: 'ERROR_FAVORITING_CONTACT',
    FAVORITED_CONTACT: 'FAVORITED_CONTACT',
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

export function selectAllContacts()
{
    return {
        type: ACTION_TYPE.SELECT_ALL_CONTACTS
    }
}

export function deselectContact(contact)
{
    return {
        type: ACTION_TYPE.DESELECT_CONTACT,
        contact
    }
}

export function deselectAllContacts()
{
    return {
        type: ACTION_TYPE.DESELECT_ALL_CONTACTS
    }
}

export function confirmDeleteContact(contact)
{
    return {
        type: ACTION_TYPE.CONFIRM_DELETE_CONTACT,
        contact
    }
}

export function confirmDeleteContacts(contacts)
{
    return {
        type: ACTION_TYPE.CONFIRM_DELETE_CONTACTS,
        contacts
    }
}

export function cancelledDeleteContact(contact)
{
    return {
        type: ACTION_TYPE.CANCELLED_DELETE_CONTACT,
        contact
    }
}

export function cancelledDeleteContacts(contacts)
{
    return {
        type: ACTION_TYPE.CANCELLED_DELETE_CONTACTS,
        contacts
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

export function deleteContacts(contacts)
{
    return async (dispatch) => {
        try
        {
            dispatch(deletingContacts(contacts));

            for (let contact of contacts)
            {
                let response = await fetch(`/api/contacts/${contact._id}`, {
                    method: 'DELETE'
                });

                if (!response.ok)
                {
                    dispatch(errorDeletingContacts(contacts, `Error deleting contacts ${response.status} ${response.statusText}`));
                    return;
                }
            }

            dispatch(deletedContacts(contacts));
        }
        catch (error)
        {
            dispatch(errorDeletingContacts(contacts, `Error deleting contacts: ${error.message}`));
        }
    }
}

export function deletingContacts(contacts)
{
    return {
        type: ACTION_TYPE.DELETING_CONTACTS,
        contacts
    }
}

export function deletedContacts(contacts)
{
    return {
        type: ACTION_TYPE.DELETED_CONTACTS,
        contacts
    }
}

export function errorDeletingContacts(contacts, error)
{
    return {
        type: ACTION_TYPE.ERROR_DELETING_CONTACTS,
        contacts,
        error
    }
}

export function favoriteContact(contact, favorite)
{
    return async (dispatch) => {
        dispatch(favoritingContact(contact));

        if (favorite === null || favorite === undefined)
        {
            favorite = !contact.favorite;
        }

        try
        {
            let response = await fetch(`/api/contacts/${contact._id}/favorite?value=${favorite}`, {
                method: 'PUT'
            });

            if (response.ok)
            {
                contact = await response.json();
                dispatch(favoritedContact(contact));
            }
            else
            {
                dispatch(errorFavoritingContact(contact, `Error favoriting contact ${response.status} ${response.statusText}`));
            }
        }
        catch (error)
        {
            dispatch(errorFavoritingContact(contact, `Error favoriting contact: ${error.message}`));
        }
    }
}

export function favoritingContact(contact)
{
    return {
        type: ACTION_TYPE.FAVORITING_CONTACT,
        contact
    }
}

export function favoritedContact(contact)
{
    return {
        type: ACTION_TYPE.FAVORITED_CONTACT,
        contact
    }
}

export function errorFavoritingContact(contact, error)
{
    return {
        type: ACTION_TYPE.ERROR_FAVORITING_CONTACT,
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