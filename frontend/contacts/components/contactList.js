import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, Dropdown, DropdownButton, Form, InputGroup } from 'react-bootstrap';
import { AddIcon, DeleteIcon, FavoriteIcon, GroupIcon, RefreshIcon, StarIcon, UserIcon } from '../../common/contactsImages';
import { STATUS, DEFAULT_CONTACTS_ORDERBY, CONTACTS_ORDERBY_FIRSTNAME_ASC,
    CONTACTS_ORDERBY_FIRSTNAME_DESC, CONTACTS_ORDERBY_LASTNAME_ASC, 
    CONTACTS_ORDERBY_LASTNAME_DESC } from '../constants';

const DELETE_BUTTON_WIDTH = 24;
const DELETE_BUTTON_HEIGHT = 24;
const FAVORITE_BUTTON_WIDTH = 24;
const FAVORITE_BUTTON_HEIGHT = 24;

const ADD_TOOLBAR_BUTTON_WIDTH = 24;
const ADD_TOOLBAR_BUTTON_HEIGHT = 24;
const DELETE_TOOLBAR_BUTTON_WIDTH = 24;
const DELETE_TOOLBAR_BUTTON_HEIGHT = 24;
const FAVORITE_TOOLBAR_BUTTON_WIDTH = 24;
const FAVORITE_TOOLBAR_BUTTON_HEIGHT = 24;
const GROUP_TOOLBAR_BUTTON_WIDTH = 24;
const GROUP_TOOLBAR_BUTTON_HEIGHT = 24;
const REFRESH_TOOLBAR_BUTTON_WIDTH = 24;
const REFRESH_TOOLBAR_BUTTON_HEIGHT = 24;

