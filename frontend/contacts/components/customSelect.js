import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

export default function CustomSelect(props)
{
    let {
        options,
        value,
        onChanged
    } = props;

    const [ valueState, setValueState ] = useState(value);

    function getOptionValue(option)
    {
        if (typeof option === 'string')
        {
            return option;
        }
        else if (typeof option === 'object')
        {
            return option.value;
        }

        throw new Error('Invalid argument \'option\'');
    }

    function getOptionLabel(option)
    {
        if (typeof option === 'string')
        {
            return option;
        }
        else if (typeof option === 'object')
        {
            return option.label;
        }

        throw new Error('Invalid argument \'option\'');
    }

    function onChange(e)
    {
        let newValue = e.target.value;

        if (newValue !== value)
        {
            setValueState(newValue);
            onChanged(newValue);
        }
    }

    return (
        <Form.Control as="select" value={ valueState } onChange={ onChange } custom>
            {
                options.map(
                    (option, index) =>
                        <option key={ index } value={ getOptionValue(option) }>{ getOptionLabel(option) }</option>
                )
            }
        </Form.Control>
    );
}

CustomSelect.defaultProps = {
    options: [],
    value: '',
    onChanged: (value) => {}
};

CustomSelect.propTypes = {
    options: PropTypes.array.isRequired,
    value: PropTypes.string,
    onChanged: PropTypes.func
};