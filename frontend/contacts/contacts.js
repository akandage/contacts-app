import React from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { STATUS, CONFIRM_ACTION_TYPE } from './constants';
import * as ContactAppActions from './actions/contactAppActions';
import ContactsHeader from '../common/contactsHeader';
import { ContactIcon, FavoriteIcon, GroupIcon, SettingsIcon } from '../common/contactsImages';
import AddGroupDialog from './components/addGroupDialog';
import ContactDialog, { CONTACT_DIALOG_MODE } from './components/contactDialog';
import ConfirmActionDialog from './components/confirmActionDialog';
import ContactList from './components/contactList';
import GroupList from './components/groupList';
import ContactsNav from './components/contactsNav';
import ContactAppStore from './stores/contactAppStore';
import './stylesheets/contacts.css';

const SESSION_HEARTBEAT_INTERVAL = 30000;
const APP_NAV_ICON_WIDTH = 24;
const APP_NAV_ICON_HEIGHT = 24;

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

function connectAddGroupDialog()
{
    return connect(
        state => {
            return {
                show: state.status === STATUS.CONFIRM_ACTION && state.confirmAction.type === CONFIRM_ACTION_TYPE.GROUP,
                contacts: state.confirmAction.subjects
            };
        },
        dispatch => {
            return {
                onSaved: (group) => dispatch(ContactAppActions.addGroupSave(group)),
                onCancelled: () => dispatch(ContactAppActions.addGroupCancel())
            };
        }
    )(AddGroupDialog);
}

function connectContactList(isFavoritesList = false)
{
    return connect(
        state => {
            return {
                status: state.status,
                contacts: isFavoritesList ? state.contacts.filter(contact => contact.contact.favorite) : state.contacts,
                disabled: state.disabled,
                orderBy: state.orderContactsBy
            };
        },
        dispatch => {
            return {
                onAddContactClicked: () => dispatch(ContactAppActions.addContact()),
                onEditContactClicked: (contact) => dispatch(ContactAppActions.editContact(contact)),
                onRefreshClicked: () => dispatch(ContactAppActions.retrieveContacts()),
                onSelected: (contact) => dispatch(ContactAppActions.selectContact(contact)),
                onSelectAll: () => dispatch(ContactAppActions.selectAllContacts()),
                onDeselected: (contact) => dispatch(ContactAppActions.deselectContact(contact)),
                onDeselectAll: () => dispatch(ContactAppActions.deselectAllContacts()),
                onDeleteClicked: (contact) => dispatch(ContactAppActions.confirmDeleteContact(contact)),
                onDeleteMultipleClicked: (contacts) => dispatch(ContactAppActions.confirmDeleteContacts(contacts)),
                onFavoriteClicked: (contact) => {
                    if (isFavoritesList)
                    {
                        dispatch(ContactAppActions.confirmUnfavoriteContact(contact));
                    }
                    else
                    {
                        dispatch(ContactAppActions.favoriteContact(contact));
                    }
                },
                onFavoriteMultipleClicked: (contacts) => {
                    if (isFavoritesList)
                    {
                        if (contacts.length > 1)
                        {
                            dispatch(ContactAppActions.confirmUnfavoriteContacts(contacts));
                        }
                        else
                        {
                            dispatch(ContactAppActions.confirmUnfavoriteContact(contacts[0]));
                        }
                    }
                    else
                    {
                        if (contacts.length > 1)
                        {
                            dispatch(ContactAppActions.confirmFavoriteContacts(contacts));
                        }
                        else
                        {
                            dispatch(ContactAppActions.favoriteContact(contacts[0]));
                        }
                    }
                },
                onGroupClicked: (contacts) => dispatch(ContactAppActions.addGroup(contacts)),
                onSortChanged: (orderBy) => dispatch(ContactAppActions.sortContacts(orderBy))
            };
        }
    )(ContactList);
}

function connectGroupList()
{
    return connect(
        state => {
            return {
                status: state.status,
                disabled: state.disabled,
                groups: state.groups,
                orderBy: state.orderGroupsBy
            };
        },
        dispatch => {
            return {
                onSelected: (group) => dispatch(ContactAppActions.selectGroup(group)),
                onSelectAll: () => dispatch(ContactAppActions.selectAllGroups()),
                onDeselected: (group) => dispatch(ContactAppActions.deselectGroup(group)),
                onDeselectAll: () => dispatch(ContactAppActions.deselectAllGroups()),
                onRefreshClicked: () => dispatch(ContactAppActions.retrieveGroups()),
                onSortChanged: (orderBy) => dispatch(ContactAppActions.sortGroups(orderBy))
            };
        }
    )(GroupList);
}

