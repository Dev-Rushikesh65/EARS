import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Badge, Button, Alert, Form } from 'react-bootstrap';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faEdit,
  faTrash,
  faFileAlt,
  faStar,
  faDownload,
  faUser,
  faBuilding,
  faBriefcase,
  faGraduationCap,
  faEnvelope,
  faCheckCircle,
  faCalendarCheck,
  faUserTie,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import Spinner from '../components/Spinner';

const ApplicationDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hrNotes, setHrNotes] = useState('');
  const [hrRating, setHrRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApplication = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/applications/${id}`);
        setApplication(res.data.data);
        setHrNotes(res.data.data.hrNotes || '');
        setHrRating(res.data.data.hrRating || 0);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch application details');
        setLoading(false);
      }
    };

    fetchApplication();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        await axios.delete(`http://localhost:5000/api/applications/${id}`);
        navigate('/dashboard');
      } catch (err) {
        setError('Failed to delete application');
      }
    }
  };

  const handleHRReview = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await axios.put(`http://localhost:5000/api/hr/applications/${id}/review`, {
        hrNotes,
        hrRating: parseInt(hrRating),
      });
      setApplication({ ...application, ...res.data.data });
      setIsSubmitting(false);
      alert('Review saved successfully');
    } catch (err) {
      setError('Failed to save review');
      setIsSubmitting(false);
    }
  };

  const updateStatus = async (status) => {
    try {
      const notes = prompt("Add any notes about this status change (optional):");

      const res = await axios.put(`http://localhost:5000/api/hr/applications/${id}/status`, {
        status,
        notes
      });

      setApplication({ ...application, ...res.data.data });
    } catch (err) {
      console.error('Failed to update status:', err);
      setError('Failed to update status');
    }
  };

  const getHRSpecificStatus = () => {
    if (!application || !user || user.role !== 'hr') return application?.status;

    const currentUserStatusChange = application.statusChanges?.find(change =>
      change.changedBy?._id === user?._id
    );

    return currentUserStatusChange ? currentUserStatusChange.status : application.status;
  };

  const respondToOffer = async (offerId, response) => {
    try {
      setIsSubmitting(true);
      const res = await axios.put(`http://localhost:5000/api/hr/applications/${id}/offer/${offerId}`, {
        response
      });

      if (res.data.success) {
        setApplication(res.data.data);
        setError(null);
        if (response === 'accepted') {
          alert('Congratulations! You have accepted the job offer.');
        } else {
          alert('You have declined the job offer.');
        }
      }
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error responding to offer:', err);
      setError('Failed to respond to offer. Please try again.');
      setIsSubmitting(false);
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

  if (!application) {
    return (
      <Container>
        <Alert variant="danger">Application not found</Alert>
        <Button as={Link} to="/dashboard" variant="primary">
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Dashboard
        </Button>
      </Container>
    );
  }

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <Button as={Link} to="/dashboard" variant="outline-primary">
          <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
          Back to Dashboard
        </Button>
        {(user.role === 'applicant' && application.user === user._id) && (
          <div>
            <Button
              as={Link}
              to={`/applications/${id}/edit`}
              variant="outline-secondary"
              className="me-2"
            >
              <FontAwesomeIcon icon={faEdit} className="me-1" />
              Edit
            </Button>
            <Button variant="outline-danger" onClick={handleDelete}>
              <FontAwesomeIcon icon={faTrash} className="me-1" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <Card className="mb-4">
            <Card.Header className="d-flex justify-content-between align-items-center">
              <h4 className="mb-0">{application.position}</h4>
              {getStatusBadge(application.status)}
            </Card.Header>
            <Card.Body>
              <Row className="mb-4">
                <Col md={6}>
                  <p>
                    <FontAwesomeIcon icon={faBuilding} className="me-2 text-primary" />
                    <strong>Department:</strong> {application.department}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faBriefcase} className="me-2 text-primary" />
                    <strong>Experience:</strong> {application.experience} years
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faGraduationCap} className="me-2 text-primary" />
                    <strong>Education:</strong> {application.education.degree} from{' '}
                    {application.education.institution} ({application.education.year})
                  </p>
                </Col>
                <Col md={6}>
                  <p>
                    <FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
                    <strong>Applicant:</strong> {application.user?.name || 'Unknown'}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faEnvelope} className="me-2 text-primary" />
                    <strong>Email:</strong> {application.user?.email || 'Unknown'}
                  </p>
                  <p>
                    <FontAwesomeIcon icon={faFileAlt} className="me-2 text-primary" />
                    <strong>Applied:</strong>{' '}
                    {new Date(application.createdAt).toLocaleDateString()}
                  </p>
                </Col>
              </Row>

              <h5 className="mb-3">Skills</h5>
              <div className="mb-4">
                {application.skills.map((skill, index) => (
                  <Badge bg="light" text="dark" key={index} className="me-2 mb-2 p-2">
                    {skill}
                  </Badge>
                ))}
              </div>

              {application.coverLetter && (
                <>
                  <h5 className="mb-3">Cover Letter</h5>
                  <Card className="bg-light mb-4">
                    <Card.Body>
                      <p className="mb-0">{application.coverLetter}</p>
                    </Card.Body>
                  </Card>
                </>
              )}

              <div className="d-grid">
                <Button
                  variant="outline-primary"
                  href={`http://localhost:5000${application.resumeUrl}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FontAwesomeIcon icon={faDownload} className="me-2" />
                  Download Resume
                </Button>
              </div>
            </Card.Body>
          </Card>

          {application.status === 'hired' && application.hiredBy && (
            <Card className="mb-4">
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                  Application Accepted
                </h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="primary" className="mb-4">
                  <h6 className="mb-1 fw-bold">Congratulations!</h6>
                  <p className="mb-0">Your application for <strong>{application.position}</strong> has been accepted.</p>
                </Alert>

                <div className="bg-light rounded p-3">
                  <h6 className="mb-3 border-bottom pb-2 text-primary">
                    <FontAwesomeIcon icon={faUserTie} className="me-2" />
                    HR Contact Information
                  </h6>
                  <p className="mb-2">
                    <strong>Name:</strong> {application.hiredBy.name}
                  </p>
                  <p className="mb-2">
                    <strong>Email:</strong> <a href={`mailto:${application.hiredBy.email}`} className="text-primary">{application.hiredBy.email}</a>
                  </p>
                  <p className="mb-0">
                    <strong>Hiring Date:</strong> {application.statusUpdatedAt ? new Date(application.statusUpdatedAt).toLocaleDateString() : 'Not available'}
                  </p>
                </div>
              </Card.Body>
            </Card>
          )}

          {user.role === 'applicant' && application.hiringOffers && application.hiringOffers.length > 0 && (
            <Card className="mb-4 next-steps-card">
              <Card.Header className="bg-primary text-white next-steps-header">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faUserTie} className="me-2" />
                  Job Offers ({application.hiringOffers.filter(offer => offer.status === 'pending').length} Pending)
                </h5>
              </Card.Header>
              <Card.Body>
                <Alert variant="info" className="mb-4">
                  <h6 className="mb-1 fw-bold">Congratulations!</h6>
                  <p className="mb-0">You have received job offers for the position of <strong>{application.position}</strong>.</p>
                </Alert>

                {application.hiringOffers.some(offer => offer.status === 'pending') && (
                  <>
                    <h6 className="mb-3 border-bottom pb-2">
                      <FontAwesomeIcon icon={faCheckCircle} className="me-2 text-primary" />
                      Pending Offers
                    </h6>

                    <Row>
                      {application.hiringOffers.filter(offer => offer.status === 'pending').map((offer, index) => (
                        <Col md={6} key={index} className="mb-3">
                          <Card className="h-100 border-primary">
                            <Card.Header className="bg-light">
                              <h6 className="mb-0">
                                <FontAwesomeIcon icon={faUserTie} className="me-2 text-primary" />
                                Offer from {offer.hr.name}
                              </h6>
                            </Card.Header>
                            <Card.Body>
                              <p className="mb-2">
                                <strong>HR Email:</strong>{' '}
                                {offer.hr.email ? (
                                  <a href={`mailto:${offer.hr.email}`} className="text-primary">
                                    {offer.hr.email}
                                  </a>
                                ) : (
                                  <span className="text-muted">Not available</span>
                                )}
                              </p>
                              {offer.hr.department && (
                                <p className="mb-2">
                                  <strong>Department:</strong> {offer.hr.department}
                                </p>
                              )}
                              {offer.hr.position && (
                                <p className="mb-2">
                                  <strong>Position:</strong> {offer.hr.position}
                                </p>
                              )}
                              <p className="mb-2">
                                <strong>Offer Date:</strong> {new Date(offer.offerDate).toLocaleDateString()}
                              </p>
                              <p className="mb-3">
                                <strong>Job Position:</strong> {application.position} in {application.department}
                              </p>

                              <div className="d-flex gap-2 mt-3">
                                <Button
                                  variant="success"
                                  onClick={() => respondToOffer(offer._id, 'accepted')}
                                  disabled={isSubmitting}
                                  className="w-100"
                                >
                                  <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                                  Accept Offer
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  onClick={() => respondToOffer(offer._id, 'declined')}
                                  disabled={isSubmitting}
                                  className="w-100"
                                >
                                  <FontAwesomeIcon icon={faTrash} className="me-2" />
                                  Decline Offer
                                </Button>
                              </div>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </>
                )}

                {application.hiringOffers.some(offer => offer.status !== 'pending') && (
                  <>
                    <h6 className="mt-4 mb-3 border-bottom pb-2">
                      <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-primary" />
                      Responded Offers
                    </h6>

                    <Row>
                      {application.hiringOffers.filter(offer => offer.status !== 'pending').map((offer, index) => (
                        <Col md={6} key={index} className="mb-3">
                          <Card className={`h-100 border-${offer.status === 'accepted' ? 'success' : 'danger'}`}>
                            <Card.Header className={`bg-${offer.status === 'accepted' ? 'success' : 'danger'} text-white`}>
                              <h6 className="mb-0">
                                <FontAwesomeIcon icon={offer.status === 'accepted' ? faCheckCircle : faTrash} className="me-2" />
                                Offer from {offer.hr.name} - {offer.status.toUpperCase()}
                              </h6>
                            </Card.Header>
                            <Card.Body>
                              <p className="mb-2">
                                <strong>HR Email:</strong>{' '}
                                {offer.hr.email ? (
                                  <a
                                    href={`mailto:${offer.hr.email}`}
                                    className={`text-${offer.status === 'accepted' ? 'success' : 'danger'}`}
                                  >
                                    {offer.hr.email}
                                  </a>
                                ) : (
                                  <span className="text-muted">Not available</span>
                                )}
                              </p>
                              {offer.hr.department && (
                                <p className="mb-2">
                                  <strong>Department:</strong> {offer.hr.department}
                                </p>
                              )}
                              {offer.hr.position && (
                                <p className="mb-2">
                                  <strong>Position:</strong> {offer.hr.position}
                                </p>
                              )}
                              <p className="mb-2">
                                <strong>Offer Date:</strong> {new Date(offer.offerDate).toLocaleDateString()}
                              </p>
                              <p className="mb-0">
                                <strong>Response Date:</strong> {application.statusUpdatedAt ? new Date(application.statusUpdatedAt).toLocaleDateString() : 'Not available'}
                              </p>
                            </Card.Body>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </>
                )}

                <div className="mt-4 p-3 bg-light rounded">
                  <h6 className="mb-2 text-primary">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    Important Note
                  </h6>
                  <p className="mb-0 small">
                    Once you accept an offer, you will be hired for the position and all other pending offers will be automatically declined.
                  </p>
                </div>
              </Card.Body>
            </Card>
          )}

          {(user.role === 'hr' || user.role === 'admin') && application.hiringOffers && application.hiringOffers.length > 0 && (
            <Card className="mb-4 next-steps-card">
              <Card.Header className="bg-primary text-white next-steps-header">
                <h5 className="mb-0">
                  <FontAwesomeIcon icon={faUserTie} className="me-2" />
                  Hiring Interest
                </h5>
              </Card.Header>
              <Card.Body>
                <h6 className="mb-3 border-bottom pb-2">
                  <FontAwesomeIcon icon={faFileAlt} className="me-2 text-primary" />
                  Your Hiring Activity
                </h6>

                <Row>
                  {application.hiringOffers
                    .filter(offer => offer.hr._id === user._id)
                    .map((offer, index) => (
                      <Col md={12} key={index} className="mb-3">
                        <Card className="h-100 border-primary">
                          <Card.Header className="bg-primary text-white">
                            <h6 className="mb-0 d-flex justify-content-between align-items-center">
                              <span>
                                <FontAwesomeIcon icon={faUserTie} className="me-2" />
                                Your Offer
                              </span>
                              <Badge bg={
                                offer.status === 'accepted' ? 'success' :
                                  offer.status === 'declined' ? 'danger' : 'warning'
                              }>
                                {offer.status}
                              </Badge>
                            </h6>
                          </Card.Header>
                          <Card.Body>
                            <p className="mb-2">
                              <strong>Offer Date:</strong> {new Date(offer.offerDate).toLocaleDateString()}
                            </p>
                            <p className="mb-0">
                              <strong>Status:</strong> {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                              {offer.status === 'accepted' && ' - Applicant hired'}
                              {offer.status === 'declined' && ' - Applicant declined'}
                              {offer.status === 'pending' && ' - Awaiting response'}
                            </p>
                            {offer.notes && (
                              <div className="mt-3 p-2 bg-light rounded">
                                <strong>Your Notes:</strong> {offer.notes}
                              </div>
                            )}
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                </Row>

                {application.hiringOffers.some(offer => offer.hr._id !== user._id) && (
                  <div className="mt-4">
                    <h6 className="mb-3 border-bottom pb-2">
                      <FontAwesomeIcon icon={faInfoCircle} className="me-2 text-primary" />
                      Other HR Interest
                    </h6>
                    <p className="mb-0">
                      {application.hiringOffers.filter(offer => offer.hr._id !== user._id).length} other HR professional(s) have shown interest in this applicant.
                    </p>
                  </div>
                )}

                <div className="mt-4 p-3 bg-light rounded">
                  <h6 className="mb-2 text-primary">
                    <FontAwesomeIcon icon={faInfoCircle} className="me-2" />
                    Important Note
                  </h6>
                  <p className="mb-0 small">
                    Multiple HR professionals can send hiring offers to the same applicant. The applicant will choose which offer to accept.
                    Once an offer is accepted, all other offers will be automatically declined.
                  </p>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {(user.role === 'hr' || user.role === 'admin') && (
            <>
              <Card className="mb-4">
                <Card.Header>
                  <h5 className="mb-0">Application Status</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Update Status</Form.Label>
                    <Form.Select
                      value={getHRSpecificStatus()}
                      onChange={(e) => updateStatus(e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hire Applicant</option>
                    </Form.Select>
                  </Form.Group>
                </Card.Body>
              </Card>

              <Card>
                <Card.Header>
                  <h5 className="mb-0">HR Review</h5>
                </Card.Header>
                <Card.Body>
                  <Form onSubmit={handleHRReview}>
                    <Form.Group className="mb-3">
                      <Form.Label>Rating</Form.Label>
                      <div className="d-flex align-items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FontAwesomeIcon
                            key={star}
                            icon={faStar}
                            className={`me-1 ${star <= hrRating ? 'text-warning' : 'text-muted'
                              }`}
                            style={{ cursor: 'pointer', fontSize: '1.5rem' }}
                            onClick={() => setHrRating(star)}
                          />
                        ))}
                        <span className="ms-2">({hrRating}/5)</span>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        value={hrNotes}
                        onChange={(e) => setHrNotes(e.target.value)}
                        placeholder="Add your notes about this candidate..."
                      />
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Saving...' : 'Save Review'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </>
          )}

          {application.statusChanges && application.statusChanges.length > 0 && user && (user.role === 'hr' || user.role === 'admin') && (
            <div className="mt-3">
              <h6 className="mb-2 border-bottom pb-2">Your Status History</h6>
              {application.statusChanges
                .filter(change => change.changedBy._id === user._id)
                .map((change, index) => (
                  <div key={index} className="mb-2 small">
                    <Badge
                      bg={
                        change.status === 'pending' ? 'secondary' :
                          change.status === 'reviewing' ? 'primary' :
                            change.status === 'shortlisted' ? 'success' :
                              change.status === 'rejected' ? 'danger' : 'info'
                      }
                      className="me-2"
                    >
                      {change.status.charAt(0).toUpperCase() + change.status.slice(1)}
                    </Badge>
                    on {new Date(change.changedAt).toLocaleDateString()}
                    {change.notes && <div className="mt-1 ms-4 text-muted">{change.notes}</div>}
                  </div>
                ))}
            </div>
          )}

          {application.status === 'hired' && application.hiredBy && application.hiredBy._id === user._id && (
            <div className="mt-2 text-success small">
              <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
              You have hired this applicant
            </div>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ApplicationDetails; 