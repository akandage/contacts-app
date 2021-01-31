import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Modal } from 'react-bootstrap';

function Dialog(props)
{
    let {
        subjects,
        title,
        bodyText,
        acceptText,
        cancelText,
        centered,
        onAccepted,
        onCancelled
    } = props;

    let [ accepted, setAccepted ] = useState(false);
    let [ showState, setShowState ] = useState(true);

    function onAcceptClicked()
    {
        setAccepted(true);
        setShowState(false);
    }

    function onCancelClicked()
    {
        setAccepted(false);
        setShowState(false);
    }

    function onClose()
    {
        setShowState(false);
    }

    function onClosed()
    {
        if (accepted)
        {
            onAccepted(subjects);
        }
        else
        {
            onCancelled(subjects);
        }
    }

    return (
        <Modal centered={ centered } show={ showState } onHide={ onClose } onExited={ onClosed }>
            <Modal.Header closeButton>
                <Modal.Title>{ title }</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <p>{ bodyText }</p>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="primary" onClick={ onAcceptClicked }>{ acceptText }</Button>
                <Button variant="secondary" onClick={ onCancelClicked }>{ cancelText }</Button>
            </Modal.Footer>
        </Modal> 
    );
}

export default function ConfirmActionDialog(props)
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

ConfirmActionDialog.defaultProps = {
    show: false,
    subjects: [],
    title: '',
    bodyText: '',
    acceptText: 'OK',
    cancelText: 'Cancel',
    centered: false,
    onAccepted: (subjects) => {},
    onCancelled: (subjects) => {}
};

ConfirmActionDialog.propTypes = {
    show: PropTypes.bool,
    subjects: PropTypes.array,
    title: PropTypes.string,
    bodyText: PropTypes.string,
    acceptText: PropTypes.string,
    cancelText: PropTypes.string,
    centered: PropTypes.bool,
    onAccepted: PropTypes.func,
    onCancelled: PropTypes.func
};