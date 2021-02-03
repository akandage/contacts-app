import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, Dropdown, DropdownButton, Form, InputGroup } from 'react-bootstrap';
import { AddIcon, DeleteIcon, FavoriteIcon, GroupIcon, RefreshIcon, StarIcon, UserIcon } from '../../common/contactsImages';
import { DEFAULT_CONTACTS_ORDERBY } from '../constants';

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
        contacts,
        disabled,
        orderBy,
        onRefreshClicked,
        onSelected,
        onSelectAll,
        onDeselected,
        onDeselectAll,
        onDeleteClicked,
        onFavoriteClicked
    } = props;

    let numSelected = contacts.reduce((total, contact) => {
        return contact.selected ? total+1 : total;
    }, 0);

    function ListToolbar(props)
    {
        function onCheckClicked()
        {
            if (numSelected > 0)
            {
                onDeselectAll();
            }
            else
            {
                onSelectAll();
            }
        }

        return (
            <>
                <Form.Check checked={ numSelected > 0 } onChange={ onCheckClicked } />

                <ButtonGroup>
                    <Button>
                        <AddIcon width={ ADD_TOOLBAR_BUTTON_WIDTH } height={ ADD_TOOLBAR_BUTTON_HEIGHT } />
                    </Button>
                    <Button>
                        <DeleteIcon width={ DELETE_TOOLBAR_BUTTON_WIDTH } height={ DELETE_TOOLBAR_BUTTON_HEIGHT } />
                    </Button>
                    <Button>
                        <StarIcon width={ FAVORITE_TOOLBAR_BUTTON_WIDTH } height={ FAVORITE_TOOLBAR_BUTTON_HEIGHT } />
                    </Button>
                    <Button>
                        <GroupIcon width={ GROUP_TOOLBAR_BUTTON_WIDTH } height={ GROUP_TOOLBAR_BUTTON_HEIGHT } />
                    </Button>
                    <Button onClick={ onRefreshClicked }>
                        <RefreshIcon width={ REFRESH_TOOLBAR_BUTTON_WIDTH } height={ REFRESH_TOOLBAR_BUTTON_HEIGHT } />
                    </Button>
                </ButtonGroup>

                <DropdownButton title="Sort">
                    <Dropdown.Item eventKey="firstNameAsc">First Name Ascending</Dropdown.Item>
                    <Dropdown.Item eventKey="firstNameDesc">First Name Descending</Dropdown.Item>
                    <Dropdown.Item eventKey="lastNameAsc">Last Name Ascending</Dropdown.Item>
                    <Dropdown.Item eventKey="lastNameDesc">Last Name Descending</Dropdown.Item>
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

                <span className="contact-name">
                    {`${contact.firstName} ${contact.lastName}`}
                </span>

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
    let sortField = orderBy[0];
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
    contacts: [],
    disabled: false,
    orderBy: DEFAULT_CONTACTS_ORDERBY,
    onRefreshClicked: () => {},
    onSelected: (contact) => {},
    onSelectAll: () => {},
    onDeselected: (contact) => {},
    onDeselectAll: () => {},
    onDeleteClicked: (contact) => {},
    onFavoriteClicked: (contact) => {}
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
    onRefreshClicked: PropTypes.func,
    onSelected: PropTypes.func,
    onSelectAll: PropTypes.func,
    onDeselected: PropTypes.func,
    onDeselectAll: PropTypes.func,
    onDeleteClicked: PropTypes.func,
    onFavoriteClicked: PropTypes.func
}