import React from 'react';
import PropTypes from 'prop-types';
import { UserIcon } from '../../common/contactsImages';

const UPLOAD_IMAGE_WIDTH = 128;
const UPLOAD_IMAGE_HEIGHT = 128;

export default function UploadImage(props)
{
    return (
        <a href="#">
            <UserIcon width={ UPLOAD_IMAGE_WIDTH } height={ UPLOAD_IMAGE_HEIGHT } />
        </a>
    );
}

UploadImage.defaultProps = {

};

UploadImage.propTypes = {

};

