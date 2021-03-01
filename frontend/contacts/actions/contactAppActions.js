import queryString from 'query-string';
import { DEFAULT_CONTACTS_ORDERBY, DEFAULT_GROUPS_ORDERBY } from '../constants';

export const ACTION_TYPE = {
    ADD_CONTACT: 'ADD_CONTACT',
    ADD_CONTACT_CANCEL: 'ADD_CONTACT_CANCEL',
    ADD_CONTACT_SAVING: 'ADD_CONTACT_SAVING',
    ADD_CONTACT_SAVED: 'ADD_CONTACT_SAVED',
    ADD_CONTACT_ERROR_SAVING: 'ADD_CONTACT_ERROR_SAVING',
    ADD_GROUP: 'ADD_GROUP',
    ADD_GROUP_CANCEL: 'ADD_GROUP_CANCEL',
    ADD_GROUP_SAVING: 'ADD_GROUP_SAVING',
    ADD_GROUP_SAVED: 'ADD_GROUP_SAVED',
    ADD_GROUP_ERROR_SAVING: 'ADD_GROUP_ERROR_SAVING',
    EDIT_CONTACT: 'EDIT_CONTACT',
    EDIT_CONTACT_CANCEL: 'EDIT_CONTACT_CANCEL',
    EDIT_CONTACT_SAVING: 'EDIT_CONTACT_SAVING',
    EDIT_CONTACT_SAVED: 'EDIT_CONTACT_SAVED',
    EDIT_CONTACT_ERROR_SAVING: 'EDIT_CONTACT_ERROR_SAVING',
    SELECT_CONTACT: 'SELECT_CONTACT',
    SELECT_ALL_CONTACTS: 'SELECT_ALL_CONTACTS',
    DESELECT_CONTACT: 'DESELECT_CONTACT',
    DESELECT_ALL_CONTACTS: 'DESELECT_ALL_CONTACTS',
    SELECT_GROUP: 'SELECT_GROUP',
    SELECT_ALL_GROUPS: 'SELECT_ALL_GROUPS',
    DESELECT_GROUP: 'DESELECT_GROUP',
    DESELECT_ALL_GROUPS: 'DESELECT_ALL_GROUPS',
    CONFIRM_DELETE_CONTACT: 'CONFIRM_DELETE_CONTACT',
    CONFIRM_DELETE_CONTACTS: 'CONFIRM_DELETE_CONTACTS',
    CONFIRM_DELETE_GROUP: 'CONFIRM_DELETE_GROUP',
    CONFIRM_DELETE_GROUPS: 'CONFIRM_DELETE_GROUPS',
    CONFIRM_FAVORITE_CONTACTS: 'CONFIRM_FAVORITE_CONTACTS',
    CONFIRM_UNFAVORITE_CONTACT: 'CONFIRM_UNFAVORITE_CONTACT',
    CONFIRM_UNFAVORITE_CONTACTS: 'CONFIRM_UNFAVORITE_CONTACTS',
    CANCELLED_DELETE_CONTACT: 'CANCELLED_DELETE_CONTACT',
    CANCELLED_DELETE_CONTACTS: 'CANCELLED_DELETE_CONTACTS',
    CANCELLED_DELETE_GROUP: 'CANCELLED_DELETE_GROUP',
    CANCELLED_DELETE_GROUPS: 'CANCELLED_DELETE_GROUPS',
    CANCELLED_FAVORITE_CONTACTS: 'CANCELLED_FAVORITE_CONTACTS',
    CANCELLED_UNFAVORITE_CONTACT: 'CANCELLED_UNFAVORITE_CONTACT',
    CANCELLED_UNFAVORITE_CONTACTS: 'CANCELLED_UNFAVORITE_CONTACTS',
    DELETING_CONTACT: 'DELETING_CONTACT',
    ERROR_DELETING_CONTACT: 'ERROR_DELETING_CONTACT',
    DELETED_CONTACT: 'DELETED_CONTACT',
    DELETING_CONTACTS: 'DELETING_CONTACTS',
    ERROR_DELETING_CONTACTS: 'ERROR_DELETING_CONTACTS',
    DELETED_CONTACTS: 'DELETED_CONTACTS',
    DELETING_GROUP: 'DELETING_GROUP',
    ERROR_DELETING_GROUP: 'ERROR_DELETING_GROUP',
    DELETED_GROUP: 'DELETED_GROUP',
    DELETING_GROUPS: 'DELETING_GROUPS',
    ERROR_DELETING_GROUPS: 'ERROR_DELETING_GROUPS',
    DELETED_GROUPS: 'DELETED_GROUPS',
    FAVORITING_CONTACT: 'FAVORITING_CONTACT',
    ERROR_FAVORITING_CONTACT: 'ERROR_FAVORITING_CONTACT',
    FAVORITED_CONTACT: 'FAVORITED_CONTACT',
    FAVORITING_CONTACTS: 'FAVORITING_CONTACTS',
    ERROR_FAVORITING_CONTACTS: 'ERROR_FAVORITING_CONTACTS',
    FAVORITED_CONTACTS: 'FAVORITED_CONTACTS',
    RETRIEVING_CONTACTS: 'RETRIEVING_CONTACTS',
    RETRIEVED_CONTACTS: 'RETRIEVED_CONTACTS',
    ERROR_RETRIEVING_CONTACTS: 'ERROR_RETRIEVING_CONTACTS',
    RETRIEVING_GROUPS: 'RETRIEVING_GROUPS',
    RETRIEVED_GROUPS: 'RETRIEVED_GROUPS',
    ERROR_RETRIEVING_GROUPS: 'ERROR_RETRIEVING_GROUPS',
    SORT_CONTACTS: 'SORT_CONTACTS',
    SORT_GROUPS: 'SORT_GROUPS'
};

