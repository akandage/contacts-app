import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';
import { DeleteIcon, FavoriteIcon, UserIcon } from '../../common/contactsImages';

const DELETE_BUTTON_WIDTH = 32;
const DELETE_BUTTON_HEIGHT = 32;
const FAVORITE_BUTTON_WIDTH = 32;
const FAVORITE_BUTTON_HEIGHT = 32;

export default function ContactList(props)
{
    let {
        contacts,
        disabled,
        orderBy,
        onDeleteClicked,
        onFavoriteClicked
    } = props;

    function DeleteButton(props)
    {
        let {
            disabled,
            onClick
        } = props;

        return (
            !disabled ?
                <a href="#"
                    onClick={ onClick }
                >
                    <DeleteIcon width={ DELETE_BUTTON_WIDTH } height={ DELETE_BUTTON_HEIGHT } />
                </a> :
                <DeleteIcon width={ DELETE_BUTTON_WIDTH } height={ DELETE_BUTTON_HEIGHT } />
        )
    }

    function FavoriteButton(props)
    {
        let {
            favorite,
            disabled,
            onClick
        } = props;
        const [ hover, setHover ] = useState(false);

        return (
            !disabled ?
                <a href="#"
                    onMouseEnter={ () => setHover(true) }
                    onMouseLeave={ () => setHover(false) }
                    onClick={ onClick }
                >
                    <FavoriteIcon width={ FAVORITE_BUTTON_WIDTH } height={ FAVORITE_BUTTON_HEIGHT }
                        outline={ !favorite && !hover }
                    />
                </a> :
                <FavoriteIcon width={ FAVORITE_BUTTON_WIDTH } height={ FAVORITE_BUTTON_HEIGHT } outline={ favorite } />
        );
    }

    function ListItem(props)
    {
        let {
            contact,
            disabled,
            selected
        } = props;

        return (
            <li className="contact-list-item">
                <div className="check">
                    <Form.Check as="input" type="checkbox"
                        disabled={ disabled }
                    />
                </div>

                <UserIcon width="32" height="32" />

                <span className="contact-name">
                    {`${contact.firstName} ${contact.lastName}`}
                </span>

                <div className="action-buttons">
                    <FavoriteButton disabled={ disabled } favorite={ contact.favorite } onClick={ onFavoriteClicked(contact) } />

                    <DeleteButton disabled={ disabled } onClick={ onDeleteClicked(contact) } />
                </div>
            </li>
        );
    }

    function ListItemSeparator(props)
    {
        return (
            <li className="contact-list-item-separator">
                <h3>
                    {props.children}
                </h3>
            </li>
        );
    }

    let listIndex = 0;
    let sortField = orderBy[0];
    let addSeparators = sortField === 'firstName' || sortField === 'lastName';
    let currSeparator = null;

    return (
        <ol className="contact-list">
            {
                contacts.flatMap(contact => {
                    let listItems = [];

                    if (addSeparators)
                    {
                        let separator = null;

                        if (sortField === 'firstName')
                        {
                            separator = contact.contact.firstName[0].toUpperCase();
                        }
                        else
                        {
                            separator = contact.contact.lastName[0].toUpperCase();
                        }

                        if (currSeparator !== separator)
                        {
                            listItems.push(<ListItemSeparator key={ listIndex }>{ separator }</ListItemSeparator>);
                            currSeparator = separator;
                        }

                        ++listIndex;
                    }

                    listItems.push(<ListItem key={ listIndex } contact={ contact.contact } disabled={ disabled || contact.disabled } selected={ contact.selected } />);
                    ++listIndex;

                    return listItems;
                })
            }
        </ol>
    );
}

ContactList.defaultProps = {
    contacts: [],
    disabled: false,
    orderBy: ['firstName', 'ASC'],
    onDeleteClicked: (contact) => {},
    onFavoriteClicked: (favorite) => {}
};

ContactList.propTypes = {
    contacts: PropTypes.arrayOf(
        PropTypes.shape({
            contact: PropTypes.shape.isRequired,
            disabled: PropTypes.bool.isRequired,
            selected: PropTypes.bool.isRequired
        })
    ).isRequired,
    disabled: PropTypes.bool,
    orderBy: PropTypes.array,
    onDeleteClicked: PropTypes.func,
    onFavoriteClicked: PropTypes.func
}