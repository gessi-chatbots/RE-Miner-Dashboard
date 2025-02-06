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
          <Container className="d-flex flex-column align-items-center justify-content-center vh-100">
              {/* Logo */}
              <div className="mb-4">
                  <a href="https://gessi.upc.edu/en" target="_blank" rel="noopener noreferrer">
                      <Image
                          alt="GESSI logo"
                          src={Logo}
                          style={{
                              maxWidth: '200px', // Increased size for the logo
                              height: 'auto',
                              display: 'block',
                              margin: '0 auto',
                          }}
                      />
                  </a>
              </div>

              {/* Login Form */}
              <Row className="w-100 justify-content-center">
                  <Col xs={12} sm={8} md={6} lg={4}>
                      <div
                          style={{
                              backgroundColor: '#ffffff',
                              borderRadius: '10px',
                              padding: '20px',
                              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
                          }}
                      >
                          <h1
                              style={{
                                  fontSize: '1.5rem',
                                  fontWeight: 'bold',
                                  textAlign: 'center',
                                  marginBottom: '20px',
                                  color: '#333',
                              }}
                          >
                              RE-Miner 2.0
                          </h1>
                          <Form onSubmit={handleSubmit}>
                              <Form.Group controlId="email" style={{ marginBottom: '15px' }}>
                                  <Form.Label style={{ fontWeight: '500', fontSize: '1rem' }}>
                                      Email Address
                                  </Form.Label>
                                  <Form.Control
                                      type="email"
                                      name="email"
                                      value={formData.email}
                                      onChange={handleChange}
                                      placeholder="Enter your email"
                                      style={{ padding: '10px', fontSize: '1rem' }}
                                      required
                                  />
                              </Form.Group>
                              <Form.Group controlId="password" style={{ marginBottom: '15px' }}>
                                  <Form.Label style={{ fontWeight: '500', fontSize: '1rem' }}>
                                      Password
                                  </Form.Label>
                                  <Form.Control
                                      type="password"
                                      name="password"
                                      value={formData.password}
                                      onChange={handleChange}
                                      placeholder="Enter your password"
                                      style={{ padding: '10px', fontSize: '1rem' }}
                                      required
                                  />
                              </Form.Group>
                              <Row>
                                  <Col>
                                      <Button
                                          variant="secondary"
                                          style={{
                                              width: '100%',
                                              padding: '10px',
                                              fontSize: '1rem',
                                              fontWeight: 'bold',
                                          }}
                                          onClick={() => navigate('/sign-up')}
                                      >
                                          Sign Up
                                      </Button>
                                  </Col>
                                  <Col>
                                      <Button
                                          variant="primary"
                                          type="submit"
                                          style={{
                                              width: '100%',
                                              padding: '10px',
                                              fontSize: '1rem',
                                              fontWeight: 'bold',
                                          }}
                                      >
                                          Login
                                      </Button>
                                  </Col>
                              </Row>
                          </Form>
                      </div>
                  </Col>
              </Row>
          </Container>
      </>


  );
};

export default LoginForm;
