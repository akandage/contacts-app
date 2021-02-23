import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';
import ConfirmActionDialog from './confirmActionDialog';
import CustomTextBox from './customTextbox';

export default function AddGroupDialog(props)
{
    let {
        show,
        centered,
        contacts,
        onSaved,
        onCancelled
    } = props;

    const [ groupName, setGroupName ] = useState('');
    const [ groupNameDirty, setGroupNameDirty ] = useState(false);

    function onGroupNameChanged(name)
    {
        setGroupName(name);
        
        if (!groupNameDirty)
        {
            setGroupNameDirty(true);
        }
    }

    function onAccepted()
    {
        onSaved({
            name: groupName,
            contacts
        });
    }

    return (
        <ConfirmActionDialog show={ show } centered={ centered }
            title="Add Group"
            body={
                <CustomTextBox
                    id="groupName"
                    labelText="Name"
                    value={ groupName }
                    onChanged={ onGroupNameChanged }
                    isInvalid={ groupNameDirty && groupName === '' }
                    invalidFeedback="Group name is required."

                >
                </CustomTextBox>
            }
            allowAccept={ groupName !== '' }
            onAccepted={ onAccepted }
            onCancelled={ onCancelled }
        >
        </ConfirmActionDialog>
    );
}

AddGroupDialog.defaultProps = {
    show: false,
    centered: true
};

AddGroupDialog.propTypes = {
    show: PropTypes.bool,
    centered: PropTypes.bool,
    contacts: PropTypes.array.isRequired,
    onSaved: PropTypes.func,
    onCancelled: PropTypes.func
};