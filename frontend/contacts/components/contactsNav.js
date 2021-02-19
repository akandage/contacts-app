import React from 'react';
import PropTypes from 'prop-types';
import { NavLink } from 'react-router-dom';

export default function ContactsNav(props)
{
    let {

    } = props;

    return (
        <div className="contacts-nav">
            {
                props.children
            }
        </div>
    );
}

ContactsNav.defaultProps = {

};

ContactsNav.propTypes = {

};

ContactsNav.Link = function(props)
{
    let {
        disabled,
        icon,
        linkText,
        to
    } = props;

    return (
        <NavLink to={ to } className="contacts-nav-link" activeClassName="contacts-nav-active-link">
            {
                icon
            }

            {
                linkText
            }
        </NavLink>
    );
}

ContactsNav.Link.defaultProps = {
    disabled: false
};

ContactsNav.Link.propTypes = {
    disabled: PropTypes.bool,
    icon: PropTypes.object.isRequired,
    linkText: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
};

ContactsNav.Divider = function(props)
{
    return (
        <hr />
    )
}