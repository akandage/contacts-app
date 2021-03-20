import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Form, Modal, Tabs, Tab } from 'react-bootstrap';
import { EMAIL_ADDRESS_TYPES, NAME_REGEX, PHONE_NUMBER_TYPES } from '../constants';
import CustomSelect from './customSelect';
import CustomTextBox, { AddButton, RemoveButton } from './customTextbox';
import UploadImage from './uploadImage';

const { EmailAddress } = require('../../../emailAddress');
const { PhoneNumber } = require('../../../phoneNumber');

export const CONTACT_DIALOG_MODE = {
    ADD_CONTACT: 'ADD_CONTACT',
    EDIT_CONTACT: 'EDIT_CONTACT',
    VIEW_CONTACT: 'VIEW_CONTACT'
};

const UPLOAD_IMAGE_URL = '/api/contacts/profile-picture';

function Dialog(props)
{
    let {
        mode,
        contact,
        isFavorite,
        size,
        centered,
        onSaved,
        onCancelled
    } = props;
    let title = getTitle();
    const [ activeTab, setActiveTab ] = useState('contactTab');
    const [ firstName, setFirstName ] = useState(getInitialValue('firstName'));
    const [ middleName, setMiddleName ] = useState(getInitialValue('middleName'));
    const [ middleNames, setMiddleNames ] = useState(getInitialValue('middleNames'));
    const [ middleNamesDirty, setMiddleNamesDirty ] = useState(false);
    const [ lastName, setLastName ] = useState(getInitialValue('lastName'));
    const [ phoneNumber, setPhoneNumber ] = useState(getInitialValue('phoneNumber'));
    const [ phoneNumbers, setPhoneNumbers ] = useState(getInitialValue('phoneNumbers'));
    const [ phoneNumbersDirty, setPhoneNumbersDirty ] = useState(false);
    const [ emailAddress, setEmailAddress ] = useState(getInitialValue('emailAddress'));
    const [ emailAddresses, setEmailAddresses ] = useState(getInitialValue('emailAddresses'));
    const [ emailAddressesDirty, setEmailAddressesDirty ] = useState(false);
    const [ profilePictureUrl, setProfilePictureUrl ] = useState(getInitialValue('profilePictureUrl'));
    const [ isUploadingProfilePicture, setIsUploadingProfilePicture ] = useState(false);
    const [ dirtyState, setDirtyState ] = useState(getInitialValue('dirtyState'));
    const [ validState, setValidState ] = useState(getInitialValue('validState'));
    const [ showState, setShowState ] = useState(true);
    const [ saveClicked, setSaveClicked ] = useState(false);

    function getTitle()
    {
        if (mode === CONTACT_DIALOG_MODE.ADD_CONTACT)
        {
            return 'Add Contact';
        }
        else if (mode === CONTACT_DIALOG_MODE.EDIT_CONTACT)
        {
            return 'Edit Contact';
        }

        return 'Contact';
    }

    function getInitialValue(key)
    {
        // Ensure deep copies are made where necessary.

        if (key === 'firstName')
        {
            return mode === CONTACT_DIALOG_MODE.ADD_CONTACT ? 
                '' :
                contact.firstName;
        }
        else if (key === 'middleName')
        {
            return '';
        }
        else if (key === 'middleNames')
        {
            return mode === CONTACT_DIALOG_MODE.ADD_CONTACT ?
                [] :
                contact.middleNames.slice();
        }
        else if (key === 'lastName')
        {
            return mode === CONTACT_DIALOG_MODE.ADD_CONTACT ?
                '' :
                contact.lastName;
        }
        else if (key === 'phoneNumber')
        {
            return {
                phoneNumber: '',
                type: PHONE_NUMBER_TYPES[0]
            };
        }
        else if (key === 'phoneNumbers')
        {
            return mode === CONTACT_DIALOG_MODE.ADD_CONTACT ?
                [] :
                contact.phoneNumbers.map(phoneNumber => Object.assign({}, phoneNumber));
        }
        else if (key === 'emailAddress')
        {
            return {
                emailAddress: '',
                type: EMAIL_ADDRESS_TYPES[0]
            };
        }
        else if (key === 'emailAddresses')
        {
            return mode === CONTACT_DIALOG_MODE.ADD_CONTACT ?
                [] :
                contact.emailAddresses.map(emailAddress => Object.assign({}, emailAddress));
        }
        else if (key === 'profilePictureUrl')
        {
            return mode === CONTACT_DIALOG_MODE.ADD_CONTACT ?
                null :
                contact.profilePictureUrl
        }
        else if (key === 'dirtyState')
        {
            return getInitialDirtyState();
        }
        else if (key === 'validState')
        {
            return getInitialValidState();
        }

        throw new Error();
    }

    function getInitialDirtyState()
    {
        return {
            firstName: false,
            middleNames: mode === CONTACT_DIALOG_MODE.ADD_CONTACT ? [] : contact.middleNames.map(middleName => false),
            middleName: false,
            lastName: false,
            emailAddress: false,
            emailAddresses: mode === CONTACT_DIALOG_MODE.ADD_CONTACT ? [] : contact.emailAddresses.map(emailAddress => false),
            phoneNumber: false,
            phoneNumbers: mode === CONTACT_DIALOG_MODE.ADD_CONTACT ? [] : contact.phoneNumbers.map(phoneNumber => false),
            profilePictureUrl: false
        };
    }

    function getInitialValidState()
    {
        return {
            firstName: validateName(firstName, 'First Name'),
            middleNames: middleNames.map(middleName => validateName(middleName, 'Middle Name')),
            middleName: {
                isValid: false,
                invalidFeedback: null
            },
            lastName: validateName(lastName, 'Last Name'),
            emailAddress: {
                isValid: false,
                invalidFeedback: null
            },
            emailAddresses: emailAddresses.map(emailAddress => validateEmailAddress(emailAddress.emailAddress)),
            phoneNumber: {
                isValid: false,
                invalidFeedback: null
            },
            phoneNumbers: phoneNumbers.map(phoneNumber => validatePhoneNumber(phoneNumber.phoneNumber))
        };
    }

    function getContact()
    {
        let c = {
            firstName,
            middleNames,
            lastName,
            emailAddresses,
            phoneNumbers,
            favorite: isFavorite,
            profilePictureUrl
        };

        if (mode === CONTACT_DIALOG_MODE.EDIT_CONTACT)
        {
            c._id = contact._id;
            c.favorite = contact.favorite;
        }

        return c;
    }

    function DialogFooter()
    {
        return (
            mode === CONTACT_DIALOG_MODE.ADD_CONTACT || mode === CONTACT_DIALOG_MODE.EDIT_CONTACT ?
                <Modal.Footer>
                    <Button variant="primary" onClick={ onSaveClicked } disabled={ !allowSave() }>Save</Button>
                    <Button variant="secondary" onClick={ hide } disabled={ !allowHide() }>Cancel</Button>
                </Modal.Footer> :
                <Modal.Footer />
        );
    }

    function onTabSelected(eventKey)
    {
        if (eventKey !== activeTab)
        {
            setActiveTab(eventKey);
        }
    }

    function validateName(name, nameType)
    {
        if (name === null || name === undefined || name.length === 0)
        {
            return {
                isValid: false,
                invalidFeedback: `${nameType} is required.`
            };
        }

        return {
            isValid: NAME_REGEX.test(name),
            invalidFeedback: `${nameType} is invalid. Must start with a capital letter and only contain letters, dashes and apostrophes.`
        };
    }

    function onFirstNameChanged(value)
    {
        setFirstName(value);
        setDirtyState(Object.assign({}, dirtyState, { firstName: true }));
        setValidState(Object.assign({}, validState, { firstName: validateName(value, 'First Name') }));
    }

    function onMiddleNameChanged(value, index = null)
    {
        let valid = validateName(value, 'Middle Name');

        if (index !== null)
        {
            let m = middleNames.slice();
            let d = dirtyState.middleNames.slice();
            let v = validState.middleNames.slice();

            m[index] = value;
            d[index] = true;
            v[index] = valid;

            setMiddleNames(m);
            setDirtyState(Object.assign({}, dirtyState, { middleNames: d }));
            setValidState(Object.assign({}, validState, { middleNames: v }));
        }
        else
        {
            setMiddleName(value);
            setDirtyState(Object.assign({}, dirtyState, { middleName: true }));
            setValidState(Object.assign({}, validState, { middleName: valid }));
        }
    }

    function onAddMiddleNameClicked()
    {
        if (validState.middleName.isValid)
        {
            let m = middleNames.slice();
            let d = dirtyState.middleNames.slice();
            let v = validState.middleNames.slice();

            m.push(middleName);
            d.push(false);
            v.push({
                isValid: true,
                invalidFeedback: null
            });

            if (!middleNamesDirty)
            {
                setMiddleNamesDirty(true);
            }

            setMiddleNames(m);
            setMiddleName('');
            setDirtyState(Object.assign({}, dirtyState, {
                middleName: false,
                middleNames: d
            }));
            setValidState(Object.assign({}, validState, {
                middleName: {
                    isValid: false,
                    invalidFeedback: null
                },
                middleNames: v
            }));
        }
    }

    function onRemoveMiddleNameClicked(index)
    {
        let m = middleNames.filter((middleName, i) => i !== index);
        let d = dirtyState.middleNames.filter((isDirty, i) => i !== index);
        let v = validState.middleNames.filter((valid, i) => i !== index);

        if (!middleNamesDirty)
        {
            setMiddleNamesDirty(true);
        }

        setMiddleNames(m);
        setDirtyState(Object.assign({}, dirtyState, { middleNames: d }));
        setValidState(Object.assign({}, validState, { middleNames: v }));
    }

    function onLastNameChanged(value, isValid)
    {
        setLastName(value);
        setDirtyState(Object.assign({}, dirtyState, { lastName: true }));
        setValidState(Object.assign({}, validState, { lastName: validateName(value, 'Last Name') }));
    }

    function validatePhoneNumber(phoneNumber)
    {
        if (phoneNumber === null || phoneNumber === undefined || phoneNumber.length === 0)
        {
            return {
                isValid: false,
                invalidFeedback: `Phone number is required.`
            };
        }

        return {
            isValid: PhoneNumber.isValidUSAOrCanada(phoneNumber),
            invalidFeedback: `Phone number is invalid.`
        };
    }

    function onPhoneNumberChanged(value, index = null)
    {
        let valid = validatePhoneNumber(value);

        if (index !== null)
        {
            let p = phoneNumbers.slice();
            let d = dirtyState.phoneNumbers.slice();
            let v = validState.phoneNumbers.slice();

            p[index] = Object.assign({}, phoneNumbers[index], { phoneNumber: value });
            d[index] = true;
            v[index] = valid;

            setPhoneNumbers(p);
            setDirtyState(Object.assign({}, dirtyState, { phoneNumbers: d }));
            setValidState(Object.assign({}, validState, { phoneNumbers: v }));
        }
        else
        {
            setPhoneNumber(Object.assign({}, phoneNumber, { phoneNumber: value }));
            setDirtyState(Object.assign({}, dirtyState, { phoneNumber: true }));
            setValidState(Object.assign({}, validState, { phoneNumber: valid }));
        }
    }

    function onPhoneNumberTypeChanged(value, index = null)
    {
        if (index !== null)
        {
            let p = phoneNumbers.slice();
            let d = dirtyState.phoneNumbers.slice();

            p[index] = Object.assign({}, phoneNumbers[index], { type: value });
            d[index] = true;

            setPhoneNumbers(p);
            setDirtyState(Object.assign({}, dirtyState, { phoneNumbers: d }));
        }
        else
        {
            setPhoneNumber(Object.assign({}, phoneNumber, { type: value }));
            setDirtyState(Object.assign({}, dirtyState, { phoneNumber: true }));
        }
    }

    function onAddPhoneNumberClicked()
    {
        if (validState.phoneNumber.isValid)
        {
            let p = phoneNumbers.slice();
            let d = dirtyState.phoneNumbers.slice();
            let v = validState.phoneNumbers.slice();

            p.push(phoneNumber);
            d.push(false);
            v.push({
                isValid: true,
                invalidFeedback: null
            });

            if (!phoneNumbersDirty)
            {
                setPhoneNumbersDirty(true);
            }

            setPhoneNumbers(p);
            setPhoneNumber({
                phoneNumber: '',
                type: PHONE_NUMBER_TYPES[0]
            });
            setDirtyState(Object.assign({}, dirtyState, {
                phoneNumber: false,
                phoneNumbers: d
            }));
            setValidState(Object.assign({}, validState, {
                phoneNumber: {
                    isValid: false,
                    invalidFeedback: null
                },
                phoneNumbers: v
            }));
        }
    }

    function onRemovePhoneNumberClicked(index)
    {
        let p = phoneNumbers.filter((phoneNumber, i) => i !== index);
        let d = dirtyState.phoneNumbers.filter((isDirty, i) => i !== index);
        let v = validState.phoneNumbers.filter((valid, i) => i !== index);

        if (!phoneNumbersDirty)
        {
            setPhoneNumbersDirty(true);
        }

        setPhoneNumbers(p);
        setDirtyState(Object.assign({}, dirtyState, { phoneNumbers: d }));
        setValidState(Object.assign({}, validState, { phoneNumbers: v }));
    }

    function validateEmailAddress(emailAddress)
    {
        if (emailAddress === null || emailAddress === undefined || emailAddress.length === 0)
        {
            return {
                isValid: false,
                invalidFeedback: `Email address is required.`
            };
        }

        return {
            isValid: EmailAddress.isValid(emailAddress),
            invalidFeedback: `Email address is invalid.`
        };
    }

    function onEmailAddressChanged(value, index = null)
    {
        let valid = validateEmailAddress(value);

        if (index !== null)
        {
            let e = emailAddresses.slice();
            let d = dirtyState.emailAddresses.slice();
            let v = validState.emailAddresses.slice();

            e[index] = Object.assign({}, emailAddresses[index], { emailAddress: value });
            d[index] = true;
            v[index] = valid;

            setEmailAddresses(e);
            setDirtyState(Object.assign({}, dirtyState, { emailAddresses: d }));
            setValidState(Object.assign({}, validState, { emailAddresses: v }));
        }
        else
        {
            setEmailAddress(Object.assign({}, emailAddress, { emailAddress: value }));
            setDirtyState(Object.assign({}, dirtyState, { emailAddress: true }));
            setValidState(Object.assign({}, validState, { emailAddress: valid }));
        }
    }

    function onEmailAddressTypeChanged(value, index = null)
    {
        if (index !== null)
        {
            let e = emailAddresses.slice();
            let d = dirtyState.emailAddresses.slice();

            e[index] = Object.assign({}, emailAddresses[index], { type: value });
            d[index] = true;

            setEmailAddresses(e);
            setDirtyState(Object.assign({}, dirtyState, { emailAddresses: d }));
        }
        else
        {
            setEmailAddress(Object.assign({}, emailAddress, { type: value }));
            setDirtyState(Object.assign({}, dirtyState, { emailAddress: true }));
        }
    }

    function onAddEmailAddressClicked()
    {
        if (validState.emailAddress.isValid)
        {
            let e = emailAddresses.slice();
            let d = dirtyState.emailAddresses.slice();
            let v = validState.emailAddresses.slice();

            e.push(emailAddress);
            d.push(false);
            v.push({
                isValid: true,
                invalidFeedback: null
            });

            if (!emailAddressesDirty)
            {
                setEmailAddressesDirty(true);
            }

            setEmailAddresses(e);
            setEmailAddress({
                emailAddress: '',
                type: EMAIL_ADDRESS_TYPES[0]
            });
            setDirtyState(Object.assign({}, dirtyState, {
                emailAddress: false,
                emailAddresses: d
            }));
            setValidState(Object.assign({}, validState, {
                emailAddress: {
                    isValid: false,
                    invalidFeedback: null
                },
                emailAddresses: v
            }));
        }
    }

    function onRemoveEmailAddressClicked(index)
    {
        let e = emailAddresses.filter((phoneNumber, i) => i !== index);
        let d = dirtyState.emailAddresses.filter((isDirty, i) => i !== index);
        let v = validState.emailAddresses.filter((valid, i) => i !== index);

        if (!emailAddressesDirty)
        {
            setEmailAddressesDirty(true);
        }

        setEmailAddresses(e);
        setDirtyState(Object.assign({}, dirtyState, { emailAddresses: d }));
        setValidState(Object.assign({}, validState, { emailAddresses: v }));
    }

    function onProfilePictureUploading()
    {
        setIsUploadingProfilePicture(true);
    }

    async function deleteProfilePicture(imageUrl)
    {
        if (imageUrl !== null)
        {
            try
            {
                let imageUrlParts = imageUrl.split('/');
                let fileUuid = imageUrlParts[imageUrlParts.length - 1];

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

    async function onProfilePictureUploaded(imageUrl)
    {
        if (mode === CONTACT_DIALOG_MODE.ADD_CONTACT || profilePictureUrl !== getInitialValue('profilePictureUrl'))
        {
            // When a new profile picture is uploaded, we need to cleanup the previous one.
            await deleteProfilePicture(profilePictureUrl);
        }

        setProfilePictureUrl(imageUrl);
        setDirtyState(Object.assign({}, dirtyState, {
            profilePictureUrl: true
        }));
        setIsUploadingProfilePicture(false);
    }

    function onProfilePictureUploadError(error)
    {
        console.log(error);
        setIsUploadingProfilePicture(false);
    }

    function isDirty()
    {
        return dirtyState.firstName ||
            dirtyState.middleNames.some(dirty => dirty) ||
            middleNamesDirty ||
            dirtyState.lastName ||
            dirtyState.phoneNumbers.some(dirty => dirty) ||
            phoneNumbersDirty ||
            dirtyState.emailAddresses.some(dirty => dirty) ||
            emailAddressesDirty ||
            dirtyState.profilePictureUrl;
    }

    function isAllValid()
    {
        if (!validState.firstName.isValid)
        {
            return false;
        }

        if (!validState.middleNames.every(valid => valid.isValid))
        {
            return false;
        }

        if (!validState.lastName.isValid)
        {
            return false;
        }

        if (!validState.phoneNumbers.every(valid => valid.isValid))
        {
            return false;
        }

        if (!validState.emailAddresses.every(valid => valid.isValid))
        {
            return false;
        }

        return true;
    }

    function allowHide()
    {
        return !isUploadingProfilePicture;
    }

    function allowSave()
    {
        if (mode === CONTACT_DIALOG_MODE.ADD_CONTACT)
        {
            return isAllValid() && !isUploadingProfilePicture;
        }
        else if (mode === CONTACT_DIALOG_MODE.EDIT_CONTACT)
        {
            return isDirty() && isAllValid() && !isUploadingProfilePicture;
        }
    }

    function hide()
    {
        if (allowHide())
        {
            setShowState(false);
        }
    }

    function onSaveClicked()
    {
        setSaveClicked(true);
        hide();
    }

    async function onClosed()
    {
        if (saveClicked)
        {
            // In edit mode, if the profile picture is changed we need to cleanup the previous one.
            if (mode === CONTACT_DIALOG_MODE.EDIT_CONTACT && dirtyState.profilePictureUrl)
            {
                await deleteProfilePicture(getInitialValue('profilePictureUrl'));
            }

            onSaved(getContact());
        }
        else
        {
            // If add/edit is cancelled and a new profile picture is uploaded, then clean it up.
            if (dirtyState.profilePictureUrl)
            {
                await deleteProfilePicture(profilePictureUrl);
            }

            onCancelled();
        }
    }

    // Note: The tabs and tabpages were previously separated out into separate functions.
    // However, this caused the tabpage to be clobbered by React upon any state change.
    // TODO: Investigate this in future so this may be cleaned up.
    return (
        <Modal size={ size } centered={ centered } show={ showState } onHide={ hide } onExited={ onClosed } scrollable>
            <Modal.Header closeButton>
                <Modal.Title>
                    { title }
                </Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <Tabs id="contact-dialog-tabs" activeKey={ activeTab } onSelect={ onTabSelected }>
                    <Tab eventKey="contactTab" title="Contact">
                        <div className="contact-dialog-tab">
                            <UploadImage 
                                initialImageUrl={ profilePictureUrl }
                                uploadImageUrl={ UPLOAD_IMAGE_URL }
                                onImageUploading={ onProfilePictureUploading }
                                onImageUploaded={ onProfilePictureUploaded }
                                onImageUploadError={ onProfilePictureUploadError }
                            />
                            
                            <div className="contact-dialog-form">
                                <Form noValidate>
                                    <CustomTextBox id="firstName"
                                        labelText="First Name"
                                        value={ firstName }
                                        isInvalid={ dirtyState.firstName && !validState.firstName.isValid }
                                        invalidFeedback={ validState.firstName.invalidFeedback }
                                        onChanged={ onFirstNameChanged }
                                    >
                                    </CustomTextBox>
                                    
                                    {
                                        middleNames.map(
                                            (middleName, index) =>
                                                <CustomTextBox id={ `middleName-${index+1}` }
                                                    key={ index }
                                                    labelText="Middle Name"
                                                    value={ middleName }
                                                    isInvalid={ dirtyState.middleNames[index] && !validState.middleNames[index].isValid }
                                                    invalidFeedback={ validState.middleNames[index].invalidFeedback }
                                                    onChanged={ (value) => onMiddleNameChanged(value, index) }
                                                >
                                                    <RemoveButton 
                                                        onClick={ () => onRemoveMiddleNameClicked(index) }
                                                    />
                                                </CustomTextBox>
                                        )
                                    }

                                    <CustomTextBox id="middleName"
                                        labelText="Middle Name"
                                        value={ middleName }
                                        isInvalid={ dirtyState.middleName && !validState.middleName.isValid }
                                        invalidFeedback={ validState.middleName.invalidFeedback }
                                        onChanged={ onMiddleNameChanged }
                                    >
                                        <AddButton 
                                            onClick={ onAddMiddleNameClicked }
                                            disabled={ !validState.middleName.isValid }
                                        />
                                    </CustomTextBox>

                                    <CustomTextBox id="lastName"
                                        labelText="Last Name"
                                        value={ lastName }
                                        isInvalid={ dirtyState.lastName && !validState.lastName.isValid }
                                        invalidFeedback={ validState.lastName.invalidFeedback }
                                        onChanged={ onLastNameChanged }
                                    >
                                    </CustomTextBox>
                                </Form>
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey="phoneNumberTab" title="Phone Numbers">
                        <div className="contact-dialog-tab">
                            <div className="contact-dialog-form">
                                <Form noValidate>
                                    <div className="contact-dialog-sticky">
                                        <CustomTextBox id="phoneNumber"
                                            labelText="Phone Number"
                                            value={ phoneNumber.phoneNumber }
                                            isInvalid={ dirtyState.phoneNumber && !validState.phoneNumber.isValid }
                                            invalidFeedback={ validState.phoneNumber.invalidFeedback }
                                            onChanged={ onPhoneNumberChanged }
                                        >
                                            <CustomSelect
                                                options={ PHONE_NUMBER_TYPES }
                                                value={ phoneNumber.type }
                                                onChanged={ onPhoneNumberTypeChanged }
                                            />

                                            <AddButton 
                                                onClick={ onAddPhoneNumberClicked }
                                                disabled={ !validState.phoneNumber.isValid }
                                            />
                                        </CustomTextBox>
                                    </div>

                                    {
                                        phoneNumbers.map((phoneNumber, index) =>
                                            <CustomTextBox id={ `phoneNumber-${index+1}` }
                                                key={ index }
                                                labelText="Phone Number"
                                                value={ phoneNumber.phoneNumber }
                                                isInvalid={ dirtyState.phoneNumbers[index] && !validState.phoneNumbers[index].isValid }
                                                invalidFeedback={ validState.phoneNumbers[index].invalidFeedback }
                                                onChanged={ (value) => onPhoneNumberChanged(value, index) }
                                            >
                                                <CustomSelect
                                                    options={ PHONE_NUMBER_TYPES }
                                                    value={ phoneNumber.type }
                                                    onChanged={ (value) => onPhoneNumberTypeChanged(value, index) }
                                                />
                                            
                                                <RemoveButton 
                                                    onClick={ () => onRemovePhoneNumberClicked(index) }
                                                />
                                            </CustomTextBox>
                                        )
                                    }
                                </Form>
                            </div>
                        </div>
                    </Tab>
                    <Tab eventKey="contact" title="Email Addresses">
                        <div className="contact-dialog-tab">
                            <div className="contact-dialog-form">
                                <Form noValidate>
                                    <div className="contact-dialog-sticky">
                                        <CustomTextBox id="emailAddress"
                                            labelText="Email Address"
                                            value={ emailAddress.emailAddress }
                                            isInvalid={ dirtyState.emailAddress && !validState.emailAddress.isValid }
                                            invalidFeedback={ validState.emailAddress.invalidFeedback }
                                            onChanged={ onEmailAddressChanged }
                                        >
                                            <CustomSelect
                                                options={ EMAIL_ADDRESS_TYPES }
                                                value={ emailAddress.type }
                                                onChanged={ onEmailAddressTypeChanged }
                                            />
                                            
                                            <AddButton 
                                                onClick={ onAddEmailAddressClicked }
                                                disabled={ !validState.emailAddress.isValid }
                                            />
                                        </CustomTextBox>
                                    </div>

                                    {
                                        emailAddresses.map((emailAddress, index) =>
                                            <CustomTextBox id={ `emailAddress-${index+1}` }
                                                key={ index }
                                                labelText="Email Address"
                                                value={ emailAddress.emailAddress }
                                                isInvalid={ dirtyState.emailAddresses[index] && !validState.emailAddresses[index].isValid }
                                                invalidFeedback={ validState.emailAddresses[index].invalidFeedback }
                                                onChanged={ (value) => onEmailAddressChanged(value, index) }
                                            >
                                                <CustomSelect
                                                    options={ EMAIL_ADDRESS_TYPES }
                                                    value={ emailAddress.type }
                                                    onChanged={ (value) => onEmailAddressTypeChanged(value, index) }
                                                />
                                            
                                                <RemoveButton 
                                                    onClick={ () => onRemoveEmailAddressClicked(index) }
                                                />
                                            </CustomTextBox>
                                        )
                                    }
                                </Form>
                            </div>
                        </div>
                    </Tab>
                </Tabs>
            </Modal.Body>

            <DialogFooter />
        </Modal> 
    );
}

export default function ContactDialog(props)
{
    let {
        show
    } = props;

    return (
        show ?
            <Dialog {...props} /> :
            <></>
    );
}

ContactDialog.defaultProps = {
    show: false,
    mode: CONTACT_DIALOG_MODE.ADD_CONTACT,
    contact: null,
    isFavorite: false,
    size: 'xl',
    centered: true,
    onSaved: (contact) => {},
    onCancelled: () => {}
};

ContactDialog.propTypes = {
    show: PropTypes.bool,
    mode: PropTypes.string,
    contact: PropTypes.object,
    isFavorite: PropTypes.bool,
    size: PropTypes.string,
    centered: PropTypes.bool,
    onSaved: PropTypes.func,
    onCancelled: PropTypes.func
};