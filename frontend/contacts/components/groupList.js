import React from 'react';
import PropTypes from 'prop-types';
import { Button, ButtonGroup, Dropdown, DropdownButton, Form, InputGroup } from 'react-bootstrap';
import { AddIcon, DeleteIcon, RefreshIcon } from '../../common/contactsImages';
import { STATUS, DEFAULT_GROUPS_ORDERBY, GROUPS_ORDERBY_NAME_ASC, GROUPS_ORDERBY_NAME_DESC,
    DELETE_BUTTON_WIDTH,
    DELETE_BUTTON_HEIGHT,
    ADD_TOOLBAR_BUTTON_WIDTH,
    ADD_TOOLBAR_BUTTON_HEIGHT,
    DELETE_TOOLBAR_BUTTON_WIDTH,
    DELETE_TOOLBAR_BUTTON_HEIGHT,
    REFRESH_TOOLBAR_BUTTON_WIDTH,
    REFRESH_TOOLBAR_BUTTON_HEIGHT
} from '../constants';

export default function GroupList(props)
{
    let {
        status,
        groups,
        disabled,
        orderBy,
        onSelected,
        onDeselected,
        onSelectAll,
        onDeselectAll,
        onAddGroupClicked,
        onEditGroupClicked,
        onDeleteClicked,
        onDeleteMultipleClicked,
        onRefreshClicked,
        onSortChanged
    } = props;

    let selectedGroups = groups.filter(group => group.selected);
    let isGroupsSelected = selectedGroups.length > 0;
    let sortKey = getSortKey();

    function getSortKey()
    {
        if (orderBy !== null && orderBy !== undefined && orderBy.length >= 2)
        {
            return orderBy.slice(0, 2).join('');
        }

        return DEFAULT_GROUP_ORDERBY.slice(0, 2).join('');
    }

    function ListToolbar(props)
    {
        function onCheckClicked()
        {
            if (isGroupsSelected)
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
            if (isGroupsSelected)
            {
                onDeleteMultipleClicked(selectedGroups.map(group => group.group));
            }
        }

        function onSortSelected(eventKey)
        {
            if (eventKey !== sortKey)
            {
                let orderBy = DEFAULT_GROUPS_ORDERBY;

                switch (eventKey)
                {
                    case 'nameASC':
                        orderBy = GROUPS_ORDERBY_NAME_ASC;
                        break;
                    case 'nameDESC':
                        orderBy = GROUPS_ORDERBY_NAME_DESC;
                        break;
                    default:
                        break;
                }

                onSortChanged(orderBy);
            }
        }

        return (
            <>
                <Form.Check checked={ isGroupsSelected } onChange={ onCheckClicked } />

                <ButtonGroup>
                    <Button disabled={ isGroupsSelected } onClick={ onAddGroupClicked }>
                        <AddIcon width={ ADD_TOOLBAR_BUTTON_WIDTH } height={ ADD_TOOLBAR_BUTTON_HEIGHT } />
                    </Button>
                    <Button disabled={ !isGroupsSelected } onClick={ onDeleteButtonClicked }>
                        <DeleteIcon width={ DELETE_TOOLBAR_BUTTON_WIDTH } height={ DELETE_TOOLBAR_BUTTON_HEIGHT } />
                    </Button>
                    <Button onClick={ onRefreshClicked } disabled={ status === STATUS.LOADING || status === STATUS.REFRESHING }>
                        <RefreshIcon width={ REFRESH_TOOLBAR_BUTTON_WIDTH } height={ REFRESH_TOOLBAR_BUTTON_HEIGHT } />
                    </Button>
                </ButtonGroup>

                <DropdownButton title="Sort" onSelect={ onSortSelected } disabled={ status === STATUS.LOADING || status === STATUS.REFRESHING }>
                    <Dropdown.Item eventKey="nameASC" active={ sortKey === 'nameASC' }>Name Ascending</Dropdown.Item>
                    <Dropdown.Item eventKey="nameDESC" active={ sortKey === 'nameDESC' }>Name Descending</Dropdown.Item>
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

    function ListItem(props)
    {
        let {
            group,
            disabled,
            selected
        } = props;

        return (
            <li className="contact-list-item">
                <div className="check">
                    <Form.Check as="input" type="checkbox"
                        disabled={ disabled }
                        checked={ selected }
                        onChange={ () => !selected ? onSelected(group) : onDeselected(group) }
                    />
                </div>

                <a href="#" className="contact-name" onClick={ () => onEditGroupClicked(group) }>
                    <span>
                        {`${group.name}`}
                    </span>
                </a>

                <div className="action-buttons">
                    <DeleteButton disabled={ disabled } onClick={ () => onDeleteClicked(group) } />
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
    let currSeparator = null;

    return (
        <>
            <div className="contact-list-toolbar">
                <ListToolbar />
            </div>
            <ol className="contact-list">
                {
                    groups.flatMap(group => {
                        let listItems = [];
                        let separator = null;

                        separator = group.group.name[0].toUpperCase();

                        if (currSeparator !== separator)
                        {
                            listItems.push(<ListItemSeparator key={ listIndex }>{ separator }</ListItemSeparator>);
                            currSeparator = separator;
                            ++listIndex;
                        }

                        listItems.push(<ListItem key={ listIndex } group={ group.group } disabled={ disabled || group.disabled } selected={ group.selected } />);
                        ++listIndex;

                        return listItems;
                    })
                }
            </ol>
        </>
    );
}

GroupList.defaultProps = {
    status: '',
    groups: [],
    disabled: false,
    orderBy: DEFAULT_GROUPS_ORDERBY,
    onSelected: (group) => {},
    onDeselected: (group) => {},
    onSelectAll: () => {},
    onDeselectAll: () => {},
    onAddGroupClicked: () => {},
    onEditGroupClicked: (group) => {},
    onDeleteClicked: (group) => {},
    onDeleteMultipleClicked: (groups) => {},
    onRefreshClicked: () => {},
    onSortChanged: (orderBy) => {}
};

GroupList.propTypes = {
    status: PropTypes.string,
    groups: PropTypes.arrayOf(
        PropTypes.shape({
            group: PropTypes.shape.isRequired,
            disabled: PropTypes.bool.isRequired,
            selected: PropTypes.bool.isRequired
        })
    ),
    disabled: PropTypes.bool,
    orderBy: PropTypes.array,
    onSelected: PropTypes.func,
    onDeselected: PropTypes.func,
    onSelectAll: PropTypes.func,
    onDeselectAll: PropTypes.func,
    onAddGroupClicked: PropTypes.func,
    onEditGroupClicked: PropTypes.func,
    onDeleteClicked: PropTypes.func,
    onDeleteMultipleClicked: PropTypes.func,
    onRefreshClicked: PropTypes.func,
    onSortChanged: PropTypes.func
};