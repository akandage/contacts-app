import React from 'react';
import ContactsLogoImage from './images/contacts.svg';
import DeleteIconImage from './images/delete-icon.svg';
import SearchIconImage from './images/search-icon.svg';
import FavoriteIconImage from './images/favorite-icon.svg';
import FavoriteIconOutlineImage from './images/favorite-icon-outline.svg';
import UserIconImage from './images/user-icon.svg';

export function ContactsLogo(props)
{
    let { width, height } = props;

    return (
        <ContactsLogoImage width={ width } height={ height } viewBox="0 0 150 117" />
    );
}

export function DeleteIcon(props)
{
    let { width, height } = props;

    return (
        <DeleteIconImage width={ width } height={ height } viewBox="0 0 125 148" />
    );
}

export function FavoriteIcon(props)
{
    let { width, height, outline } = props;

    return (
        !outline ?
            <FavoriteIconImage width={ width } height={ height } viewBox="0 0 125 130" /> :
            <FavoriteIconOutlineImage width={ width } height={ height } viewBox="0 0 125 130" />
    )
}

export function SearchIcon(props)
{
    let { width, height } = props;

    // TODO: Fix the viewbox so it can be at (X=0, Y=0).
    return (
        <SearchIconImage width={ width } height={ height } viewBox="-40 0 144 128" />
    );
}

export function UserIcon(props)
{
    let { width, height } = props;

    return (
        <UserIconImage width={ width } height={ height } viewBox="0 0 125 125" />
    );
}