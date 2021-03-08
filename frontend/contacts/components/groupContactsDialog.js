import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';
import { GROUP_NAME_REGEX } from '../constants';
import ConfirmActionDialog from './confirmActionDialog';
import CustomTextBox from './customTextbox';

function Dialog(props)
{
    let {
        show,
        centered,
        title,
        acceptText,
        cancelText,
        contacts,
        onSaved,
        onCancelled
    } = props;

    const [ groupName, setGroupName ] = useState('');
    const [ groupNameDirty, setGroupNameDirty ] = useState(false);
    const [ saved, setSaved ] = useState(false);
    const [ showState, setShowState ] = useState(true);

    function onGroupNameChanged(name)
    {
        setGroupName(name);
        
        if (!groupNameDirty)
        {
            setGroupNameDirty(true);
        }
    }

    function onGroupNameBlur()
    {
        if (!groupNameDirty)
        {
            setGroupNameDirty(true);
        }
    }

    function isGroupNameValid()
    {
        return groupName !== '' && GROUP_NAME_REGEX.test(groupName);
    }

    function getGroupNameInvalidFeedback()
    {
        return groupName !== '' ? 
            'Group name is invalid. Must begin with a capital letter.' :
            'Group name is required.';
    }

    function onSaveClicked()
    {
        setSaved(true);
        setShowState(false);
    }

    function onCancelClicked()
    {
        setSaved(false);
        setShowState(false);
    }

    function onClose()
    {
        setShowState(false);
    }

    function onClosed()
    {
        if (saved)
        {
            onSaved({
                name: groupName,
                contacts
            });
        }
        else
        {
            onCancelled();
        }
    }

    return (
        <Modal centered={ centered } show={ showState } onHide={ onClose } onExited={ onClosed }>
            <Modal.Header closeButton>
                <Modal.Title>{ title }</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <CustomTextBox
                    id="groupName"
                    labelText="Name"
                    value={ groupName }
                    onChanged={ onGroupNameChanged }
                    onBlur={ onGroupNameBlur }
                    isInvalid={ groupNameDirty && !isGroupNameValid() }
                    invalidFeedback={ getGroupNameInvalidFeedback() }

                >
                </CustomTextBox>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" disabled={ !isGroupNameValid() } onClick={ onSaveClicked }>{ acceptText }</Button>
                <Button variant="secondary" onClick={ onCancelClicked }>{ cancelText }</Button>
            </Modal.Footer>
        </Modal> 
    );
}

export default function GroupContactsDialog(props)
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

GroupContactsDialog.defaultProps = {
    show: false,
    centered: true,
    title: 'Add Group',
    acceptText: 'OK',
    cancelText: 'Cancel'
};

GroupContactsDialog.propTypes = {
    show: PropTypes.bool,
    centered: PropTypes.bool,
    title: PropTypes.string,
    acceptText: PropTypes.string,
    cancelText: PropTypes.string,
    contacts: PropTypes.array.isRequired,
    onSaved: PropTypes.func,
    onCancelled: PropTypes.func
};