export default function ContactList(props)
{
    let {
        status,
        contacts,
        disabled,
        orderBy,
        onAddContactClicked,
        onEditContactClicked,
        onRefreshClicked,
        onSelected,
        onSelectAll,
        onDeselected,
        onDeselectAll,
        onDeleteClicked,
        onDeleteMultipleClicked,
        onFavoriteClicked,
        onSortChanged
    } = props;

    let selectedContacts = contacts.filter(contact => contact.selected);
    let isContactsSelected = selectedContacts.length > 0;
    let sortField = getSortField();
    let sortKey = getSortKey();

    function getSortField()
    {
        if (orderBy !== null && orderBy !== undefined && orderBy.length >= 2)
        {
            return orderBy[0];
        }

        return DEFAULT_CONTACTS_ORDERBY[0];
    }

    function getSortKey()
    {
        if (orderBy !== null && orderBy !== undefined && orderBy.length >= 2)
        {
            return orderBy.slice(0, 2).join('');
        }

        return DEFAULT_CONTACTS_ORDERBY.slice(0, 2).join('');
    }

    function ListToolbar(props)
    {
        function onCheckClicked()
        {
            if (isContactsSelected)
            {
                onDeselectAll();
            }
            else
            {
                onSelectAll();
            }
        }

        function onDeleteButtonClicked()
        {
            if (isContactsSelected)
            {
                onDeleteMultipleClicked(selectedContacts.map(contact => contact.contact));
            }
        }

        function onSortSelected(eventKey)
        {
            if (eventKey !== sortKey)
            {
                let orderBy = DEFAULT_CONTACTS_ORDERBY;

                switch (eventKey)
                {
                    case 'firstNameASC':
                        orderBy = CONTACTS_ORDERBY_FIRSTNAME_ASC;
                        break;
                    case 'firstNameDESC':
                        orderBy = CONTACTS_ORDERBY_FIRSTNAME_DESC;
                        break;
                    case 'lastNameASC':
                        orderBy = CONTACTS_ORDERBY_LASTNAME_ASC;
                        break;
                    case 'lastNameDESC':
                        orderBy = CONTACTS_ORDERBY_LASTNAME_DESC;
                        break;
                    default:
                        break;
                }

                onSortChanged(orderBy);
            }
        }

        return (
            <>
                <Form.Check checked={ isContactsSelected } onChange={ onCheckClicked } />

                <ButtonGroup>
                    <Button disabled={ isContactsSelected } onClick={ onAddContactClicked }>
                        <AddIcon width={ ADD_TOOLBAR_BUTTON_WIDTH } height={ ADD_TOOLBAR_BUTTON_HEIGHT } />
                    </Button>
                    <Button disabled={ !isContactsSelected } onClick={ onDeleteButtonClicked }>
                        <DeleteIcon width={ DELETE_TOOLBAR_BUTTON_WIDTH } height={ DELETE_TOOLBAR_BUTTON_HEIGHT } />
                    </Button>
                    <Button disabled={ !isContactsSelected }>
                        <StarIcon width={ FAVORITE_TOOLBAR_BUTTON_WIDTH } height={ FAVORITE_TOOLBAR_BUTTON_HEIGHT } />
                    </Button>
                    <Button disabled={ !isContactsSelected }>
                        <GroupIcon width={ GROUP_TOOLBAR_BUTTON_WIDTH } height={ GROUP_TOOLBAR_BUTTON_HEIGHT } />
                    </Button>
                    <Button onClick={ onRefreshClicked } disabled={ status === STATUS.LOADING || status === STATUS.REFRESHING }>
                        <RefreshIcon width={ REFRESH_TOOLBAR_BUTTON_WIDTH } height={ REFRESH_TOOLBAR_BUTTON_HEIGHT } />
                    </Button>
                </ButtonGroup>

                <DropdownButton title="Sort" onSelect={ onSortSelected } disabled={ status === STATUS.LOADING || status === STATUS.REFRESHING }>
                    <Dropdown.Item eventKey="firstNameASC" active={ sortKey === 'firstNameASC' }>First Name Ascending</Dropdown.Item>
                    <Dropdown.Item eventKey="firstNameDESC" active={ sortKey === 'firstNameDESC' }>First Name Descending</Dropdown.Item>
                    <Dropdown.Item eventKey="lastNameASC" active={ sortKey === 'lastNameASC' }>Last Name Ascending</Dropdown.Item>
                    <Dropdown.Item eventKey="lastNameDESC" active={ sortKey === 'lastNameDESC' }>Last Name Descending</Dropdown.Item>
                </DropdownButton>
            </>
        );
    }

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
                <FavoriteIcon width={ FAVORITE_BUTTON_WIDTH } height={ FAVORITE_BUTTON_HEIGHT } outline={ !favorite } />
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
                        checked={ selected }
                        onChange={ () => !selected ? onSelected(contact) : onDeselected(contact) }
                    />
                </div>

                <UserIcon width="32" height="32" />

                <a href="#" className="contact-name" onClick={ () => onEditContactClicked(contact) }>
                    <span>
                        {`${contact.firstName} ${contact.lastName}`}
                    </span>
                </a>

                <div className="action-buttons">
                    <FavoriteButton disabled={ disabled } favorite={ contact.favorite } onClick={ () => onFavoriteClicked(contact) } />

                    <DeleteButton disabled={ disabled } onClick={ () => onDeleteClicked(contact) } />
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
    let addSeparators = sortField === 'firstName' || sortField === 'lastName';
    let currSeparator = null;

    return (
        <>
            <div className="contact-list-toolbar">
                <ListToolbar />
            </div>
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
        </>
    );
}

ContactList.defaultProps = {
    status: '',
    contacts: [],
    disabled: false,
    orderBy: DEFAULT_CONTACTS_ORDERBY,
    onAddContactClicked: () => {},
    onEditContactClicked: (contact) => {},
    onRefreshClicked: () => {},
    onSelected: (contact) => {},
    onSelectAll: () => {},
    onDeselected: (contact) => {},
    onDeselectAll: () => {},
    onDeleteClicked: (contact) => {},
    onDeleteMultipleClicked: (contacts) => {},
    onFavoriteClicked: (contact) => {},
    onSortChanged: (orderBy) => {}
};

ContactList.propTypes = {
    status: PropTypes.string,
    contacts: PropTypes.arrayOf(
        PropTypes.shape({
            contact: PropTypes.shape.isRequired,
            disabled: PropTypes.bool.isRequired,
            selected: PropTypes.bool.isRequired
        })
    ).isRequired,
    disabled: PropTypes.bool,
    orderBy: PropTypes.array,
    onAddContactClicked: PropTypes.func,
    onEditContactClicked: PropTypes.func,
    onRefreshClicked: PropTypes.func,
    onSelected: PropTypes.func,
    onSelectAll: PropTypes.func,
    onDeselected: PropTypes.func,
    onDeselectAll: PropTypes.func,
    onDeleteClicked: PropTypes.func,
    onDeleteMultipleClicked: PropTypes.func,
    onFavoriteClicked: PropTypes.func,
    onSortChanged: PropTypes.func
}