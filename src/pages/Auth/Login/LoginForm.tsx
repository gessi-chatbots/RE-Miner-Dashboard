import React, { useState } from 'react';
import { Row, Col, Form, Button, Container } from 'react-bootstrap';
import Image from 'react-bootstrap/Image';
import Footer from "../../../components/footer/Footer";
import Logo from '../../../assets/static/images/logos/logo-GESSI.jpg'; 
import './LoginForm.css'; // Import CSS file for styling
import { useNavigate } from 'react-router-dom';

function getCookie(name: string): string | null {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName.trim() === name) {
      return decodeURIComponent(cookieValue);
    }
  }
  return null;
}

const LoginForm = () => {
  const [formData, setFormData] = useState({
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
      formDataToSend.append('email', formData.email);
      formDataToSend.append('password', formData.password);
      const response = await fetch('http://localhost:3001/api/v1/login', {
        method: 'POST',
        body: formDataToSend
      });
      if (response.ok) {
        const responseBody = await response.json();
        const userId = responseBody.user_data.id;
        const accessTokenFromBody = responseBody.access_token;
        const refreshTokenFromBody = responseBody.refresh_token;
        localStorage.setItem('USER_ID', userId);
        localStorage.setItem('ACCESS_TOKEN', accessTokenFromBody);
        localStorage.setItem('REFRESH_TOKEN', refreshTokenFromBody);  
        navigate('/dashboard');
      } else {
        console.error('Login failed:', response.statusText);
      }
    } catch (error) {
      console.error('Login failed:', error);
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
        <h1 className="form-title">Login in RE-Miner</h1>
        <Container className="form-container">
        <Form onSubmit={handleSubmit}>
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
          <Button className="mt-5 mr-2" variant="secondary" onClick={() => navigate('/sign-up')}>
              Sign Up
              </Button>
            </Col>
            <Col>
              <Button className="mt-5" variant="primary" type="submit">
              Login
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

export default LoginForm;
