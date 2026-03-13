import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBuilding, 
  faEnvelope, 
  faPhone, 
  faGlobe 
} from '@fortawesome/free-solid-svg-icons';

const Footer = () => {
  return (
    <footer className="footer py-4 mt-5">
      <Container>
        <Row>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>
              <FontAwesomeIcon icon={faBuilding} className="me-2" />
              EARS
            </h5>
            <p className="small">
              A comprehensive Employee Application Review System for HR professionals.
              Streamline your hiring process with our powerful tools.
            </p>
          </Col>
          <Col md={4} className="mb-4 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li className="mb-2"><a href="/" className="text-light text-decoration-none">Home</a></li>
              <li className="mb-2"><a href="/login" className="text-light text-decoration-none">Login</a></li>
              <li className="mb-2"><a href="/register" className="text-light text-decoration-none">Register</a></li>
            </ul>
          </Col>
          <Col md={4}>
            <h5>Contact Us</h5>
            <ul className="list-unstyled">
              <li className="mb-2">
                <FontAwesomeIcon icon={faEnvelope} className="me-2" />
                <a href="mailto:support@ears.com" className="text-light text-decoration-none">support@ears.com</a>
              </li>
              <li className="mb-2">
                <FontAwesomeIcon icon={faPhone} className="me-2" />
                <a href="tel:+1234567890" className="text-light text-decoration-none">+1 (234) 567-890</a>
              </li>
              <li className="mb-2">
                <FontAwesomeIcon icon={faGlobe} className="me-2" />
                <a href="https://ears.com" className="text-light text-decoration-none">www.ears.com</a>
              </li>
            </ul>
          </Col>
        </Row>
        <hr className="mt-4 mb-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }} />
        <Row>
          <Col className="text-center">
            <p className="small mb-0">
              &copy; {new Date().getFullYear()} EARS - Employee Application Review System. All rights reserved.
            </p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer; 