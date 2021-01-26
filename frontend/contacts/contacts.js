import React from 'react';
import ReactDOM from 'react-dom';
import { ContactsHeader } from '../common/contactsHeader';

const SESSION_HEARTBEAT_INTERVAL = 5000;

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

window.onload = function()
{
    startSessionHeartbeat();

    ReactDOM.render(<ContactsHeader /> , document.getElementById('contacts-header'));
}