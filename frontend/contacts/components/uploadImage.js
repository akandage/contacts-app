import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Image } from 'react-bootstrap';
import { PencilIcon, UserIcon } from '../../common/contactsImages';

const UPLOAD_IMAGE_WIDTH = 128;
const UPLOAD_IMAGE_HEIGHT = 128;
const EDIT_ICON_WIDTH = 24;
const EDIT_ICON_HEIGHT = 24;

export default function UploadImage(props)
{
    let {
        uploadImageUrl,
        uploadImageKey
    } = props;

    const [ fileList, setFileList ] = useState([]);
    const [ imageUrl, setImageUrl ] = useState(null);
    const [ isUploading, setIsUploading ] = useState(false);

    function uploadImage(file)
    {
        let formData = new FormData();
        try
        {
            formData.append(uploadImageKey, file, file.name);
            onImageUploading();
            fetch(uploadImageUrl, {
                method: 'POST',
                body: formData
            })
                .then(
                    response => {
                        if (response.ok)
                        {
                            let url = response.headers.get('Location');

                            if (url)
                            {
                                onImageUploaded(url);
                            }
                            else
                            {
                                onImageUploadError(`Location header not provided in response.`);
                            }
                        }
                        else
                        {
                            onImageUploadError(`${response.status} ${response.statusText}`);
                        }
                    }
                )
                .catch(
                    error => {
                        onImageUploadError(error);
                    }
                )
            ;
        }
        catch (error)
        {
            onImageUploadError(error);
        }
    }

    function onImageUploading()
    {
        setIsUploading(true);
    }

    function onImageUploaded(url)
    {
        console.log(`Uploaded image: ${url}`);

        setImageUrl(url);
        setIsUploading(false);
    }

    function onImageUploadError(error)
    {
        console.error(`Error uploading image: ${error}`);

        setIsUploading(false);
    }

    function onFileChanged(e)
    {
        let files = e.target.files;

        setFileList(files);
        uploadImage(files[0]);
    }

    return (
        <div className="upload-image">
            <label className="upload-image-edit-button">
                <input type="file" accept="image/x-png,image/jpeg" disabled={ isUploading } files={ fileList } onChange={ onFileChanged } />
                <div>
                    <PencilIcon width={ EDIT_ICON_WIDTH } height={ EDIT_ICON_HEIGHT } />
                </div>
            </label>
            {
                imageUrl !== null ?
                    <Image src={ imageUrl } width="128" height="128" roundedCircle /> :
                    <UserIcon width={ UPLOAD_IMAGE_WIDTH } height={ UPLOAD_IMAGE_HEIGHT } />
            }
        </div>
    );
}

UploadImage.defaultProps = {
    uploadImageUrl: '',
    uploadImageKey: 'image'
};

UploadImage.propTypes = {
    uploadImageUrl: PropTypes.string,
    uploadImageKey: PropTypes.string
};

