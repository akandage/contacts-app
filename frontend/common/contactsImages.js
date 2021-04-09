import React from 'react';
import ContactsLogoImage from './images/contacts.svg';
import ContactsHomeLogoImage from './images/contacts-home-logo.svg';
import AddIconImage from './images/add-icon.svg';
import ContactIconImage from './images/contact-icon.svg';
import CrossIconImage from './images/cross-icon.svg';
import DeleteIconImage from './images/delete-icon.svg';
import DeleteIconOutlineImage from './images/delete-icon-outline.svg';
import FavoriteIconImage from './images/favorite-icon.svg';
import FavoriteIconOutlineImage from './images/favorite-icon-outline.svg';
import GroupIconImage from './images/group-icon.svg';
import PencilIconImage from './images/pencil-icon.svg';
import PlusIconImage from './images/plus-icon.svg';
import RefreshIconImage from './images/refresh-icon.svg';
import SearchIconImage from './images/search-icon.svg';
import SettingsIconImage from './images/gear-icon.svg';
import StarIconImage from './images/star-icon.svg';
import UserIconImage from './images/user-icon.svg';

export function ContactsLogo(props)
{
    let { width, height } = props;

    return (
        <ContactsLogoImage width={ width } height={ height } viewBox="0 0 150 117" />
    );
}

export function ContactsHomeLogo(props)
{
    let { width, height } = props;

    return (
        <ContactsHomeLogoImage className="contacts-home-logo" viewBox="0 0 150 117" />
    );
}

export function AddIcon(props)
{
    let { width, height } = props;

    return (
        <AddIconImage width={ width } height={ height } viewBox="0 0 125 125" />
    );
}

export function ContactIcon(props)
{
    let { width, height } = props;

    return (
        <ContactIconImage width={ width } height={ height } viewBox="0 0 128 164" />
    );
}

export function CrossIcon(props)
{
    let { width, height } = props;

    return (
        <CrossIconImage width={ width } height={ height } viewBox="0 0 125 125" />
    );
}

export function DeleteIcon(props)
{
    let { width, height, outline } = props;

    return (
        outline ?
            <DeleteIconOutlineImage width={ width } height={ height } viewBox="0 0 130 152" /> :
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

export function GroupIcon(props)
{
    let { width, height } = props;

    return (
        <GroupIconImage width={ width } height={ height } viewBox="0 0 125 98" />
    );
}

export function PencilIcon(props)
{
    let { width, height } = props;

    return (
        <PencilIconImage width={ width } height={ height } viewBox="0 0 125 125" />
    );
}

export function PlusIcon(props)
{
    let { width, height } = props;

    return (
        <PlusIconImage width={ width } height={ height } viewBox="0 0 125 126" />
    );
}

export function RefreshIcon(props)
{
    let { width, height } = props;

    return (
        <RefreshIconImage width={ width } height={ height } viewBox="0 0 125 101" />
    );
}

export function SearchIcon(props)
{
    let { width, height } = props;

    // TODO: Fix the viewbox so it can be at (X=0, Y=0).
    return (
        <SearchIconImage width={ width } height={ height } viewBox="-40 0 144 128" />
    );
}

export function SettingsIcon(props)
{
    let { width, height } = props;

    // TODO: Fix the viewbox so it can be at (X=0, Y=0).
    return (
        <SettingsIconImage width={ width } height={ height } viewBox="0 0 120 120" />
    );
}

export function StarIcon(props)
{
    let { width, height } = props;

    return (
        <StarIconImage width={ width } height={ height } viewBox="0 0 125 130" />
    );
}

export function UserIcon(props)
{
    let { width, height } = props;

    return (
        <UserIconImage width={ width } height={ height } viewBox="0 0 125 125" />
    );
}