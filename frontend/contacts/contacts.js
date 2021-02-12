import React from 'react';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import { STATUS } from './constants';
import * as ContactAppActions from './actions/contactAppActions';
import ContactsHeader from '../common/contactsHeader';
import ContactDialog, { CONTACT_DIALOG_MODE } from './components/contactDialog';
import ConfirmActionDialog from './components/confirmActionDialog';
import ContactList from './components/contactList';
import ContactAppStore from './stores/contactAppStore';
import './stylesheets/contacts.css';

const SESSION_HEARTBEAT_INTERVAL = 30000;

function startSessionHeartbeat()
{
    const timer = setInterval(() => {
        console.debug('Sending session heartbeat.');
        fetch('/session/heartbeat', {
            method: 'PUT'
        })
        .then(
            response => {
                if (response.ok)
                {
                    console.debug('Sent session heartbeat successfully.');
                }
                else if (response.status === 401)
                {
                    console.debug('User is not logged in.');
                    clearInterval(timer);
                }
                else
                {
                    console.error(`Error sending session heartbeat ${response.status} ${response.statusText}`)
                }
            }
        )
        .catch(
            error => {
                console.error(`Error sending session heartbeat ${error}.`);
            }
        );
        
    }, SESSION_HEARTBEAT_INTERVAL);
}

function connectContactList()
{
    return connect(
        state => {
            return {
                status: state.status,
                contacts: state.contacts,
                disabled: state.disabled,
                orderBy: state.orderBy
            };
        },
        dispatch => {
            return {
                onAddContactClicked: () => dispatch(ContactAppActions.addContact()),
                onRefreshClicked: () => dispatch(ContactAppActions.retrieveContacts()),
                onSelected: (contact) => dispatch(ContactAppActions.selectContact(contact)),
                onSelectAll: () => dispatch(ContactAppActions.selectAllContacts()),
                onDeselected: (contact) => dispatch(ContactAppActions.deselectContact(contact)),
                onDeselectAll: () => dispatch(ContactAppActions.deselectAllContacts()),
                onDeleteClicked: (contact) => dispatch(ContactAppActions.confirmDeleteContact(contact)),
                onDeleteMultipleClicked: (contacts) => dispatch(ContactAppActions.confirmDeleteContacts(contacts)),
                onFavoriteClicked: (contact) => dispatch(ContactAppActions.favoriteContact(contact)),
                onSortChanged: (orderBy) => dispatch(ContactAppActions.sortContacts(orderBy))
            };
        }
    )(ContactList);
}

function connectAddContactDialog()
{
    return connect(
        state => {
            return {
                show: state.status === STATUS.ADD_CONTACT,
                mode: CONTACT_DIALOG_MODE.ADD_CONTACT
            };
        },
        dispatch => {
            return {
                onSaved: (contact) => dispatch(ContactAppActions.addContactSave(contact)),
                onCancelled: () => dispatch(ContactAppActions.addContactCancel())
            };
        }
    )(ContactDialog);
}

function connectConfirmDeleteContactsDialog()
{
    return connect(
        state => {
            let status = state.status;
            let confirmAction = state.confirmAction;
            let contacts = confirmAction.subjects;

            return {
                show: status === STATUS.CONFIRM_ACTION,
                title: status === STATUS.CONFIRM_ACTION ? 
                        (`Delete Contact${contacts.length > 1 ? 's' : ''}`) :
                        '',
                bodyText: status === STATUS.CONFIRM_ACTION ?
                        (contacts.length > 1 ? `Delete ${contacts.length} contacts?` : `Delete contact ${contacts[0].firstName} ${contacts[0].lastName}?`) :
                        '',
                subjects: contacts
            };
        },
        dispatch => {
            return {
                onAccepted: (contacts) => { 
                    if (contacts.length > 1)
                    {
                        dispatch(ContactAppActions.deleteContacts(contacts));
                    }
                    else
                    {
                        dispatch(ContactAppActions.deleteContact(contacts[0]));
                    }
                },
                onCancelled: (contacts) => {
                    if (contacts.length > 1)
                    {
                        dispatch(ContactAppActions.cancelledDeleteContacts(contacts));
                    }
                    else
                    {
                        dispatch(ContactAppActions.cancelledDeleteContact(contacts[0]));
                    }
                }
            };
        }
    )(ConfirmActionDialog);
}

function renderContactsApp()
{
    let authState = document.getElementById('auth-state');

    if (authState && authState.value === 'LOGGED_IN')
    {
        let store = ContactAppStore();
        let AddContactDialog = connectAddContactDialog();
        let ConfirmDeleteContactsDialog = connectConfirmDeleteContactsDialog();
        let ContactList = connectContactList();
    
        ReactDOM.render(<ContactsHeader /> , document.getElementById('contacts-header'));
        ReactDOM.render(
            <div className="app-container">
                <div className="app-list-container">
                    <Provider store={ store }>
                        <AddContactDialog />
                        <ConfirmDeleteContactsDialog />
                        <ContactList />
                    </Provider>
                </div>
            </div>,
            document.getElementById('contacts-main')
        );
    
        setTimeout(() => {
            store.dispatch(ContactAppActions.initContacts());
        }, 0);
    }
    else
    {
        ReactDOM.render(<ContactsHeader /> , document.getElementById('contacts-header'));
    }
}

window.onload = function()
{
    startSessionHeartbeat();
    renderContactsApp();
}