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
        initialImageUrl,
        uploadImageUrl,
        uploadImageKey,
        onImageUploading,
        onImageUploaded,
        onImageUploadError
    } = props;

    const [ fileList, setFileList ] = useState([]);
    const [ imageUrl, setImageUrl ] = useState(initialImageUrl);
    const [ isUploading, setIsUploading ] = useState(false);

    function uploadImage(file)
    {
        let formData = new FormData();
        try
        {
            formData.append(uploadImageKey, file, file.name);

            onImageUploading();
            setIsUploading(true);

            fetch(uploadImageUrl, {
                method: 'POST',
                body: formData
            })
                .then(
                    response => {
                        if (response.ok)
                        {
                            let imageUrl = response.headers.get('Location');

                            if (imageUrl)
                            {
                                console.log(`Uploaded image: ${imageUrl}`);

                                setImageUrl(imageUrl);
                                setIsUploading(false);
                                onImageUploaded(imageUrl);
                            }
                            else
                            {
                                let error = new Error(`Location header not provided in response.`);

                                console.error(error.message);
                                setIsUploading(false);
                                onImageUploadError(error);
                            }
                        }
                        else
                        {
                            let error = new Error(`Error uploading image: ${response.status} ${response.statusText}`);

                            console.error(error.message);
                            setIsUploading(false);
                            onImageUploadError(error);
                        }
                    }
                )
                .catch(
                    error => {
                        let error1 = new Error(`Error uploading image: ${error}`);

                        console.error(error1.message);
                        setIsUploading(false);
                        onImageUploadError(error);
                    }
                )
            ;
        }
        catch (error)
        {
            let error1 = new Error(`Error uploading image: ${error}`);

            console.error(error1.message);
            setIsUploading(false);
            onImageUploadError(error);
        }
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
    initialImageUrl: null,
    uploadImageUrl: '',
    uploadImageKey: 'image',
    onImageUploading: () => {},
    onImageUploaded: (imageUrl) => {},
    onImageUploadError: (error) => {}
};

UploadImage.propTypes = {
    initialImageUrl: PropTypes.string,
    uploadImageUrl: PropTypes.string,
    uploadImageKey: PropTypes.string,
    onImageUploading: PropTypes.func,
    onImageUploaded: PropTypes.func,
    onImageUploadError: PropTypes.func
};

