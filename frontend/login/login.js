import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import { ContactsHeaderLogo } from '../common/contactsHeader';
import './login.css';

const { INVALID_USERNAME, INVALID_PASSWORD, isUsernameValid, isPasswordValid } = require('../../userCredsValid');
const LOGIN_FORM_ACTION = '/login';
const LOGIN_FORM_METHOD = 'post';
const USERNAME_REQUIRED = 'Username is required.';
const PASSWORD_REQUIRED = 'Password is required.';
const LOGIN_FAILED = 'User login failed. Check that username and password provided are correct.';
const LOGGED_OUT = 'User has been logged out.';

function LoginForm(props)
{
    const { formAlert } = props;
    const [ username, setUsername ] = useState('');
    const [ usernameInvalid, setUsernameInvalid ] = useState(false);
    const [ usernameInvalidMessage, setUsernameInvalidMessage ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ passwordInvalid, setPasswordInvalid ] = useState(false);
    const [ passwordInvalidMessage, setPasswordInvalidMessage ] = useState('');

    function LoginFormAlert()
    {
        if (formAlert === 'LOGIN_FAILED')
        {
            return <Alert variant="danger">{ LOGIN_FAILED }</Alert>
        }
        else if (formAlert === 'LOGGED_OUT')
        {
            return <Alert variant="success">{ LOGGED_OUT }</Alert>
        }

        return <></>;
    }

    function onUsernameChanged(e)
    {
        let u = e.target.value;

        if (u !== username)
        {
            setUsername(u);
        }
    }

    function validateUsername()
    {
        let uInv = !isUsernameValid(username);

        setUsernameInvalid(uInv);
        setUsernameInvalidMessage(username !== '' ? INVALID_USERNAME : USERNAME_REQUIRED);

        return uInv;
    }

    function onPasswordChanged(e)
    {
        let p = e.target.value;

        if (p !== password)
        {
            setPassword(p);
        }
    }

    function validatePassword()
    {
        let pInv = !isPasswordValid(password);

        setPasswordInvalid(pInv);
        setPasswordInvalidMessage(password !== '' ? INVALID_PASSWORD : PASSWORD_REQUIRED);

        return pInv;
    }

    function onSubmitClicked(e)
    {
        let uInv = validateUsername();
        let pInv = validatePassword();

        if (uInv || pInv)
        {
            e.preventDefault();
            e.stopPropagation();
        }
    }

    return (
        <div className="login-form">
            <Form action={ LOGIN_FORM_ACTION } method={ LOGIN_FORM_METHOD } noValidate>
                <LoginFormAlert />

                <Form.Group controlId="username">
                    <Form.Label>
                        Username
                    </Form.Label>
                    <Form.Control as="input" name="username" type="text" size="lg" maxLength="64"
                        value={ username }
                        onBlur= { validateUsername }
                        onChange={ onUsernameChanged }
                        isInvalid={ usernameInvalid }
                    />
                    <Form.Control.Feedback type="invalid">
                        { usernameInvalidMessage }
                    </Form.Control.Feedback>
                </Form.Group>

                <Form.Group controlId="password">
                    <Form.Label>
                        Password
                    </Form.Label>
                    <Form.Control as="input" name="password" type="password" size="lg" maxLength="64"
                        value={ password }
                        onBlur={ validatePassword }
                        onChange={ onPasswordChanged }
                        isInvalid={ passwordInvalid }
                    />
                    <Form.Control.Feedback type="invalid">
                        { passwordInvalidMessage }
                    </Form.Control.Feedback>
                </Form.Group>

                <div className="form-buttons">
                    <Row>
                        <Col>
                            <Button size="lg" type="submit" variant="primary" block
                                onClick={ onSubmitClicked }
                            >
                                Login
                            </Button>
                        </Col>
                        <Col>
                            <Button size="lg" variant="outline-primary" block>
                                Sign Up
                            </Button>
                        </Col>
                    </Row>
                </div>
            </Form>
        </div>
    );
}

function Login(props)
{
    const { formAlert } = props;

    return (
        <div className="login-form-container">
            <ContactsHeaderLogo />
            <LoginForm formAlert={ formAlert } />
        </div>
    );
}

window.onload = function()
{
    let formAlert = document.getElementById('login-form-alert');

    if (formAlert)
    {
        formAlert = formAlert.value;
    }

    ReactDOM.render(<Login formAlert={ formAlert } />, document.getElementById('root'));
}