function connectAddContactDialog(isFavoritesList = false)
{
    return connect(
        state => {
            return {
                show: state.status === STATUS.ADD_CONTACT,
                mode: CONTACT_DIALOG_MODE.ADD_CONTACT,
                isFavorite: isFavoritesList
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

function connectEditContactDialog()
{
    return connect(
        state => {
            return {
                show: state.status === STATUS.EDIT_CONTACT,
                mode: CONTACT_DIALOG_MODE.EDIT_CONTACT,
                contact: state.contact
            };
        },
        dispatch => {
            return {
                onSaved: (contact) => dispatch(ContactAppActions.editContactSave(contact)),
                onCancelled: () => dispatch(ContactAppActions.editContactCancel())
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
                show: status === STATUS.CONFIRM_ACTION && confirmAction.type === CONFIRM_ACTION_TYPE.DELETE,
                title: status === STATUS.CONFIRM_ACTION ? 
                        (`Delete Contact${contacts.length > 1 ? 's' : ''}`) :
                        '',
                bodyText: status === STATUS.CONFIRM_ACTION ?
                        (contacts.length > 1 ? `Delete ${contacts.length} contacts?` : `Delete contact ${contacts[0].firstName} ${contacts[0].lastName}?`) :
                        '',
                actionType: status === STATUS.CONFIRM_ACTION ? confirmAction.type : '',
                subjects: contacts
            };
        },
        dispatch => {
            return {
                onAccepted: (actionType, contacts) => { 
                    if (contacts.length > 1)
                    {
                        dispatch(ContactAppActions.deleteContacts(contacts));
                    }
                    else
                    {
                        dispatch(ContactAppActions.deleteContact(contacts[0]));
                    }
                },
                onCancelled: (actionType, contacts) => {
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

function connectConfirmFavoriteContactsDialog()
{
    return connect(
        state => {
            let status = state.status;
            let confirmAction = state.confirmAction;
            let contacts = confirmAction.subjects;

            return {
                show: status === STATUS.CONFIRM_ACTION && (confirmAction.type === CONFIRM_ACTION_TYPE.FAVORITE || confirmAction.type === CONFIRM_ACTION_TYPE.UNFAVORITE),
                title: status === STATUS.CONFIRM_ACTION ? 
                        (confirmAction.type === CONFIRM_ACTION_TYPE.FAVORITE ?
                            `Favorite Contact${contacts.length > 1 ? 's' : ''}` :
                            `Unfavorite Contact${contacts.length > 1 ? 's' : ''}`) :
                        '',
                bodyText: status === STATUS.CONFIRM_ACTION ?
                        (confirmAction.type === CONFIRM_ACTION_TYPE.FAVORITE ?
                            `Favorite ${contacts.length} contacts?` :
                            (contacts.length > 1 ?
                                `Unfavorite ${contacts.length} contacts?` :
                                `Unfavorite contact ${contacts[0].firstName} ${contacts[0].lastName}?`)) :
                        '',
                actionType: status === STATUS.CONFIRM_ACTION ? confirmAction.type : '',
                subjects: contacts
            };
        },
        dispatch => {
            return {
                onAccepted: (actionType, contacts) => { 
                    actionType === CONFIRM_ACTION_TYPE.FAVORITE ? 
                        dispatch(ContactAppActions.favoriteContacts(contacts)) :
                        dispatch(ContactAppActions.favoriteContacts(contacts, false));
                },
                onCancelled: (actionType, contacts) => {
                    dispatch(ContactAppActions.cancelledFavoriteContacts(contacts));
                }
            };
        }
    )(ConfirmActionDialog);
}

function ContactsView(props)
{
    let {
        isFavoritesList
    } = props;

    let AddContactDialog = connectAddContactDialog(isFavoritesList);
    let EditContactDialog = connectEditContactDialog();
    let AddGroupDialog = connectAddGroupDialog();
    let ConfirmDeleteContactsDialog = connectConfirmDeleteContactsDialog();
    let ConfirmFavoriteContactsDialog = connectConfirmFavoriteContactsDialog();
    let ContactList = connectContactList(isFavoritesList);

    return (
        <>
            <AddContactDialog />
            <EditContactDialog />
            <AddGroupDialog />
            <ConfirmDeleteContactsDialog />
            <ConfirmFavoriteContactsDialog />
            <ContactList />
        </>
    );
}

ContactsView.defaultProps = {
    isFavoritesList: false
}

ContactsView.propTypes = {
    isFavoritesList: PropTypes.bool
}

function FavoritesView()
{
    return (
        <ContactsView isFavoritesList={ true } />
    );
}

function GroupsView()
{
    let GroupList = connectGroupList();

    return (
        <GroupList />
    );
}

function renderContactsApp()
{
    let authState = document.getElementById('auth-state');

    if (authState && authState.value === 'LOGGED_IN')
    {
        let store = ContactAppStore();

        ReactDOM.render(<ContactsHeader /> , document.getElementById('contacts-header'));
        ReactDOM.render(
            <div className="app-container">
                <Router>
                    <ContactsNav>
                        <ContactsNav.Link to="/contacts" icon={ <ContactIcon width={ APP_NAV_ICON_WIDTH } height={ APP_NAV_ICON_HEIGHT } /> } linkText="Contacts" />
                        <ContactsNav.Link to="/favorites" icon={ <FavoriteIcon width={ APP_NAV_ICON_WIDTH } height={ APP_NAV_ICON_HEIGHT } outline={ false } /> } linkText="Favorites" />
                        <ContactsNav.Link to="/groups" icon={ <GroupIcon width={ APP_NAV_ICON_WIDTH } height={ APP_NAV_ICON_HEIGHT } /> } linkText="Groups" />
                        <ContactsNav.Divider />
                        <ContactsNav.Link to="/settings" icon={ <SettingsIcon width={ APP_NAV_ICON_WIDTH } height={ APP_NAV_ICON_HEIGHT } /> } linkText="Settings" />
                    </ContactsNav>

                    <div className="app-list-container">
                        
                            <Switch>
                                <Route exact path="/">
                                    <Redirect to="/contacts" />
                                </Route>
                                <Route exact path="/contacts">
                                    <Provider store={ store }>
                                        <ContactsView />
                                    </Provider>
                                </Route>
                                <Route exact path="/favorites">
                                    <Provider store={ store }>
                                        <FavoritesView />
                                    </Provider>
                                </Route>
                                <Route exact path="/groups">
                                    <Provider store={ store }>
                                        <GroupsView />
                                    </Provider>
                                </Route>
                            </Switch>
                    </div>
                </Router>
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