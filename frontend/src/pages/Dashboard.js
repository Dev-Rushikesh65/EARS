import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEye,
  faEdit,
  faTrash,
  faFileAlt,
  faUserTie,
  faCheckCircle,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Spinner from '../components/Spinner';

const Dashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/applications/me');
        setApplications(res.data.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch your applications');
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        setError(null); // Clear any previous errors
        const res = await axios.delete(`http://localhost:5000/api/applications/${id}`);

        if (res.data.success) {
          setApplications(applications.filter((app) => app._id !== id));
        } else {
          setError(res.data.message || 'Failed to delete application');
        }
      } catch (err) {
        console.error('Error deleting application:', err);
        setError(err.response?.data?.message || 'Failed to delete application');
      }
    }
  };

  const getStatusBadge = (status) => {
    let variant;
    switch (status) {
      case 'pending':
        variant = 'secondary';
        break;
      case 'reviewing':
        variant = 'primary';
        break;
      case 'shortlisted':
        variant = 'success';
        break;
      case 'rejected':
        variant = 'danger';
        break;
      case 'hired':
        variant = 'info';
        break;
      default:
        variant = 'secondary';
    }

    return (
      <Badge bg={variant} className="status-badge">
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) return <Spinner />;

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Applications</h1>
        <Button as={Link} to="/applications/new" variant="primary">
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          New Application
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      {applications.length === 0 ? (
        <Card className="text-center p-5">
          <Card.Body>
            <FontAwesomeIcon
              icon={faFileAlt}
              size="3x"
              className="mb-3 text-secondary"
            />
            <h3>No Applications Yet</h3>
            <p className="text-muted">
              You haven't submitted any job applications yet. Click the button
              below to create your first application.
            </p>
            <Button as={Link} to="/applications/new" variant="primary">
              <FontAwesomeIcon icon={faPlus} className="me-2" />
              Create Application
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row>
          {applications.map((application) => (
            <Col md={6} lg={4} key={application._id} className="mb-4">
              <Card className={`h-100 ${application.status === 'hired' ? 'border-primary' : ''}`}>
                <Card.Header className={`d-flex justify-content-between align-items-center ${application.status === 'hired' ? 'bg-primary text-white' : ''}`}>
                  <h5 className="mb-0">{application.position}</h5>
                  {getStatusBadge(application.status)}
                </Card.Header>
                <Card.Body>
                  {application.status === 'hired' && (
                    <Alert variant="primary" className="mb-3">
                      <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                      Congratulations! You've been hired for this position.

                      {application.hiredBy && (
                        <div className="mt-2 pt-2 border-top">
                          <small className="d-block mb-1">
                            <strong>HR Contact:</strong> {application.hiredBy.name}
                          </small>
                          <small className="d-block">
                            <strong>Email:</strong> <a href={`mailto:${application.hiredBy.email}`} className="text-primary">{application.hiredBy.email}</a>
                          </small>
                        </div>
                      )}
                    </Alert>
                  )}

                  {application.hiringOffers && application.hiringOffers.some(offer => offer.status === 'pending') && (
                    <Alert variant="warning" className="mb-3">
                      <FontAwesomeIcon icon={faUserTie} className="me-2" />
                      <strong>You have pending job offers!</strong>
                      <div className="mt-1">
                        <Link to={`/applications/${application._id}`} className="alert-link">
                          View and respond to offers <FontAwesomeIcon icon={faEye} className="ms-1" />
                        </Link>
                      </div>
                    </Alert>
                  )}

                  <Card.Text>
                    <strong>Department:</strong> {application.department}
                  </Card.Text>
                  <Card.Text>
                    <strong>Experience:</strong> {application.experience} years
                  </Card.Text>
                  <Card.Text>
                    <strong>Skills:</strong>{' '}
                    {application.skills.slice(0, 3).join(', ')}
                    {application.skills.length > 3 && '...'}
                  </Card.Text>
                  <Card.Text>
                    <strong>Applied:</strong>{' '}
                    {new Date(application.createdAt).toLocaleDateString()}
                  </Card.Text>
                </Card.Body>
                <Card.Footer className={`${application.status === 'hired' ? 'bg-light' : 'bg-white'}`}>
                  <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
                    <div className="w-100 w-md-auto">
                      <Button
                        as={Link}
                        to={`/applications/${application._id}`}
                        variant={application.status === 'hired' ? 'primary' : 'outline-primary'}
                        className="w-100 action-btn"
                      >
                        <FontAwesomeIcon icon={faEye} className="me-2" /> View Details
                      </Button>
                    </div>

                    <div className="d-flex gap-2 w-100 w-md-auto">
                      <Button
                        as={Link}
                        to={`/applications/${application._id}/edit`}
                        variant="outline-secondary"
                        className="flex-grow-1 flex-md-grow-0 action-btn"
                      >
                        <FontAwesomeIcon icon={faEdit} className="me-2" /> Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        onClick={() => handleDelete(application._id)}
                        className="flex-grow-1 flex-md-grow-0 action-btn"
                      >
                        <FontAwesomeIcon icon={faTrash} className="me-2" /> Delete
                      </Button>
                    </div>
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
};

export default Dashboard;