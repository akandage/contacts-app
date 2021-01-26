import React, { useRef, useState } from 'react';
import { Button, Form, Nav, Overlay, OverlayTrigger, Popover, PopoverContent } from 'react-bootstrap';
import ContactsLogoImage from './contacts.svg';
import SearchIconImage from './search-icon.svg';
import UserIconImage from './user-icon.svg';
import './contacts.css';

export function ContactsHeaderLogo()
{
    return (
        <div className="contacts-header-logo">
            <ContactsLogoImage width="64" height="64" viewBox="0 0 1519 1191" />

            <h1>
                contacts
            </h1>
        </div>
    );
}

export function ContactsHeader(props)
{
    const [ loggedInUser, setLoggedInUser ] = useState();

    fetch('/session/username')
        .then(
            response => {
                if (response.ok)
                {
                    return response.json().then(
                        response => {
                            let username = response['username'];

                            if (username)
                            {
                                setLoggedInUser(response['username']);
                            }
                        }
                    );
                }
            }
        )
        .catch(
            error => {
                console.error(`Error while trying to retrieve logged in user info: ${error}`);
            }
        );

    function SearchForm(props)
    {
        let {
            searchPlaceholderText
        } = props;

        return (
            <div className="search-form">
                <Form.Control as="input" type="text" size="lg" placeholder={ searchPlaceholderText } />
                <Button size="sm">
                    <SearchIconImage width="24" height="24" viewBox="-40 0 144 128" />
                </Button>
            </div>
        );
    }

    function LoginSignUp(props)
    {
        if (!loggedInUser)
        {
            return (
                <div className="login-signup-buttons">
                    <Button href="/login" size="lg" variant="primary" block>Login</Button>
                    <Button href="/signup" size="lg" variant="outline-primary" block>Sign Up</Button>
                </div>
            );
        }

        return <></>;
    }

    const UserPopover =
    (
        <Popover id='user-popover'>
            <PopoverContent>
                <Nav className="flex-column">
                    <Nav.Item>
                        <Nav.Link href="#">User Settings</Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link href="/logout">Logout</Nav.Link>
                    </Nav.Item>
                </Nav>
            </PopoverContent>
        </Popover>
    );

    function UserIcon(props)
    {
        if (loggedInUser)
        {
            // TODO: Retrieve user profile photo from server.
            return (
                <OverlayTrigger trigger='focus' overlay={ UserPopover } placement='bottom'>
                    <a id="user-icon-button" href="#">
                        <UserIconImage width="64" height="64" viewBox="0 0 1714 2211" />
                    </a>
                </OverlayTrigger>
            );
        }

        return <></>;
    }

    return (
        <div className="contacts-header">
            <ContactsHeaderLogo />
            <SearchForm {...props} />
            <LoginSignUp {...props} />
            <UserIcon {...props} />
        </div>
    );
}