export function initContacts()
{
    return (dispatch) => {
        dispatch(retrieveContacts());
        dispatch(retrieveGroups());
    }
}

export function addContact()
{
    return {
        type: ACTION_TYPE.ADD_CONTACT
    }
}

export function addContactCancel()
{
    return {
        type: ACTION_TYPE.ADD_CONTACT_CANCEL
    }
}

export function addContactSave(contact)
{
    return async (dispatch) => {
        dispatch(addContactSaving(contact));

        try
        {
            let response = await fetch(`/api/contacts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contact)
            });

            if (response.ok)
            {
                contact = await response.json();

                dispatch(addContactSaved(contact));
                dispatch(retrieveContacts());
            }
            else
            {
                dispatch(addContactErrorSaving(contact, `Error adding contact ${response.status} ${response.statusText}`));
            }
        }
        catch (error)
        {
            dispatch(addContactErrorSaving(contact, `Error adding contact: ${error.message}`));
        }
    }
}

export function addContactSaving(contact)
{
    return {
        type: ACTION_TYPE.ADD_CONTACT_SAVING,
        contact
    };
}

export function addContactSaved(contact)
{
    return {
        type: ACTION_TYPE.ADD_CONTACT_SAVED,
        contact
    };
}

export function addContactErrorSaving(contact, error)
{
    return {
        type: ACTION_TYPE.ADD_CONTACT_ERROR_SAVING,
        contact,
        error
    }
}

export function addGroup(contacts)
{
    return {
        type: ACTION_TYPE.ADD_GROUP,
        contacts
    }
}

export function addGroupCancel()
{
    return {
        type: ACTION_TYPE.ADD_GROUP_CANCEL
    }
}

export function addGroupSave(group)
{
    return async (dispatch) => {
        dispatch(addGroupSaving(group));

        try
        {
            let requestBody = {
                name: group.name,
                contactIds: group.contacts.map(contact => contact._id)
            };
            let response = await fetch(`/api/groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (response.ok)
            {
                group = await response.json();

                dispatch(addGroupSaved(group));
            }
            else
            {
                dispatch(addGroupErrorSaving(group, `Error adding group ${response.status} ${response.statusText}`));
            }
        }
        catch (error)
        {
            dispatch(addGroupErrorSaving(group, `Error adding group: ${error.message}`));
        }
    }
}

export function addGroupSaving(group)
{
    return {
        type: ACTION_TYPE.ADD_GROUP_SAVING,
        name: group.name,
        contacts: group.contacts,
        group
    };
}

export function addGroupSaved(group)
{
    return {
        type: ACTION_TYPE.ADD_GROUP_SAVED,
        name: group.name,
        contacts: group.contacts,
        group
    };
}

export function addGroupErrorSaving(group, error)
{
    return {
        type: ACTION_TYPE.ADD_GROUP_ERROR_SAVING,
        name: group.name,
        contacts: group.contacts,
        group,
        error
    }
}

export function editContact(contact)
{
    return {
        type: ACTION_TYPE.EDIT_CONTACT,
        contact
    };
}

export function editContactCancel(contact)
{
    return {
        type: ACTION_TYPE.EDIT_CONTACT_CANCEL,
        contact
    };
}

export function editContactSaving(contact)
{
    return {
        type: ACTION_TYPE.EDIT_CONTACT_SAVING,
        contact
    };
}

export function editContactSave(contact)
{
    return async (dispatch) => {
        dispatch(editContactSaving(contact));

        try
        {
            let response = await fetch(`/api/contacts/${contact._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(contact)
            });

            if (response.ok)
            {
                dispatch(editContactSaved(contact));
                dispatch(retrieveContacts());
            }
            else
            {
                dispatch(editContactErrorSaving(contact, `Error editing contact ${response.status} ${response.statusText}`));
            }
        }
        catch (error)
        {
            dispatch(editContactErrorSaving(contact, `Error editing contact: ${error.message}`));
        }
    }
}

export function editContactSaved(contact)
{
    return {
        type: ACTION_TYPE.EDIT_CONTACT_SAVED,
        contact
    };
}

export function editContactErrorSaving(contact, error)
{
    return {
        type: ACTION_TYPE.EDIT_CONTACT_ERROR_SAVING,
        contact,
        error
    };
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

export function selectGroup(group)
{
    return {
        type: ACTION_TYPE.SELECT_GROUP,
        group
    }
}

export function selectAllGroups()
{
    return {
        type: ACTION_TYPE.SELECT_ALL_GROUPS
    }
}

export function deselectGroup(group)
{
    return {
        type: ACTION_TYPE.DESELECT_GROUP,
        group
    }
}

export function deselectAllGroups()
{
    return {
        type: ACTION_TYPE.DESELECT_ALL_GROUPS
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

export function confirmDeleteGroup(group)
{
    return {
        type: ACTION_TYPE.CONFIRM_DELETE_GROUP,
        group
    }
}

export function confirmDeleteGroups(groups)
{
    return {
        type: ACTION_TYPE.CONFIRM_DELETE_GROUPS,
        groups
    }
}

export function confirmFavoriteContacts(contacts)
{
    return {
        type: ACTION_TYPE.CONFIRM_FAVORITE_CONTACTS,
        contacts
    }
}

export function confirmUnfavoriteContact(contact)
{
    return {
        type: ACTION_TYPE.CONFIRM_UNFAVORITE_CONTACT,
        contact
    }
}

export function confirmUnfavoriteContacts(contacts)
{
    return {
        type: ACTION_TYPE.CONFIRM_UNFAVORITE_CONTACTS,
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

export function cancelledDeleteGroup(group)
{
    return {
        type: ACTION_TYPE.CANCELLED_DELETE_GROUP,
        group
    }
}

export function cancelledDeleteGroups(groups)
{
    return {
        type: ACTION_TYPE.CANCELLED_DELETE_GROUPS,
        groups
    }
}

export function cancelledFavoriteContacts(contacts)
{
    return {
        type: ACTION_TYPE.CANCELLED_FAVORITE_CONTACTS,
        contacts
    }
}

export function cancelledUnfavoriteContact(contact)
{
    return {
        type: ACTION_TYPE.CANCELLED_UNFAVORITE_CONTACT,
        contact
    }
}

export function cancelledUnfavoriteContacts(contacts)
{
    return {
        type: ACTION_TYPE.CANCELLED_UNFAVORITE_CONTACTS,
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

export function deleteGroup(group)
{
    return async (dispatch) => {
        dispatch(deletingGroup(group));

        try
        {
            let response = await fetch(`/api/groups/${group._id}`, {
                method: 'DELETE'
            });

            if (response.ok)
            {
                dispatch(deletedGroup(group));
            }
            else
            {
                dispatch(errorDeletingGroup(group, `Error deleting group ${response.status} ${response.statusText}`));
            }
        }
        catch (error)
        {
            dispatch(errorDeletingGroup(group, `Error deleting group: ${error.message}`));
        }
    }
}

export function deletingGroup(group)
{
    return {
        type: ACTION_TYPE.DELETING_GROUP,
        group
    }
}

export function deletedGroup(group)
{
    return {
        type: ACTION_TYPE.DELETED_GROUP,
        group
    }
}

export function errorDeletingGroup(group, error)
{
    return {
        type: ACTION_TYPE.ERROR_DELETING_GROUP,
        group,
        error
    }
}

export function deleteGroups(groups)
{
    return async (dispatch) => {
        try
        {
            dispatch(deletingGroups(groups));

            for (let group of groups)
            {
                let response = await fetch(`/api/groups/${group._id}`, {
                    method: 'DELETE'
                });

                if (!response.ok)
                {
                    dispatch(errorDeletingGroups(groups, `Error deleting groups ${response.status} ${response.statusText}`));
                    return;
                }
            }

            dispatch(deletedGroups(groups));
        }
        catch (error)
        {
            dispatch(errorDeletingGroups(groups, `Error deleting groups: ${error.message}`));
        }
    }
}

export function deletingGroups(groups)
{
    return {
        type: ACTION_TYPE.DELETING_GROUPS,
        groups
    }
}

export function deletedGroups(groups)
{
    return {
        type: ACTION_TYPE.DELETED_GROUPS,
        groups
    }
}

export function errorDeletingGroups(groups, error)
{
    return {
        type: ACTION_TYPE.ERROR_DELETING_GROUPS,
        groups,
        error
    }
}

export function favoriteContact(contact, favorite)
{
    return async (dispatch) => {
        dispatch(favoritingContact(contact));

        if (favorite !== true && favorite !== false)
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

export function favoriteContacts(contacts, favorite)
{
    return async (dispatch) => {
        dispatch(favoritingContacts(contacts));

        try
        {
            let favContacts = [];

            for (let contact of contacts)
            {
                let response = await fetch(`/api/contacts/${contact._id}/favorite?value=${favorite === true || favorite === false ? favorite : true}`, {
                    method: 'PUT'
                });
    
                if (response.ok)
                {
                    contact = await response.json();
                    favContacts.push(contact);
                }
                else
                {
                    dispatch(errorFavoritingContacts(contacts, `Error favoriting contacts ${response.status} ${response.statusText}`));
                    return;
                }     
            }

            dispatch(favoritedContacts(favContacts));
        }
        catch (error)
        {
            dispatch(errorFavoritingContacts(contacts, `Error favoriting contacts: ${error.message}`));
        }
    }
}

export function favoritingContacts(contacts)
{
    return {
        type: ACTION_TYPE.FAVORITING_CONTACTS,
        contacts
    }
}

export function favoritedContacts(contacts)
{
    return {
        type: ACTION_TYPE.FAVORITED_CONTACTS,
        contacts
    }
}

export function errorFavoritingContacts(contacts, error)
{
    return {
        type: ACTION_TYPE.ERROR_FAVORITING_CONTACTS,
        contacts,
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

            let response = await fetch(`${url}?${queryString.stringify(qs)}`);
            
            if (response.ok)
            {
                let contacts = await response.json();

                dispatch(retrievedContacts(contacts, limit, offset, orderBy));
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

export function retrievedContacts(contacts, limit, offset, orderBy)
{
    return {
        type: ACTION_TYPE.RETRIEVED_CONTACTS,
        contacts,
        limit,
        offset,
        orderBy
    }
}

export function errorRetrievingContacts(error)
{
    return {
        type: ACTION_TYPE.ERROR_RETRIEVING_CONTACTS,
        error
    }
}

export function retrieveGroups(limit = null, offset = 0, orderBy = DEFAULT_GROUPS_ORDERBY)
{
    return async (dispatch) => {
        dispatch(retrievingGroups());

        try
        {
            let url = '/api/groups';
            let qs = {};

            if (limit)
            {
                qs.limit = limit;
            }

            if (offset > 0)
            {
                qs.offset = offset;
            }

            if (orderBy != DEFAULT_GROUPS_ORDERBY)
            {
                qs.orderBy = orderBy;
            }

            let response = await fetch(`${url}?${queryString.stringify(qs)}`);
            
            if (response.ok)
            {
                let groups = await response.json();

                dispatch(retrievedGroups(groups, limit, offset, orderBy));
            }
            else
            {
                dispatch(errorRetrievingGroups(`Error retrieving groups: ${response.status} ${response.statusText}`));
            }
        }
        catch (error)
        {
            dispatch(errorRetrievingGroups(`Error retrieving groups: ${error.message}`));
        }
    };
}

export function retrievingGroups()
{
    return {
        type: ACTION_TYPE.RETRIEVING_GROUPS
    };
}

export function retrievedGroups(groups, limit, offset, orderBy)
{
    return {
        type: ACTION_TYPE.RETRIEVED_GROUPS,
        groups,
        limit,
        offset,
        orderBy
    }
}

export function errorRetrievingGroups(error)
{
    return {
        type: ACTION_TYPE.ERROR_RETRIEVING_GROUPS,
        error
    }
}

export function sortContacts(orderBy = DEFAULT_CONTACTS_ORDERBY)
{
    return async (dispatch) => {
        dispatch(retrieveContacts(null, 0, orderBy));
    };
}

export function sortGroups(orderBy = DEFAULT_GROUPS_ORDERBY)
{
    return async (dispatch) => {
        dispatch(retrieveGroups(null, 0, orderBy));
    };
}