import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Nav, Overlay, OverlayTrigger, Popover, PopoverContent } from 'react-bootstrap';
import { ContactsLogo, SearchIcon, UserIcon } from './contactsImages';
import './stylesheets/contacts-header.css';

export function ContactsHeaderLogo()
{
    return (
        <div className="contacts-header-logo">
            <ContactsLogo width="64" height="64" />

            <h1>
                contacts
            </h1>
        </div>
    );
}

export default function ContactsHeader(props)
{
    let {
        searchText,
        searchButtonUrl,
        searchPlaceholderText,
        searchSuggestions,
        onSearchTextChanged,
        onSearchFocus,
        onSearchBlur
    } = props;

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

    function UserMenu(props)
    {
        const UserMenuPopover =
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

        if (loggedInUser)
        {
            // TODO: Retrieve user profile photo from server.
            return (
                <OverlayTrigger trigger='focus' overlay={ UserMenuPopover } placement='bottom'>
                    <a id="user-icon-button" href="#">
                        <UserIcon width="48" height="48" />
                    </a>
                </OverlayTrigger>
            );
        }

        return <></>;
    }

    return (
        <div className="contacts-header">
            <ContactsHeaderLogo />

            {
                loggedInUser ?
                    <div className="search-form">
                        <Form.Control as="input"
                            type="text"
                            size="lg"
                            placeholder={ searchPlaceholderText }
                            value={ searchText }
                            onChange={ (e) => onSearchTextChanged(e.target.value) }
                            onFocus={ onSearchFocus }
                            onBlur={ onSearchBlur }
                        />

                        <Button href={ searchButtonUrl } size="sm">
                            <div className="search-icon-container">
                                <SearchIcon width="24" height="24" />
                            </div>
                        </Button>

                        {
                            searchSuggestions.length > 0 ?
                                <div className="search-suggestions">
                                    {
                                        searchSuggestions.map(
                                            ({ suggestionText, suggestionUrl }, index) =>
                                                <a href={ suggestionUrl } key={ index }>{ suggestionText }</a>
                                        )
                                    }
                                </div> :
                                <></>
                        }
                    </div> :
                    <></>
            }

            <LoginSignUp {...props} />
            <UserMenu {...props} />
        </div>
    );
}

ContactsHeader.defaultProps = {
    searchText: '',
    searchButtonUrl: '/',
    searchPlaceholderText: '',
    searchSuggestions: [],
    onSearchTextChanged: (searchText) => {},
    onSearchFocus: () => {},
    onSearchBlur: () => {}
};

ContactsHeader.propTypes = {
    searchText: PropTypes.string,
    searchButtonUrl: PropTypes.string,
    searchPlaceholderText: PropTypes.string,
    searchSuggestions: PropTypes.arrayOf(
        PropTypes.shape({
            suggestionText: PropTypes.string.isRequired,
            suggestionUrl: PropTypes.string.isRequired
        })
    ),
    onSearchTextChanged: PropTypes.func,
    onSearchFocus: PropTypes.func,
    onSearchBlur: PropTypes.func
};