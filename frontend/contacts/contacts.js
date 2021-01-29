import React from 'react';
import ReactDOM from 'react-dom';
import ContactsHeader from '../common/contactsHeader';
import ContactList from './components/contactList';
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

function renderContactList()
{
    fetch('/api/contacts')
        .then(
            response => {
                if (response.ok)
                {
                    response.json().then(
                        contacts => ReactDOM.render(
                            <div className="app-container">
                                <div className="app-list-container">
                                    <ContactList contacts={ contacts.map(contact => {
                                        return {
                                            contact,
                                            disabled: false,
                                            selected: false
                                        };
                                    }) } />
                                </div>
                            </div>,
                            document.getElementById('contacts-main')
                        )
                    )
                }
            }
        )
    ;
}

window.onload = function()
{
    startSessionHeartbeat();

    ReactDOM.render(<ContactsHeader /> , document.getElementById('contacts-header'));
    renderContactList();
}