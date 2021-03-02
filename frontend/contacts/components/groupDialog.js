import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
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
        show,
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
        return groupNameDirty && groupName === '';
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
        )
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
        }
    }

    function onRemoveSuggestionClicked()
    {
        setContactSearchValue('');
        setContact(null);
    }

    function onGroupContactRemoved(index)
    {
        let contacts = groupContacts.slice();

        contacts.splice(index, 1);
        setGroupContacts(contacts);
    }

    function onSaveClicked()
    {
        setSaved(true);
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
            // TODO
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
                    isInvalid={ isGroupNameValid() }
                    invalidFeedback="Group name is required."

                >
                </CustomTextBox>

                <AutoCompleteTextbox
                    value={ contactSearchValue }
                    suggestions={ contactSearchSuggestions.map(suggestion => `${suggestion.firstName} ${suggestion.lastName}`) }
                    autoCompleted={ contact !== null }
                    allowAdd={ contact !== null }
                    onChanged={ onContactSearchChanged }
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
                <Button variant="primary" onClick={ onSaveClicked }>Save</Button>
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