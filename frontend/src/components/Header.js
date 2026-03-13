import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, Badge, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faSignOutAlt,
  faClipboardList,
  faTachometerAlt,
  faBuilding,
  faSun,
  faMoon
} from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../context/AuthContext';

const Header = () => {
  const { isAuthenticated, user, logout, theme, toggleTheme } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const authLinks = (
    <>
      {user && user.role === 'hr' && (
        <Nav.Link as={Link} to="/hr-dashboard" className="mx-2">
          <FontAwesomeIcon icon={faTachometerAlt} className="me-2" /> HR Dashboard
        </Nav.Link>
      )}
      {user && user.role === 'applicant' && (
        <Nav.Link as={Link} to="/dashboard" className="mx-2">
          <FontAwesomeIcon icon={faClipboardList} className="me-2" /> Dashboard
        </Nav.Link>
      )}
      <Nav.Item className="d-flex align-items-center ms-3">
        <div className="d-flex align-items-center me-3">
          <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
          <span className="fw-bold">{user && user.name}</span>
          {user && user.role && (
            <Badge bg="primary" className="ms-2 text-uppercase" style={{ fontSize: '0.65rem' }}>
              {user.role}
            </Badge>
          )}
        </div>
        <Button variant="outline-primary" size="sm" onClick={handleLogout} className="d-flex align-items-center">
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" /> Logout
        </Button>
      </Nav.Item>
    </>
  );

  const guestLinks = (
    <>
      <Nav.Link as={Link} to="/login" className="mx-2">Login</Nav.Link>
      <Nav.Link as={Link} to="/register" className="mx-2">Register</Nav.Link>
    </>
  );

  return (
    <Navbar bg="white" expand="lg" className="py-3 shadow-sm">
      <Container>
        <Navbar.Brand as={Link} to="/">
          <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
          <strong>EARS</strong>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link as={Link} to="/" className="mx-2">Home</Nav.Link>
            {isAuthenticated ? authLinks : guestLinks}
            <Nav.Item className="d-flex align-items-center mx-2">
              <div className="theme-toggle-wrapper d-flex align-items-center">
                <FontAwesomeIcon icon={faSun} className={`me-2 ${theme === 'light' ? 'text-warning' : 'text-muted'}`} />
                <Form.Check
                  type="switch"
                  id="theme-switch"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  className="theme-toggle"
                />
                <FontAwesomeIcon icon={faMoon} className={`ms-2 ${theme === 'dark' ? 'text-primary' : 'text-muted'}`} />
              </div>
            </Nav.Item>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 