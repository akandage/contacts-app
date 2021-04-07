import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import {
    Switch,
    Route,
    Link,
    useHistory,
    useRouteMatch
  } from "react-router-dom";
import PropTypes from 'prop-types';
import queryString from 'query-string';
import CustomTextBox from '../../common/components/customTextbox';
import { STATUS } from '../constants';
import UploadImage from './uploadImage';

const { isPasswordValid } = require('../../../userCredsValid');
const { EmailAddress } = require('../../../emailAddress');
const { PhoneNumber } = require('../../../phoneNumber');

const ACTION_BUTTON_CLASS = 'btn btn-primary btn-block';
const GET_USER_URL = '/api/user';
const CHANGE_EMAIL_ADDRESS_URL = '/api/user/email-address';
const CHANGE_PHONE_NUMBER_URL = '/api/user/phone-number';
const CHANGE_PROFILE_PICTURE_URL = '/api/user/profile-picture';
const CHANGE_PASSWORD_URL = '/api/user/password';
const UPLOAD_IMAGE_URL = '/api/user/profile-picture';

export default function UserSettings(props)
{
    let {
        onUserSettingsChanged
    } = props;
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

                    let u = Object.assign({}, user, {
                        profilePictureUrl: imageUrl
                    });

                    setUser(u);
                    setStatus(STATUS.IDLE);
                    onUserSettingsChanged(u);
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
        onUserSettingsChanged(user);
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
                        <Route path={ `${url}/change-phone-number` }>
                            <UserSettings.ChangePhoneNumber
                                user={ user }
                                backUrl={ url }
                                onUserChanged={ onUserChanged }
                                onErrorSaving={ onErrorSavingUser }
                            />
                        </Route>
                        <Route path={ `${url}/change-password` }>
                            <UserSettings.ChangePassword
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
    onUserSettingsChanged: (user) => {}
};

