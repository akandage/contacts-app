import React from 'react';
import ReactDOM from 'react-dom';
import { Button, Col, Form, Row } from 'react-bootstrap';
import { ContactsHeaderLogo } from '../common/contactsHeader';
import './login.css';

// const { EmailAddress } = require('../../emailAddress');

function LoginForm()
{
    return (
        <div className="login-form">
            <Form noValidate>
                <Form.Group controlId="username">
                    <Form.Label>
                        Username
                    </Form.Label>
                    <Form.Control as="input" type="text" size="lg" maxLength="64" />
                </Form.Group>
                <Form.Group controlId="password">
                    <Form.Label>
                        Password
                    </Form.Label>
                    <Form.Control as="input" type="password" size="lg" maxLength="64" />
                </Form.Group>
                <div className="spacer" />
                <Row>
                    <Col>
                        <Button size="lg" type="submit" variant="primary" block>
                            Login
                        </Button>
                    </Col>
                    <Col>
                        <Button size="lg" variant="outline-primary" block>
                            Sign Up
                        </Button>
                    </Col>
                </Row>
            </Form>
        </div>
    );
}

function Login()
{
    return (
        <div className="login-form-container">
            <ContactsHeaderLogo />
            <LoginForm />
        </div>
    );
}

ReactDOM.render(<Login />, document.getElementById('root'));