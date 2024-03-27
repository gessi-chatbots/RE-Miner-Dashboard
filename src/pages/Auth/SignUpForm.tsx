import React, { useState } from 'react';
import { Row, Col, Form, Button, Container } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import Footer from "../../components/footer/Footer";
import Logo from '../../assets/static/images/logos/logo-GESSI.jpg'; 
import './SignUpForm.css'; // Import CSS file for styling
import { useNavigate } from 'react-router-dom';

const SignUpForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    family_name: '',
    email: '',
    password: '',
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('family_name', formData.family_name);
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      const response = await fetch('http://localhost:3001/api/v1/users', {
        method: 'POST',
        body: formDataToSend
      });
      if (response.ok) {
        navigate('/login');

      } else {
        console.error('Sign-up failed:', response.statusText);
      }
    } catch (error) {
      console.error('Sign-up failed:', error);
    }
  };

  return (
    <>
        <Container className="mt-5">
        <div className="logo-container">
            <a href="https://gessi.upc.edu/en" target="_blank" rel="noopener noreferrer">
            <Image
                alt="GESSI logo"
                src={Logo}
                className="logo-image"
            />
            </a>
        </div>
        </Container>
        <h1 className="form-title">Sign Up in RE-Miner</h1>
        <Container className="form-container">
        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="family_name">
            <Form.Label>Family Name</Form.Label>
            <Form.Control
              type="text"
              name="family_name"
              value={formData.family_name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="email">
            <Form.Label>Email address</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="password">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Row>
            <Col>
            <Button className="mt-5 mr-2" variant="secondary" onClick={() => navigate('/login')}>
            Back
          </Button>
            </Col>
            <Col>
            
          <Button className="mt-5" variant="primary" type="submit">
            Sign Up
          </Button>
            </Col>

          </Row>
        </Form>
      </Container>
      <div className="mt-5">
        <Footer />
      </div>
    </>
  );
};

export default SignUpForm;
