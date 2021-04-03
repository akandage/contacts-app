import React, { useEffect, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import {
    Switch,
    Route,
    Link,
    useHistory,
    useRouteMatch
  } from "react-router-dom";
import PropTypes from 'prop-types';
import queryString from 'query-string';
import CustomTextBox from './customTextbox';
import { STATUS } from '../constants';
import UploadImage from './uploadImage';

const { EmailAddress } = require('../../../emailAddress');

const ACTION_BUTTON_CLASS = 'btn btn-primary btn-block';
const GET_USER_URL = '/api/user';
const CHANGE_EMAIL_ADDRESS_URL = '/api/user/email-address';
const CHANGE_PHONE_NUMBER_URL = '/api/user/phone-number';
const CHANGE_PROFILE_PICTURE_URL = '/api/user/profile-picture';
const UPLOAD_IMAGE_URL = '/api/user/profile-picture';

export default function UserSettings(props)
{
    let { url } = useRouteMatch();

    const [ status, setStatus ] = useState(STATUS.START);
    const [ error, setError ] = useState(null);
    const [ user, setUser ] = useState(null);

    useEffect(() => {
        if (status === STATUS.START)
        {
            fetchUser();
        }
    }, [ status ]);

    async function fetchUser()
    {
        setStatus(STATUS.LOADING);

        let response = await fetch(GET_USER_URL);

        if (response.ok)
        {
            let user = await response.json();

            setUser(user);
            setStatus(STATUS.IDLE);
        }
        else
        {
            let e = await response.json();
            let error = `${response.status} ${response.statusText} ${e.message}`;

            setStatus(STATUS.ERROR);
            setError(error);
        }
    }

    function getFileUuid(imageUrl)
    {
        let imageUrlParts = imageUrl.split('/');
        return imageUrlParts[imageUrlParts.length - 1];
    }

    async function deleteProfilePicture(imageUrl)
    {
        if (imageUrl !== null)
        {
            try
            {
                let fileUuid = getFileUuid(imageUrl);
                let response = await fetch(`${UPLOAD_IMAGE_URL}/${fileUuid}`, {
                    method: 'DELETE'
                });

                if (response.ok)
                {
                    console.log(`Deleted profile picture: ${fileUuid}`);
                }
                else
                {
                    console.log(`Error deleting profile picture ${fileUuid}: ${response.status} ${response.statusText}`);
                }
            }
            catch (error)
            {
                console.log(`Error deleting profile picture: ${error}`);
            }
        }
    }

    async function changeUserProfilePicture(imageUrl)
    {
        if (status !== STATUS.ERROR)
        {
            try
            {
                let fileUuid = getFileUuid(imageUrl);
                let qs = queryString.stringify({ value: fileUuid });
                let response = await fetch(`${CHANGE_PROFILE_PICTURE_URL}?${qs}`, {
                    method: 'PUT'
                });

                if (response.ok)
                {
                    // Delete the previous profile picture.
                    await deleteProfilePicture(user.profilePictureUrl);

                    setUser(Object.assign({}, user, {
                        profilePictureUrl: imageUrl
                    }));
                    setStatus(STATUS.IDLE);
                }
                else
                {
                    let e = await response.json();
                    let error = `${response.status} ${response.statusText} ${e.message}`;

                    setStatus(STATUS.ERROR);
                    setError(error);
                }
            }
            catch (error)
            {
                setStatus(STATUS.ERROR);
                setError(`Could not change user profile picture: ${error}`);
            }
        }
    }

    function onUserProfilePictureUploadError(error)
    {
        console.log(`Error uploading user profile picture: ${error}`);
        setError(error);
        setStatus(STATUS.ERROR);
    }

    function onUserChanged(user)
    {
        console.log(user);
        setUser(user);
    }

    function onErrorSavingUser(error)
    {
        console.log(error);
        setError(error);
        setStatus(STATUS.ERROR);
    }

    return (
        <>
            {
                status === STATUS.START || status === STATUS.LOADING ?
                    <div className="user-settings-placeholder">
                        <div>
                            <Spinner animation="border" variant="primary" />
                        </div>
                    </div> :
                    <Switch>
                        <Route exact path={ url }>
                            <div className="user-settings-container">
                                <div className="user-settings-user">
                                    <UploadImage
                                        initialImageUrl={ user.profilePictureUrl }
                                        uploadImageUrl={ UPLOAD_IMAGE_URL }
                                        onImageUploaded={ changeUserProfilePicture }
                                        onImageUploadError={ onUserProfilePictureUploadError }
                                    />

                                    <span>{ user.username }</span>
                                </div>

                                <hr />

                                <div className="user-settings-actions">
                                    <ul>
                                        <li>
                                            <Link to={ `${url}/change-email-address` } className={ ACTION_BUTTON_CLASS }>Change Email Address</Link>
                                        </li>
                                        <li>
                                            <Link to={ `${url}/change-phone-number` } className={ ACTION_BUTTON_CLASS }>Change Phone Number</Link>
                                        </li>
                                        <li>
                                            <Link to={ `${url}/change-password` } className={ ACTION_BUTTON_CLASS }>Change Password</Link>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </Route>
                        <Route path={ `${url}/change-email-address` }>
                            <UserSettings.ChangeEmailAddress
                                user={ user }
                                backUrl={ url }
                                onUserChanged={ onUserChanged }
                                onErrorSaving={ onErrorSavingUser }
                            />
                        </Route>
                    </Switch>
            }
        </>
    );
}

UserSettings.defaultProps = {

};

UserSettings.propTypes = {

};

UserSettings.ChangeEmailAddress = function(props)
{
    let {
        user,
        backUrl,
        onUserChanged,
        onErrorSaving,
        onCancelled
    } = props;
    const history = useHistory();
    const [ emailAddress, setEmailAddress ] = useState();
    const [ isEmailAddressDirty, setIsEmailAddressDirty ] = useState();
    const [ isEmailAddressValid, setIsEmailAddressValid ] = useState();
    const [ invalidFeedback, setInvalidFeedback ] = useState();

    useEffect(() => {
        setEmailAddress(user.emailAddress);
        setIsEmailAddressDirty(false);
        setIsEmailAddressValid(true);
        setInvalidFeedback('');
    }, [ user ]);

    function onEmailAddressChanged(em)
    {
        if (em !== emailAddress)
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
                    setInvalidFeedback('Email address is not valid.');
                }
                else
                {
                    setInvalidFeedback('Email address is required.');
                }
            }
            else
            {
                setInvalidFeedback('');
            }
        }
    }

    async function saveChanges()
    {
        let u = Object.assign({}, user, { emailAddress });

        try
        {
            let qs = queryString.stringify({ value: emailAddress });
            let response = await fetch(`${CHANGE_EMAIL_ADDRESS_URL}?${qs}`, {
                method: 'PUT'
            });

            if (!response.ok)
            {
                let e = await response.json();

                onErrorSaving(`Error saving user email address: ${response.status} ${response.statusText} ${e.message}`);
                return;
            }
        }
        catch (error)
        {
            onErrorSaving(`Error saving user email address: ${error}`);
            return;
        }

        return u;
    }

    async function onSaveClicked()
    {
        let user = await saveChanges();
        hide();

        if (user)
        {
            onUserChanged(user);
        }
    }

    function reset()
    {
        setEmailAddress(user.emailAddress);
        setIsEmailAddressDirty(false);
        setIsEmailAddressValid(true);
        setInvalidFeedback('');
    }

    function hide()
    {
        history.push(backUrl);
    }

    function onCancelClicked()
    {
        reset();
        hide();
        onCancelled();
    }

    function allowSave()
    {
        return isEmailAddressDirty && isEmailAddressValid;
    }

    function allowCancel()
    {
        return true;
    }

    return (
        <div className="user-settings-form-container">
            <div className="user-settings-form">
                <Form noValidate>
                    <CustomTextBox id="emailAddress"
                        labelText="Email Address"
                        value={ emailAddress }
                        isInvalid={ isEmailAddressDirty && !isEmailAddressValid }
                        invalidFeedback={ invalidFeedback }
                        onChanged={ onEmailAddressChanged }
                    />
                </Form>
            </div>

            <hr />

            <div className="user-settings-action-buttons">
                <Button variant="primary" onClick={ onSaveClicked } disabled={ !allowSave() }>Save</Button>
                <Button variant="secondary" onClick={ onCancelClicked } disabled={ !allowCancel() }>Cancel</Button>
            </div>
        </div>
    );
}

UserSettings.ChangeEmailAddress.defaultProps = {
    user: null,
    backUrl: '',
    onUserChanged: (user) => {},
    onErrorSaving: (error) => {},
    onCancelled: () => {}
};

UserSettings.ChangeEmailAddress.propTypes = {
    user: PropTypes.object,
    backUrl: PropTypes.string,
    onUserChanged: PropTypes.func,
    onErrorSaving: PropTypes.func,
    onCancelled: PropTypes.func
};