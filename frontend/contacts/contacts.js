import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import { connect, Provider } from 'react-redux';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import queryString from 'query-string';
import { CONTACTS_SEARCH_URL, MAX_CONTACT_SEARCH_RESULTS, STATUS, CONFIRM_ACTION_TYPE } from './constants';
import * as ContactAppActions from './actions/contactAppActions';
import ContactsHeader from '../common/contactsHeader';
import { ContactIcon, FavoriteIcon, GroupIcon, SearchIcon, SettingsIcon } from '../common/contactsImages';
import ContactDialog, { CONTACT_DIALOG_MODE } from './components/contactDialog';
import ConfirmActionDialog from './components/confirmActionDialog';
import ContactList from './components/contactList';
import GroupDialog, { GROUP_DIALOG_MODE } from './components/groupDialog';
import GroupContactsDialog from './components/groupContactsDialog';
import GroupList from './components/groupList';
import ContactsNav from './components/contactsNav';
import ContactAppStore from './stores/contactAppStore';
import './stylesheets/contacts.css';

const CONTACTS_APP_SEARCH_URL = '/search';
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

function connectGroupContactsDialog()
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
    )(GroupContactsDialog);
}

function getContactListDispatchActions(dispatch, isFavoritesList = false)
{
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
            return getContactListDispatchActions(dispatch, isFavoritesList);
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
                onAddGroupClicked: () => dispatch(ContactAppActions.addGroup([])),
                onEditGroupClicked: (group) => dispatch(ContactAppActions.editGroup(group)),
                onDeleteClicked: (group) => dispatch(ContactAppActions.confirmDeleteGroup(group)),
                onDeleteMultipleClicked: (groups) => dispatch(ContactAppActions.confirmDeleteGroups(groups)),
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

function connectAddGroupDialog()
{
    return connect(
        state => {
            return {
                show: state.status === STATUS.CONFIRM_ACTION && state.confirmAction.type === CONFIRM_ACTION_TYPE.GROUP,
                mode: GROUP_DIALOG_MODE.ADD_GROUP
            };
        },
        dispatch => {
            return {
                onSaved: (group) => dispatch(ContactAppActions.addGroupSave(group)),
                onCancelled: () => dispatch(ContactAppActions.addGroupCancel())
            };
        }
    )(GroupDialog);
}

function connectEditGroupDialog()
{
    return connect(
        state => {
            return {
                show: state.status === STATUS.EDIT_GROUP,
                mode: GROUP_DIALOG_MODE.EDIT_GROUP,
                group: state.group,
            };
        },
        dispatch => {
            return {
                onSaved: (group) => dispatch(ContactAppActions.editGroupSave(group)),
                onCancelled: () => dispatch(ContactAppActions.editGroupCancel())
            };
        }
    )(GroupDialog);
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
                title: status === STATUS.CONFIRM_ACTION && confirmAction.type === CONFIRM_ACTION_TYPE.DELETE ? 
                        (`Delete Contact${contacts.length > 1 ? 's' : ''}`) :
                        '',
                bodyText: status === STATUS.CONFIRM_ACTION && confirmAction.type === CONFIRM_ACTION_TYPE.DELETE ?
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

function connectConfirmDeleteGroupsDialog()
{
    return connect(
        state => {
            let status = state.status;
            let confirmAction = state.confirmAction;
            let groups = confirmAction.subjects;

            return {
                show: status === STATUS.CONFIRM_ACTION && confirmAction.type === CONFIRM_ACTION_TYPE.DELETE,
                title: status === STATUS.CONFIRM_ACTION && confirmAction.type === CONFIRM_ACTION_TYPE.DELETE ? 
                        (`Delete Group${groups.length > 1 ? 's' : ''}`) :
                        '',
                bodyText: status === STATUS.CONFIRM_ACTION && confirmAction.type === CONFIRM_ACTION_TYPE.DELETE ?
                        (groups.length > 1 ? `Delete ${groups.length} groups?` : `Delete group ${groups[0].name}?`) :
                        '',
                actionType: status === STATUS.CONFIRM_ACTION ? confirmAction.type : '',
                subjects: groups
            };
        },
        dispatch => {
            return {
                onAccepted: (actionType, groups) => { 
                    if (groups.length > 1)
                    {
                        dispatch(ContactAppActions.deleteGroups(groups));
                    }
                    else
                    {
                        dispatch(ContactAppActions.deleteGroup(groups[0]));
                    }
                },
                onCancelled: (actionType, groups) => {
                    if (groups.length > 1)
                    {
                        dispatch(ContactAppActions.cancelledDeleteGroups(groups));
                    }
                    else
                    {
                        dispatch(ContactAppActions.cancelledDeleteGroup(groups[0]));
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
                title: status === STATUS.CONFIRM_ACTION && (confirmAction.type === CONFIRM_ACTION_TYPE.FAVORITE || confirmAction.type === CONFIRM_ACTION_TYPE.UNFAVORITE) ? 
                        (confirmAction.type === CONFIRM_ACTION_TYPE.FAVORITE ?
                            `Favorite Contact${contacts.length > 1 ? 's' : ''}` :
                            `Unfavorite Contact${contacts.length > 1 ? 's' : ''}`) :
                        '',
                bodyText: status === STATUS.CONFIRM_ACTION && (confirmAction.type === CONFIRM_ACTION_TYPE.FAVORITE || confirmAction.type === CONFIRM_ACTION_TYPE.UNFAVORITE) ?
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

function ContactsHeaderView(props)
{
    let {
        currentSearchTerms
    } = props;

    const [ searchText, setSearchText ] = useState();
    const [ searchTerms, setSearchTerms ] = useState();
    const [ searchSuggestions, setSearchSuggestions ] = useState([]);
    const [ searchSuggestionsTimer, setSearchSuggestionsTimer ] = useState(null);

    useEffect(() => {
        setSearchText(currentSearchTerms.join(' '));
        setSearchTerms(currentSearchTerms);
        setSearchSuggestions([]);
        clearTimeout(searchSuggestionsTimer);
        setSearchSuggestionsTimer(null);
    }, [ currentSearchTerms ]);

    function getSearchButtonUrl()
    {
        return `${CONTACTS_APP_SEARCH_URL}?${queryString.stringify({ searchTerms })}`;
    }

    async function fetchSuggestions(searchTerms)
    {
        let qs = { searchTerms };
        let results = [];

        qs.limit = MAX_CONTACT_SEARCH_RESULTS;

        try
        {
            let response = await fetch(`${CONTACTS_SEARCH_URL}?${queryString.stringify(qs)}`);

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

    function onSearchTextChanged(searchText)
    {
        setSearchText(searchText);

        let searchTerms = searchText.trim().split(' ');
        setSearchTerms(searchTerms);
        clearTimeout(searchSuggestionsTimer);
        setSearchSuggestionsTimer(
            setTimeout(() => {
                fetchSuggestions(searchTerms)
                    .then(contacts => {
                        setSearchSuggestions(contacts.map(contact => {
                            let searchTerms = [ contact.firstName, contact.lastName ];

                            return {
                                suggestionText: `${contact.firstName} ${contact.lastName}`,
                                suggestionUrl: `${CONTACTS_APP_SEARCH_URL}?${queryString.stringify({ searchTerms })}`
                            };
                        }));
                    })
            }, 100)
        );
    }

    function onSearchFocus()
    {
        if (searchText !== '')
        {
            onSearchTextChanged(searchText);
        }
    }

    function onSearchBlur()
    {
        clearTimeout(searchSuggestionsTimer);
        setSearchSuggestionsTimer(null);
        // Don't clear suggestions immediately in case suggestion was clicked.
        setTimeout(() => setSearchSuggestions([]), 100);
    }

    return (
        <ContactsHeader
            searchText={ searchText }
            searchButtonUrl={ getSearchButtonUrl() }
            searchSuggestions={ searchSuggestions }
            searchPlaceholderText="Search Contacts"
            onSearchTextChanged={ onSearchTextChanged }
            onSearchFocus={ onSearchFocus }
            onSearchBlur={ onSearchBlur }
        />
    );
}

ContactsHeaderView.defaultProps = {
    currentSearchTerms: []
};

ContactsHeaderView.propTypes = {
    currentSearchTerms: PropTypes.arrayOf(
        PropTypes.string
    )
};

function connectContactsHeaderView()
{
    return connect(
        state => {
            return {
                currentSearchTerms: state.searchContactsSearchTerms
            };
        }
    )(ContactsHeaderView);
}

function connectSearchContactList()
{
    return connect(
        state => {
            let searchContactIds = new Set(state.searchContacts.map(contact => contact._id));
            let contacts = state.contacts.filter(contact => searchContactIds.has(contact.contact._id));

            return {
                status: state.status,
                contacts,
                disabled: state.disabled,
                addContactDisabled: true,
                refreshContactsDisabled: true,
                sortContactsDisabled: true
            };
        },
        dispatch => {
            return getContactListDispatchActions(dispatch);
        }
    )(ContactList);
}

function ContactsView(props)
{
    let {
        isFavoritesList
    } = props;

    let AddContactDialog = connectAddContactDialog(isFavoritesList);
    let EditContactDialog = connectEditContactDialog();
    let GroupContactsDialog = connectGroupContactsDialog();
    let ConfirmDeleteContactsDialog = connectConfirmDeleteContactsDialog();
    let ConfirmFavoriteContactsDialog = connectConfirmFavoriteContactsDialog();
    let ContactList = connectContactList(isFavoritesList);

    return (
        <>
            <AddContactDialog />
            <EditContactDialog />
            <GroupContactsDialog />
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
    let AddGroupDialog = connectAddGroupDialog();
    let EditGroupDialog = connectEditGroupDialog();
    let ConfirmDeleteGroupsDialog = connectConfirmDeleteGroupsDialog();
    let GroupList = connectGroupList();

    return (
        <>
            <AddGroupDialog />
            <EditGroupDialog />
            <ConfirmDeleteGroupsDialog />
            <GroupList />
        </>
    );
}

function SearchContactsView()
{
    let EditContactDialog = connectEditContactDialog();
    let GroupContactsDialog = connectGroupContactsDialog();
    let ConfirmDeleteContactsDialog = connectConfirmDeleteContactsDialog();
    let ConfirmFavoriteContactsDialog = connectConfirmFavoriteContactsDialog();
    let SearchContactList = connectSearchContactList();

    return (
        <>
            <EditContactDialog />
            <GroupContactsDialog />
            <ConfirmDeleteContactsDialog />
            <ConfirmFavoriteContactsDialog />
            <SearchContactList />
        </>
    );
}

function renderContactsRoute(props, store)
{
    setTimeout(() => {
        store.dispatch(ContactAppActions.clearSearchContacts());
        store.dispatch(ContactAppActions.deselectAllContacts());
    }, 0);

    return (
        <Provider store={ store }>
            <ContactsView />
        </Provider>
    );
}

function renderFavoritesRoute(props, store)
{
    setTimeout(() => {
        store.dispatch(ContactAppActions.clearSearchContacts());
        store.dispatch(ContactAppActions.deselectAllContacts());
    }, 0);

    return (
        <Provider store={ store }>
            <FavoritesView />
        </Provider>
    );
}

function renderGroupsRoute(props, store)
{
    setTimeout(() => {
        store.dispatch(ContactAppActions.clearSearchContacts());
        store.dispatch(ContactAppActions.deselectAllContacts());
    }, 0);

    return (
        <Provider store={ store }>
            <GroupsView />
        </Provider>
    );
}

function renderSearchRoute(props, store)
{
    let {
        location
    } = props;
    let searchTerms = null;

    if (location.search)
    {
        let qs = queryString.parse(location.search);

        if (Array.isArray(qs.searchTerms))
        {
            searchTerms = qs.searchTerms;
        }
        else if (typeof qs.searchTerms === 'string')
        {
            searchTerms = [ qs.searchTerms ];
        }
        else
        {
            searchTerms = [];
        }
    }
    else
    {
        searchTerms = [];
    }

    setTimeout(() => {
        store.dispatch(ContactAppActions.deselectAllContacts());
        store.dispatch(ContactAppActions.searchContacts(searchTerms));
    }, 0);

    return (
        <Provider store={ store }>
            <SearchContactsView />
        </Provider>
    );
}

function renderContactsApp()
{
    let authState = document.getElementById('auth-state');

    if (authState && authState.value === 'LOGGED_IN')
    {
        let store = ContactAppStore();

        let ContactsHeaderView = connectContactsHeaderView();
        ReactDOM.render(
            <Provider store={ store }>
                <ContactsHeaderView />
            </Provider>,
            document.getElementById('contacts-header'));

        ReactDOM.render(
            <div className="app-container">
                <Router>
                    <ContactsNav>
                        <ContactsNav.Link to="/search" icon={ <SearchIcon width={ APP_NAV_ICON_WIDTH } height={ APP_NAV_ICON_HEIGHT } /> } linkText="Search" />
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
                                <Route exact path="/contacts" render={ (props) => renderContactsRoute(props, store) } />
                                <Route exact path="/favorites" render={ (props) => renderFavoritesRoute(props, store) } />
                                <Route exact path="/groups" render={ (props) => renderGroupsRoute(props, store) } />
                                <Route exact path="/search" render={ (props) => renderSearchRoute(props, store) } />
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