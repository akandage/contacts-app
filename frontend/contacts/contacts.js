import React from 'react';
import ReactDOM from 'react-dom';
import { ContactsHeader } from '../common/contactsHeader';

window.onload = function()
{
    ReactDOM.render(<ContactsHeader /> , document.getElementById('contacts-header'));
}