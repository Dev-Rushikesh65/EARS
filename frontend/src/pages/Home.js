import React, { useContext } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faFileAlt,
  faChartLine,
  faSearch,
  faUserTie,
  faCheckCircle,
  faBuilding,
  faUsers,
  faLaptopCode,
  faShieldAlt,
  faRocket
} from '@fortawesome/free-solid-svg-icons';
import AuthContext from '../context/AuthContext';

const Home = () => {
  const { isAuthenticated, user } = useContext(AuthContext);

  return (
    <Container>
      {/* Hero Section */}
      <div className="hero-section text-center p-5 rounded">
        <h1 className="hero-title">EARS</h1>
        <h2 className="mb-3">Employee Application Review System</h2>
        <p className="hero-subtitle">
          Streamline your hiring process with our comprehensive application review system.
          The smart way to manage job applications and find the perfect candidates.
        </p>
        {!isAuthenticated ? (
          <div className="mt-4">
            <Button
              as={Link}
              to="/register"
              variant="light"
              size="lg"
              className="me-3 px-4"
            >
              <FontAwesomeIcon icon={faUserTie} className="me-2" />
              Get Started
            </Button>
            <Button as={Link} to="/login" variant="outline-light" size="lg" className="px-4">
              <FontAwesomeIcon icon={faUsers} className="me-2" />
              Login
            </Button>
          </div>
        ) : (
          <Button
            as={Link}
            to={user.role === 'hr' ? '/hr-dashboard' : '/dashboard'}
            variant="light"
            size="lg"
            className="mt-3 px-4"
          >
            <FontAwesomeIcon icon={faRocket} className="me-2" />
            Go to Dashboard
          </Button>
        )}
      </div>

      {/* Features Section */}
      <h2 className="text-center my-5">
        <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-success" />
        Key Features
      </h2>
      <Row>
        <Col md={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="icon-circle mb-4">
                <FontAwesomeIcon
                  icon={faFileAlt}
                  size="2x"
                  className="text-primary"
                />
              </div>
              <Card.Title className="fw-bold">Easy Application Process</Card.Title>
              <Card.Text>
                Submit your job applications with a simple and intuitive interface.
                Upload your resume and track your application status in real-time.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="icon-circle mb-4">
                <FontAwesomeIcon
                  icon={faSearch}
                  size="2x"
                  className="text-primary"
                />
              </div>
              <Card.Title className="fw-bold">Smart Resume Sorting</Card.Title>
              <Card.Text>
                HR professionals can filter and sort applications based on skills,
                experience, and qualifications to find the perfect candidates.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4} className="mb-4">
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="text-center p-4">
              <div className="icon-circle mb-4">
                <FontAwesomeIcon
                  icon={faChartLine}
                  size="2x"
                  className="text-primary"
                />
              </div>
              <Card.Title className="fw-bold">Detailed Analytics</Card.Title>
              <Card.Text>
                Get insights into your hiring process with comprehensive analytics
                and reporting tools to make data-driven decisions.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* How It Works Section */}
      <div className="bg-light p-5 rounded my-5">
        <h2 className="text-center mb-5">
          <FontAwesomeIcon icon={faLaptopCode} className="me-2 text-primary" />
          How It Works
        </h2>
        <Row className="mb-5">
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                  <h3 className="m-0">1</h3>
                </div>
                <Card.Title className="fw-bold">Create an Account</Card.Title>
                <Card.Text>
                  Register as an applicant or HR professional to get started with our platform.
                  Setup your profile and preferences in minutes.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                  <h3 className="m-0">2</h3>
                </div>
                <Card.Title className="fw-bold">Submit Applications</Card.Title>
                <Card.Text>
                  Applicants can submit their resumes and job applications for various positions.
                  HR professionals can post job openings and requirements.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4} className="mb-4">
            <Card className="h-100 border-0 shadow-sm">
              <Card.Body className="text-center p-4">
                <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-4" style={{ width: '80px', height: '80px' }}>
                  <h3 className="m-0">3</h3>
                </div>
                <Card.Title className="fw-bold">Review and Hire</Card.Title>
                <Card.Text>
                  HR professionals can review, sort, and manage applications to find the best candidates.
                  Applicants receive real-time updates on their application status.
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* CTA Section */}
      <div className="text-center p-5 bg-primary text-white rounded mb-5">
        <h2 className="mb-3">Ready to Streamline Your Hiring Process?</h2>
        <p className="lead mb-4">
          Join thousands of companies that use our platform to find the best talent.
          Get started today and transform your recruitment process.
        </p>
        {!isAuthenticated ? (
          <Button as={Link} to="/register" variant="light" size="lg" className="px-5">
            <FontAwesomeIcon icon={faShieldAlt} className="me-2" />
            Get Started Today
          </Button>
        ) : (
          <Button
            as={Link}
            to={user.role === 'hr' ? '/hr-dashboard' : '/dashboard'}
            variant="light"
            size="lg"
            className="px-5"
          >
            <FontAwesomeIcon icon={faBuilding} className="me-2" />
            Go to Dashboard
          </Button>
        )}
      </div>
    </Container>
  );
};

export default Home; 