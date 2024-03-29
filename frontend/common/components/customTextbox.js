import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Button, Col, Form, FormControl } from 'react-bootstrap';
import { CrossIcon, PlusIcon } from '../../common/contactsImages';

const NUM_INPUT_COLS = 10;
const ADD_BUTTON_ICON_WIDTH = 24;
const ADD_BUTTON_ICON_HEIGHT = 24;
const REMOVE_BUTTON_ICON_WIDTH = 24;
const REMOVE_BUTTON_ICON_HEIGHT = 24;

const CustomTextBox = React.forwardRef((props, ref) =>
{
    let {
        id,
        disabled,
        value,
        labelText,
        inputType,
        isInvalid,
        invalidFeedback,
        onChanged,
        onFocus,
        onBlur
    } = props;

    let numChildren = Array.isArray(props.children) ? props.children.length :
                        (props.children ? 1 : 0);

    function onChange(e)
    {
        let newValue = e.target.value;

        if (newValue !== value)
        {
            onChanged(newValue);
        }
    }

    return (
        <Form.Group>
            {
                labelText !== '' ?
                    <Form.Label htmlFor={ id }>{ labelText }</Form.Label> :
                    <></>
            }

            <Form.Row xl={ NUM_INPUT_COLS }>
                <Col xl={ Math.max(1, NUM_INPUT_COLS - Math.max(0, numChildren)) }>
                    <Form.Control as="input" type={ inputType }
                        id={ id }
                        name={ id }
                        disabled={ disabled }
                        isInvalid={ isInvalid }
                        value={ value }
                        onChange={ onChange }
                        onFocus={ onFocus }
                        onBlur={ onBlur }
                        ref={ ref }
                    >
                    </Form.Control>

                    {
                        isInvalid && invalidFeedback ?
                            <FormControl.Feedback type="invalid">
                                { invalidFeedback }
                            </FormControl.Feedback> :
                            <></>
                    }
                </Col>

                {
                    Array.isArray(props.children) ?
                        props.children.map(
                            (child, index) => <Col key={ index }>{ child }</Col>
                        ) :
                        props.children ?
                            <Col>{ props.children }</Col> :
                            <></>
                }
            </Form.Row>

        </Form.Group>
    );
});

CustomTextBox.defaultProps = {
    id: '',
    disabled: false,
    value: '',
    labelText: '',
    inputType: 'text',
    isInvalid: false,
    invalidFeedback: null,
    onChanged: (value) => {},
    onFocus: (e) => {},
    onBlur: (e) => {}
};

CustomTextBox.propTypes = {
    id: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    value: PropTypes.string,
    labelText: PropTypes.string,
    inputType: PropTypes.string,
    isInvalid: PropTypes.bool,
    invalidFeedback: PropTypes.string,
    onChanged: PropTypes.func,
    onFocus: PropTypes.func,
    onBlur: PropTypes.func
};

export default CustomTextBox;

export function AddButton(props)
{
    let {
        disabled,
        onClick
    } = props;

    return (
        <Button disabled={ disabled } onClick={ onClick }>
            <PlusIcon width={ ADD_BUTTON_ICON_WIDTH} height={ ADD_BUTTON_ICON_HEIGHT } />
        </Button>
    );
}

AddButton.defaultProps = {
    disabled: false,
    onClick: (e) => {}
};

AddButton.propTypes = {
    disabled: PropTypes.bool,
    onClick: PropTypes.func
};

export function RemoveButton(props)
{
    let {
        disabled,
        onClick
    } = props;

    return (
        <Button disabled={ disabled } onClick={ onClick }>
            <CrossIcon width={ REMOVE_BUTTON_ICON_WIDTH} height={ REMOVE_BUTTON_ICON_HEIGHT } />
        </Button>
    );
}

RemoveButton.defaultProps = {
    disabled: false,
    onClick: (e) => {}
};

RemoveButton.propTypes = {
    disabled: PropTypes.bool,
    onClick: PropTypes.func
};