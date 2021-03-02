import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { Col, Form } from 'react-bootstrap';
import { AddButton, RemoveButton } from './customTextbox';

const NUM_INPUT_COLS = 10;

export default function AutoCompleteTextbox(props)
{
    let {
        value,
        suggestions,
        allowAdd,
        autoCompleted,
        disabled,
        maxLength,
        onChanged,
        onSuggestionClicked,
        onAddButtonClicked,
        onRemoveButtonClicked
    } = props;

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
            <Form.Row xl={ NUM_INPUT_COLS }>
                <Col xl={ NUM_INPUT_COLS }>
                    {
                        !autoCompleted ?
                            <Form.Control as="input" type="text"
                                disabled={ disabled }
                                value={ value }
                                maxLength={ maxLength }
                                onChange={ onChange }
                            >
                            </Form.Control> :
                            <div className="auto-complete-result">
                                { value }
                            </div>
                    }

                    {
                        suggestions.length > 0 ?
                            <div className="auto-complete-suggestions">
                                {
                                    suggestions.map((suggestion, index) =>
                                        <a
                                            href="#"
                                            key={ index }
                                            onClick={ () => onSuggestionClicked(suggestion, index) }
                                        >
                                            {
                                                suggestion
                                            }
                                        </a>
                                    )
                                }
                            </div> :
                            <>
                            </>
                    }
                </Col>
                
                <Col>
                    <AddButton disabled={ !allowAdd || disabled } onClick={ onAddButtonClicked } />
                    &nbsp;
                    <RemoveButton disabled={ value === '' || disabled } onClick={ onRemoveButtonClicked } />
                </Col>
            </Form.Row>

        </Form.Group>
    );
}

AutoCompleteTextbox.defaultProps = {
    value: '',
    suggestions: [],
    allowAdd: false,
    autoCompleted: false,
    disabled: false,
    maxLength: 255,
    onChanged: (value) => {},
    onSuggestionClicked: (suggestion, index) => {},
    onAddButtonClicked: () => {},
    onRemoveButtonClicked: () => {}
};

AutoCompleteTextbox.propTypes = {
    value: PropTypes.string,
    suggestions: PropTypes.arrayOf(PropTypes.string),
    allowAdd: PropTypes.bool,
    autoCompleted: PropTypes.bool,
    disabled: PropTypes.bool,
    maxLength: PropTypes.number,
    onChanged: PropTypes.func,
    onSuggestionClicked: PropTypes.func,
    onAddButtonClicked: PropTypes.func,
    onRemoveButtonClicked: PropTypes.func
};