UserSettings.propTypes = {
    onUserSettingsChanged: PropTypes.func
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

UserSettings.ChangePhoneNumber = function(props)
{
    let {
        user,
        backUrl,
        onUserChanged,
        onErrorSaving,
        onCancelled
    } = props;
    const history = useHistory();
    const [ phoneNumber, setPhoneNumber ] = useState();
    const [ isPhoneNumberDirty, setIsPhoneNumberDirty ] = useState();
    const [ isPhoneNumberValid, setIsPhoneNumberValid ] = useState();
    const [ invalidFeedback, setInvalidFeedback ] = useState();

    useEffect(() => {
        setPhoneNumber(user.phoneNumber);
        setIsPhoneNumberDirty(false);
        setIsPhoneNumberValid(true);
        setInvalidFeedback('');
    }, [ user ]);

    function onPhoneNumberChanged(pn)
    {
        if (pn !== phoneNumber)
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
                    setInvalidFeedback('Phone number is not valid.');
                }
                else
                {
                    setInvalidFeedback('Phone number is required.');
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
        let u = Object.assign({}, user, { phoneNumber });

        try
        {
            let qs = queryString.stringify({ value: phoneNumber });
            let response = await fetch(`${CHANGE_PHONE_NUMBER_URL}?${qs}`, {
                method: 'PUT'
            });

            if (!response.ok)
            {
                let e = await response.json();

                onErrorSaving(`Error saving user phone number: ${response.status} ${response.statusText} ${e.message}`);
                return;
            }
        }
        catch (error)
        {
            onErrorSaving(`Error saving user phone number: ${error}`);
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
        setPhoneNumber(user.phoneNumber);
        setIsPhoneNumberDirty(false);
        setIsPhoneNumberValid(true);
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
        return isPhoneNumberDirty && isPhoneNumberValid;
    }

    function allowCancel()
    {
        return true;
    }

    return (
        <div className="user-settings-form-container">
            <div className="user-settings-form">
                <Form noValidate>
                    <CustomTextBox id="phoneNumber"
                        labelText="Phone Number"
                        value={ phoneNumber }
                        isInvalid={ isPhoneNumberDirty && !isPhoneNumberValid }
                        invalidFeedback={ invalidFeedback }
                        onChanged={ onPhoneNumberChanged }
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

UserSettings.ChangePhoneNumber.defaultProps = {
    user: null,
    backUrl: '',
    onUserChanged: (user) => {},
    onErrorSaving: (error) => {},
    onCancelled: () => {}
};

UserSettings.ChangePhoneNumber.propTypes = {
    user: PropTypes.object,
    backUrl: PropTypes.string,
    onUserChanged: PropTypes.func,
    onErrorSaving: PropTypes.func,
    onCancelled: PropTypes.func
};

UserSettings.ChangePassword = function(props)
{
    let {
        user,
        backUrl,
        onUserChanged,
        onErrorSaving,
        onCancelled
    } = props;
    const history = useHistory();
    const [ oldPassword, setOldPassword ] = useState();
    const [ isOldPasswordDirty, setIsOldPasswordDirty ] = useState();
    const [ isOldPasswordValid, setIsOldPasswordValid ] = useState();
    const [ oldPasswordInvalidFeedback, setOldPasswordInvalidFeedback ] = useState();
    const [ newPassword, setNewPassword ] = useState();
    const [ isNewPasswordDirty, setIsNewPasswordDirty ] = useState();
    const [ isNewPasswordValid, setIsNewPasswordValid ] = useState();
    const [ newPasswordInvalidFeedback, setNewPasswordInvalidFeedback ] = useState();
    const [ newPasswordConfirm, setNewPasswordConfirm ] = useState();
    const [ isNewPasswordConfirmDirty, setIsNewPasswordConfirmDirty ] = useState();
    const [ isNewPasswordConfirmValid, setIsNewPasswordConfirmValid ] = useState();
    const [ newPasswordConfirmInvalidFeedback, setNewPasswordConfirmInvalidFeedback ] = useState();
    const [ saveError, setSaveError ] = useState();

    useEffect(() => {
        reset();
    }, [ user ]);

    function onOldPasswordChanged(p)
    {
        let valid = isPasswordValid(p);

        setOldPassword(p);

        if (!isOldPasswordDirty)
        {
            setIsOldPasswordDirty(true);
        }

        setIsOldPasswordValid(valid);

        if (!valid)
        {
            if (p !== '')
            {
                setOldPasswordInvalidFeedback('Old password is not valid.');
            }
            else
            {
                setOldPasswordInvalidFeedback('Old password is required.');
            }
        }
        else
        {
            setOldPasswordInvalidFeedback('');
        }
    }

    function onNewPasswordChanged(p)
    {
        let valid = isPasswordValid(p);

        setNewPassword(p);

        if (!isNewPasswordDirty)
        {
            setIsNewPasswordDirty(true);
        }

        setIsNewPasswordValid(valid);

        if (!valid)
        {
            if (p !== '')
            {
                setNewPasswordInvalidFeedback('New password is not valid.');
            }
            else
            {
                setNewPasswordInvalidFeedback('New password is required.');
            }
        }
        else
        {
            setNewPasswordInvalidFeedback('');
        }
    }

    function onNewPasswordConfirmChanged(p)
    {
        let valid = isPasswordValid(p);

        setNewPasswordConfirm(p);

        if (!isNewPasswordConfirmDirty)
        {
            setIsNewPasswordConfirmDirty(true);
        }

        setIsNewPasswordConfirmValid(valid);

        if (!valid)
        {
            if (p !== '')
            {
                setNewPasswordConfirmInvalidFeedback('Confirm new password is not valid.');
            }
            else
            {
                setNewPasswordConfirmInvalidFeedback('Confirm new password is required.');
            }
        }
        else if (isNewPasswordValid && newPassword !== p)
        {
            setNewPasswordConfirmInvalidFeedback('Passwords do not match.');
            setIsNewPasswordConfirmValid(false);
        }
        else
        {
            setNewPasswordConfirmInvalidFeedback('');
        }
    }

    async function saveChanges()
    {
        setSaveError(null);

        try
        {
            let qs = queryString.stringify({ oldPassword, newPassword });
            let response = await fetch(`${CHANGE_PASSWORD_URL}?${qs}`, {
                method: 'PUT'
            });

            if (!response.ok)
            {
                if (response.status === 409)
                {
                    setSaveError('Old password provided does not match.');
                    setIsOldPasswordValid(false);
                    setOldPasswordInvalidFeedback('');
                }
                else
                {
                    let e = await response.json();

                    onErrorSaving(`Error saving user phone number: ${response.status} ${response.statusText} ${e.message}`);
                }
                
                return;
            }
        }
        catch (error)
        {
            onErrorSaving(`Error saving user phone number: ${error}`);
            return;
        }

        return user;
    }

    async function onSaveClicked()
    {
        let user = await saveChanges();

        if (saveError !== null)
        {
            hide();
        }

        if (user)
        {
            onUserChanged(user);
        }
    }

    function reset()
    {
        setOldPassword('');
        setIsOldPasswordDirty(false);
        setIsOldPasswordValid(false);
        setOldPasswordInvalidFeedback('');
        setNewPassword('');
        setIsNewPasswordDirty(false);
        setIsNewPasswordValid(false);
        setNewPasswordConfirmInvalidFeedback('');
        setNewPasswordConfirm('');
        setIsNewPasswordConfirmDirty(false);
        setIsNewPasswordConfirmValid(false);
        setNewPasswordConfirmInvalidFeedback('');
        setSaveError(null);
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
        return isOldPasswordValid && isNewPasswordValid && isNewPasswordConfirmValid &&
                newPassword === newPasswordConfirm;
    }

    function allowCancel()
    {
        return true;
    }

    return (
        <div className="user-settings-form-container">
            <div className="user-settings-form">
                {
                    saveError ?
                        <Alert variant="danger">{ saveError }</Alert> :
                        <></>
                }

                <Form noValidate>
                    <CustomTextBox id="oldPassword"
                        labelText="Old Password"
                        inputType="password"
                        value={ oldPassword }
                        isInvalid={ isOldPasswordDirty && !isOldPasswordValid }
                        invalidFeedback={ oldPasswordInvalidFeedback }
                        onChanged={ onOldPasswordChanged }
                        onBlur={ () => onOldPasswordChanged(oldPassword) }
                    />
                </Form>

                <Form noValidate>
                    <CustomTextBox id="newPassword"
                        labelText="New Password"
                        inputType="password"
                        value={ newPassword }
                        isInvalid={ isNewPasswordDirty && !isNewPasswordValid }
                        invalidFeedback={ newPasswordInvalidFeedback }
                        onChanged={ onNewPasswordChanged }
                        onBlur={ () => onNewPasswordChanged(newPassword) }
                    />
                </Form>

                <Form noValidate>
                    <CustomTextBox id="newPasswordConfirm"
                        labelText="Confirm New Password"
                        inputType="password"
                        value={ newPasswordConfirm }
                        isInvalid={ isNewPasswordConfirmDirty && !isNewPasswordConfirmValid }
                        invalidFeedback={ newPasswordConfirmInvalidFeedback }
                        onChanged={ onNewPasswordConfirmChanged }
                        onBlur={ () => onNewPasswordConfirmChanged(newPasswordConfirm) }
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

UserSettings.ChangePassword.defaultProps = {
    user: null,
    backUrl: '',
    onUserChanged: (user) => {},
    onErrorSaving: (error) => {},
    onCancelled: () => {}
};

UserSettings.ChangePassword.propTypes = {
    user: PropTypes.object,
    backUrl: PropTypes.string,
    onUserChanged: PropTypes.func,
    onErrorSaving: PropTypes.func,
    onCancelled: PropTypes.func
};