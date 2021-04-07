import React, { useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { Alert, Button, Col, Form, Row } from 'react-bootstrap';
import queryString from 'query-string';
import ContactsHeader from '../common/contactsHeader';
import CustomTextBox from '../common/components/customTextbox';
import './stylesheets/signup.css';

const { isUsernameValid: usernameValid , isPasswordValid: passwordValid, INVALID_USERNAME, INVALID_PASSWORD } = require('../../userCredsValid');
const { EmailAddress } = require('../../emailAddress');
const { PhoneNumber } = require('../../phoneNumber');
const SIGNUP_FORM_ACTION = '/signup';
const SIGNUP_FORM_METHOD = 'post';
const SIGNUP_ERROR = 'Error occurred trying to create user account.';

function SignUpForm(props)
{
    let {
        formAlert
    } = props;

    const [ username, setUsername ] = useState('');
    const [ isUsernameDirty, setIsUsernameDirty ] = useState(false);
    const [ isUsernameValid, setIsUsernameValid ] = useState(false);
    const [ usernameInvalidFeedback, setUsernameInvalidFeedback ] = useState('');
    const usernameRef = useRef(null);

    const [ phoneNumber, setPhoneNumber ] = useState('');
    const [ isPhoneNumberDirty, setIsPhoneNumberDirty ] = useState(false);
    const [ isPhoneNumberValid, setIsPhoneNumberValid ] = useState(false);
    const [ phoneNumberInvalidFeedback, setPhoneNumberInvalidFeedback ] = useState('');
    const phoneNumberRef = useRef(null);

    const [ emailAddress, setEmailAddress ] = useState('');
    const [ isEmailAddressDirty, setIsEmailAddressDirty ] = useState(false);
    const [ isEmailAddressValid, setIsEmailAddressValid ] = useState(false);
    const [ emailAddressInvalidFeedback, setEmailAddressInvalidFeedback ] = useState('');
    const emailAddressRef = useRef(null);

    const [ password, setPassword ] = useState('');
    const [ isPasswordDirty, setIsPasswordDirty ] = useState(false);
    const [ isPasswordValid, setIsPasswordValid ] = useState(false);
    const [ passwordInvalidFeedback, setPasswordInvalidFeedback ] = useState('');
    const passwordRef = useRef(null);

    const [ confirmPassword, setConfirmPassword ] = useState('');
    const [ isConfirmPasswordDirty, setIsConfirmPasswordDirty ] = useState(false);
    const [ isConfirmPasswordValid, setIsConfirmPasswordValid ] = useState(false);
    const [ confirmPasswordInvalidFeedback, setConfirmPasswordInvalidFeedback ] = useState('');
    const confirmPasswordRef = useRef(null);

    const [ checkUsernameTimer, setCheckUsernameTimer ] = useState(null);
    const [ checkPhoneNumberTimer, setCheckPhoneNumberTimer ] = useState(null);
    const [ checkEmailAddressTimer, setCheckEmailAddressTimer ] = useState(null);

    function checkUsernameExists(username)
    {
        clearTimeout(checkUsernameTimer);
        let timer = setTimeout(async () => {
            try
            {
                let qs = { username };
                let response = await fetch(`/api/user?${queryString.stringify(qs)}`);

                if (response.ok)
                {
                    setIsUsernameValid(false);
                    setUsernameInvalidFeedback('User with this username already exists.');
                }
                else if (response.status !== 404)
                {
                    console.log(`Error checking user by username: ${response.status} ${response.statusText}`);
                }
            }
            catch (error)
            {
                console.log(`Error checking user by username: ${response.status} ${response.statusText}`);
            }
        }, 100);
        setCheckUsernameTimer(timer);
    }

    function checkUserExistsByPhoneNumber(phoneNumber)
    {
        clearTimeout(checkPhoneNumberTimer);
        let timer = setTimeout(async () => {
            try
            {
                let qs = { phoneNumber };
                let response = await fetch(`/api/user?${queryString.stringify(qs)}`);

                if (response.ok)
                {
                    setIsPhoneNumberValid(false);
                    setPhoneNumberInvalidFeedback('User with this phone number already exists.');
                }
                else if (response.status !== 404)
                {
                    console.log(`Error checking user by phone number: ${response.status} ${response.statusText}`);
                }
            }
            catch (error)
            {
                console.log(`Error checking user by phone number: ${response.status} ${response.statusText}`);
            }
        }, 100);
        setCheckPhoneNumberTimer(timer);
    }

    function checkUserExistsByEmailAddress(emailAddress)
    {
        clearTimeout(checkEmailAddressTimer);
        let timer = setTimeout(async () => {
            try
            {
                let qs = { emailAddress };
                let response = await fetch(`/api/user?${queryString.stringify(qs)}`);

                if (response.ok)
                {
                    setIsEmailAddressValid(false);
                    setEmailAddressInvalidFeedback('User with this email address already exists.');
                }
                else if (response.status !== 404)
                {
                    console.log(`Error checking user by email address: ${response.status} ${response.statusText}`);
                }
            }
            catch (error)
            {
                console.log(`Error checking user by email address: ${response.status} ${response.statusText}`);
            }
        }, 100);
        setCheckEmailAddressTimer(timer);
    }

    function onUsernameChanged(u)
    {
        if (u !== username || u === '')
        {
            let valid = usernameValid(u);

            setUsername(u);

            if (!isUsernameDirty)
            {
                setIsUsernameDirty(true);
            }

            setIsUsernameValid(valid);

            if (!valid)
            {
                if (u !== '')
                {
                    setUsernameInvalidFeedback('Username is invalid. Must start with a letter, only contain alphanumeric characters (letters, numbers) or underscores (_) and be at least 8 characters long.');
                }
                else
                {
                    setUsernameInvalidFeedback('Username is required.');
                }
            }
            else
            {
                checkUsernameExists(u);
            }
        }
    }

    function onPhoneNumberChanged(pn)
    {
        if (pn !== phoneNumber || pn === '')
        {
            let valid = PhoneNumber.isValidUSAOrCanada(pn);

            setPhoneNumber(pn);

            if (!isPhoneNumberDirty)
            {
                setIsPhoneNumberDirty(true);
            }

            setIsPhoneNumberValid(valid);

            if (!valid)
            {
                if (pn !== '')
                {
                    setPhoneNumberInvalidFeedback('Phone number is invalid. Must be a valid USA or Canada phone number.');
                }
                else
                {
                    setPhoneNumberInvalidFeedback('Phone number is required.');
                }
            }
            else
            {
                checkUserExistsByPhoneNumber(pn);
            }
        }
    }

    function onEmailAddressChanged(em)
    {
        if (em !== emailAddress || em === '')
        {
            let valid = EmailAddress.isValid(em);

            setEmailAddress(em);

            if (!isEmailAddressDirty)
            {
                setIsEmailAddressDirty(true);
            }

            setIsEmailAddressValid(valid);

            if (!valid)
            {
                if (em !== '')
                {
                    setEmailAddressInvalidFeedback('Email address is invalid.');
                }
                else
                {
                    setEmailAddressInvalidFeedback('Email address is required.');
                }
            }
            else
            {
                checkUserExistsByEmailAddress(em);
            }
        }
    }

    function onPasswordChanged(p)
    {
        if (p !== password || p === '')
        {
            let valid = passwordValid(p);

            setPassword(p);

            if (!isPasswordDirty)
            {
                setIsPasswordDirty(true);
            }

            setIsPasswordValid(valid);

            if (!valid)
            {
                if (p !== '')
                {
                    setPasswordInvalidFeedback('Password is invalid.');
                }
                else
                {
                    setPasswordInvalidFeedback('Password is required.');
                }
            }
        }
    }

    function onConfirmPasswordChanged(p)
    {
        if (p !== confirmPassword || p === '')
        {
            let valid = passwordValid(p);

            setConfirmPassword(p);

            if (!isConfirmPasswordDirty)
            {
                setIsConfirmPasswordDirty(true);
            }

            setIsConfirmPasswordValid(valid);

            if (!valid)
            {
                if (p !== '')
                {
                    setConfirmPasswordInvalidFeedback('Password is invalid.');
                }
                else
                {
                    setConfirmPasswordInvalidFeedback('Confirm the account password.');
                }
            }
            else if (isConfirmPasswordValid && password !== p)
            {
                setConfirmPasswordInvalidFeedback('Passwords don\'t match.');
                setIsConfirmPasswordValid(false);
            }
        }
    }

    function onSignUpClicked(e)
    {
        if (!isUsernameValid || !isPhoneNumberValid || !isEmailAddressValid ||
                !isPasswordValid || !isConfirmPasswordValid || password !== confirmPassword)
        {
            e.preventDefault();
            e.stopPropagation();

            if (!isUsernameValid)
            {
                usernameRef.current.focus();
            }
            else if (!isPhoneNumberValid)
            {
                phoneNumberRef.current.focus();
            }
            else if (!isEmailAddressValid)
            {
                emailAddressRef.current.focus();
            }
            else if (!isPasswordValid)
            {
                passwordRef.current.focus();
            }
            else if (!isConfirmPasswordValid)
            {
                confirmPasswordRef.current.focus();
            }
            else
            {
                // Passwords don't match.
                password.current.focus();
            }
        }
    }

    function reset()
    {
        setUsername('');
        setIsUsernameDirty(false);
        setIsUsernameValid(false);
        setUsernameInvalidFeedback('');

        setPhoneNumber('');
        setIsPhoneNumberDirty(false);
        setIsPhoneNumberValid(false);
        setPhoneNumberInvalidFeedback('');

        setEmailAddress('');
        setIsEmailAddressDirty(false);
        setIsEmailAddressValid(false);
        setEmailAddressInvalidFeedback('');

        setPassword('');
        setIsPasswordDirty(false);
        setIsPasswordValid(false);
        setPasswordInvalidFeedback('');

        setConfirmPassword('');
        setIsConfirmPasswordDirty(false);
        setIsConfirmPasswordValid(false);
        setConfirmPasswordInvalidFeedback('');
    }

    return (
        <div className="signup-form-container">
            <h2>Sign Up</h2>

            {
                formAlert === 'SIGNUP_ERROR' ?
                    <Alert variant="danger">{ SIGNUP_ERROR }</Alert> :
                    <></>
            }

            <Form className="signup-form" method={ SIGNUP_FORM_METHOD } action={ SIGNUP_FORM_ACTION } noValidate>
                <div className="signup-form-section">
                        <CustomTextBox id="username"
                            labelText="Username"
                            ref={ usernameRef }
                            value={ username }
                            isInvalid={ isUsernameDirty && !isUsernameValid }
                            invalidFeedback={ usernameInvalidFeedback }
                            onChanged={ onUsernameChanged }
                            onBlur={ () => onUsernameChanged(username) }
                        />
                </div>

                <div className="signup-form-section"> 
                    <CustomTextBox id="phoneNumber"
                        labelText="Phone Number"
                        value={ phoneNumber }
                        ref={ phoneNumberRef }
                        isInvalid={ isPhoneNumberDirty && !isPhoneNumberValid }
                        invalidFeedback={ phoneNumberInvalidFeedback }
                        onChanged={ onPhoneNumberChanged }
                        onBlur={ () => onPhoneNumberChanged(phoneNumber) }
                    />

                    <CustomTextBox id="emailAddress"
                        labelText="Email Address"
                        value={ emailAddress }
                        ref={ emailAddressRef }
                        isInvalid={ isEmailAddressDirty && !isEmailAddressValid }
                        invalidFeedback={ emailAddressInvalidFeedback }
                        onChanged={ onEmailAddressChanged }
                        onBlur={ () => onEmailAddressChanged(emailAddress) }
                    />
                </div>

                <div className="signup-form-section"> 
                    <CustomTextBox id="password"
                        labelText="Password"
                        inputType="password"
                        ref={ passwordRef }
                        value={ password }
                        isInvalid={ isPasswordDirty && !isPasswordValid }
                        invalidFeedback={ passwordInvalidFeedback }
                        onChanged={ onPasswordChanged }
                        onBlur={ () => onPasswordChanged(password) }
                    />

                    <CustomTextBox id="confirmPassword"
                        labelText="Confirm Password"
                        inputType="password"
                        ref={ confirmPasswordRef }
                        value={ confirmPassword }
                        isInvalid={ isConfirmPasswordDirty && !isConfirmPasswordValid }
                        invalidFeedback={ confirmPasswordInvalidFeedback }
                        onChanged={ onConfirmPasswordChanged }
                        onBlur={ () => onConfirmPasswordChanged(confirmPassword) }
                    />
                </div>

                <div className="signup-form-buttons">
                    <Button size="lg" type="submit" variant="primary"
                        onClick={ onSignUpClicked }
                    >
                        Sign Up
                    </Button>
                </div>
            </Form>
        </div>
    );
}

window.onload = function()
{
    let formAlert = document.getElementById('signup-form-alert');

    if (formAlert)
    {
        formAlert = formAlert.value;
    }

    ReactDOM.render(<ContactsHeader />, document.getElementById('contacts-header'));
    ReactDOM.render(<SignUpForm formAlert={ formAlert } />, document.getElementById('signup-main'));
}