import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { GROUP_NAME_REGEX } from '../constants';
import queryString from 'query-string';
import AutoCompleteTextbox from './autoCompleteTextbox';
import CustomTextBox, { RemoveButton } from './customTextbox';

export const GROUP_DIALOG_MODE = {
    ADD_GROUP: 'ADD_GROUP',
    EDIT_GROUP: 'EDIT_GROUP'
};

const CONTACT_SEARCH_URL = '/api/contacts/search';
const MAX_CONTACT_SEARCH_RESULTS = 10;

function Dialog(props)
{
    let {
        mode,
        centered,
        size,
        group,
        onSaved,
        onCancelled
    } = props;

    const [ contactSearchValue, setContactSearchValue ] = useState('');
    const [ contactSearchSuggestions, setContactSearchSuggestions ] = useState([]);
    const [ contactSearchSuggestionsTimer, setContactSearchSuggestionsTimer ] = useState(null);
    const [ contact, setContact ] = useState(null);
    const [ groupName, setGroupName ] = useState(group !== null ? group.name : '');
    const [ groupNameDirty, setGroupNameDirty ] = useState(false);
    const [ groupContacts, setGroupContacts ] = useState(group !== null ? group.contacts : []);
    const [ groupContactsDirty, setGroupContactsDirty ] = useState(false);
    const [ saved, setSaved ] = useState(false);
    const [ showState, setShowState ] = useState(true);

    function onGroupNameChanged(name)
    {
        setGroupName(name);
        
        if (!groupNameDirty)
        {
            setGroupNameDirty(true);
        }
    }

    function onGroupNameBlur()
    {
        if (!groupNameDirty)
        {
            setGroupNameDirty(true);
        }
    }

    function isGroupNameValid()
    {
        return groupName !== '' && GROUP_NAME_REGEX.test(groupName);
    }

    function getGroupNameInvalidFeedback()
    {
        return groupName !== '' ? 
            'Group name is invalid. Must begin with a capital letter.' :
            'Group name is required.';
    }

    function onContactSearchChanged(value)
    {
        clearTimeout(contactSearchSuggestionsTimer);
        setContactSearchValue(value);
        setContactSearchSuggestionsTimer(
            setTimeout(() => {
                fetchSuggestions(value)
                    .then(results => {
                        if (results.length > 0)
                        {
                            let groupContactIds = new Set(groupContacts.map(groupContact => groupContact._id));

                            results = results.filter(result => !groupContactIds.has(result._id));
                            setContactSearchSuggestions(results);
                        }
                        else
                        {
                            setContactSearchSuggestions([]);
                        }
                    })
            }, 100)
        );
    }

    function onContactSearchFocus(e)
    {
        onContactSearchChanged(contactSearchValue);
    }

    function onContactSearchBlur(e)
    {
        clearTimeout(contactSearchSuggestionsTimer);
        setContactSearchSuggestionsTimer(null);
        // Don't clear suggestions immediately in case suggestion was clicked.
        setTimeout(() => setContactSearchSuggestions([]), 100);
    }

    async function fetchSuggestions(searchValue)
    {
        let url = CONTACT_SEARCH_URL;
        let qs = {};
        let results = [];

        qs.searchTerms = searchValue.split(' ');
        qs.limit = MAX_CONTACT_SEARCH_RESULTS;

        try
        {
            let response = await fetch(`${url}?${queryString.stringify(qs)}`);

            if (response.ok)
            {
                results = await response.json();
            }
            else
            {
                console.error(`Error while trying to retrieve contact suggestions: ${response.status} ${response.statusText}`);
            }
        }
        catch (error)
        {
            console.error(`Error while trying to retrieve contact suggestions: ${error}`);
        }

        return results;
    }

    function onSuggestionClicked(suggestion, index)
    {
        let contact = contactSearchSuggestions[index];

        clearTimeout(contactSearchSuggestionsTimer);
        setContactSearchSuggestionsTimer(null);
        setContactSearchValue(`${contact.firstName} ${contact.lastName}`);
        setContact(contact);
        setContactSearchSuggestions([]);
    }

    function onAddSuggestionClicked()
    {
        if (contact != null)
        {
            let contacts = groupContacts.slice();

            contacts.push(contact);
            setGroupContacts(contacts);
            setContactSearchValue('');
            setContact(null);

            if (!groupContactsDirty)
            {
                setGroupContactsDirty(true);
            }
        }
    }

    function onRemoveSuggestionClicked()
    {
        clearTimeout(contactSearchSuggestionsTimer);
        setContactSearchSuggestionsTimer(null);
        setContactSearchValue('');
        setContactSearchSuggestions([]);
        setContact(null);
    }

    function onGroupContactRemoved(index)
    {
        let contacts = groupContacts.slice();

        contacts.splice(index, 1);
        setGroupContacts(contacts);

        if (!groupContactsDirty)
        {
            setGroupContactsDirty(true);
        }
    }

    function allowSave()
    {
        if (mode === GROUP_DIALOG_MODE.ADD_GROUP)
        {
            return isGroupNameValid() && groupContacts.length > 0;
        }
        else
        {
            return (isGroupNameValid() && groupNameDirty) || (groupContacts.length > 0 && groupContactsDirty);
        }
    }

    function onSaveClicked()
    {
        setSaved(true);
        setShowState(false);
    }

    function onCancelClicked()
    {
        setShowState(false);
    }

    function onClose()
    {
        setShowState(false);
    }

    function onClosed()
    {
        if (saved)
        {
            let g = {
                name: groupName,
                contacts: groupContacts
            };

            if (mode === GROUP_DIALOG_MODE.EDIT_GROUP)
            {
                g._id = group._id;
            }

            onSaved(g);
        }
        else
        {
            onCancelled();
        }
    }

    return (
        <Modal size={ size} centered={ centered } show={ showState } onHide={ onClose } onExited={ onClosed } scrollable={ contactSearchSuggestions.length === 0 }>
            <Modal.Header closeButton>
                <Modal.Title>
                    {
                        mode === GROUP_DIALOG_MODE.ADD_GROUP ?
                            'Add Group' :
                            'Edit Group'
                    }
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <CustomTextBox
                    id="groupName"
                    value={ groupName }
                    onChanged={ onGroupNameChanged }
                    onBlur={ onGroupNameBlur }
                    isInvalid={ groupNameDirty && !isGroupNameValid() }
                    invalidFeedback={ getGroupNameInvalidFeedback() }

                >
                </CustomTextBox>

                <AutoCompleteTextbox
                    value={ contactSearchValue }
                    suggestions={ contactSearchSuggestions.map(suggestion => `${suggestion.firstName} ${suggestion.lastName}`) }
                    autoCompleted={ contact !== null }
                    allowAdd={ contact !== null }
                    onChanged={ onContactSearchChanged }
                    onFocus={ onContactSearchFocus }
                    onBlur={ onContactSearchBlur }
                    onSuggestionClicked={ onSuggestionClicked }
                    onAddButtonClicked={ onAddSuggestionClicked }
                    onRemoveButtonClicked={ onRemoveSuggestionClicked }
                />

                <hr />

                {
                    groupContacts.length > 0 ?
                        <ul className="group-dialog-contacts-list">
                            {
                                groupContacts.map((groupContact, index) =>
                                    <li key={ index }>
                                        <div className="group-contact">
                                            {
                                                `${groupContact.firstName} ${groupContact.lastName}`
                                            }
                                        </div>

                                        <RemoveButton onClick={ () => onGroupContactRemoved(index) } />
                                    </li>
                                )
                            }
                        </ul> :
                        <div className="group-dialog-contacts-list-placeholder">
                            <span>No Contacts</span>
                        </div>
                }
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" disabled={ !allowSave() } onClick={ onSaveClicked }>Save</Button>
                <Button variant="secondary" onClick={ onCancelClicked }>Cancel</Button>
            </Modal.Footer>
        </Modal> 
    );
}

export default function GroupDialog(props)
{
    let {
        show
    } = props;

    return (
        show ?
            <Dialog {...props} /> :
            <>
            </>
    );
}

GroupDialog.defaultProps = {
    show: false,
    mode: GROUP_DIALOG_MODE.ADD_GROUP,
    centered: true,
    size: 'xl',
    group: null,
    onSaved: (group) => {},
    onCancelled: () => {}
};

GroupDialog.propTypes = {
    show: PropTypes.bool,
    mode: PropTypes.string,
    centered: PropTypes.bool,
    size: PropTypes.string,
    group: PropTypes.object,
    onSaved: PropTypes.func,
    onCancelled: PropTypes.func
};