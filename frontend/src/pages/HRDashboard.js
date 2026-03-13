import React, { useState, useEffect, useContext } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Badge,
  Alert,
  Tabs,
  Tab,
} from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faSearch,
  faFilter,
  faEye,
  faStar,
  faChartBar,
  faFileAlt,
  faUserTie,
  faBuilding,
  faCheckCircle,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import Spinner from '../components/Spinner';
import AuthContext from '../context/AuthContext';

const HRDashboard = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('applications');

  // Filter states
  const [filters, setFilters] = useState({
    skills: '',
    minExperience: '',
    department: '',
    position: '',
    education: '',
    status: '',
    minRating: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/hr/applications/sort', {
          params: filters,
        });
        console.log('Applications data:', res.data.data);
        setApplications(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to fetch applications');
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/hr/stats');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      }
    };

    fetchApplications();
    fetchStats();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const resetFilters = () => {
    setFilters({
      skills: '',
      minExperience: '',
      department: '',
      position: '',
      education: '',
      status: '',
      minRating: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
  };

  const updateApplicationStatus = async (id, status) => {
    try {
      // No need to check if the applicant is already hired by another HR
      const res = await axios.put(`http://localhost:5000/api/hr/applications/${id}/status`, {
        status,
      });

      if (res.data.success) {
        // Update the application in the state
        setApplications(
          applications.map((app) =>
            app._id === id ? { ...app, ...res.data.data } : app
          )
        );

        // Show success message if hiring
        if (status === 'hired') {
          setError(null); // Clear any previous errors
          alert('Hiring offer sent to the applicant. They will be notified to accept or decline.');
        }
      }
    } catch (err) {
      console.error('Error updating status:', err);
      setError('Failed to update application status');
    }
  };

  const getStatusBadge = (status, hiredBy, hiringOffers = [], statusChanges = []) => {
    // Find the current HR's status change if it exists
    const currentUserStatusChange = statusChanges?.find(change =>
      change.changedBy?._id === user?._id
    );

    // Use the HR-specific status if available, otherwise use the global status
    const displayStatus = currentUserStatusChange ? currentUserStatusChange.status : status;

    let variant;
    let statusText = displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1);

    switch (displayStatus) {
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

    // Find the current HR's offer if it exists
    const currentUserOffer = hiringOffers?.find(offer => offer.hr?._id === user?._id);

    return (
      <div>
        <Badge bg={variant} className="status-badge px-3 py-2">
          {statusText}
        </Badge>

        {currentUserStatusChange && currentUserStatusChange.status !== status && (
          <div className="mt-2 small text-primary">
            <FontAwesomeIcon icon={faInfoCircle} className="me-1" />
            Global status: {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        )}

        {currentUserOffer && (
          <div className="mt-2 small">
            <Badge bg={
              currentUserOffer.status === 'accepted' ? 'success' :
                currentUserOffer.status === 'declined' ? 'danger' : 'warning'
            } className="px-2 py-1">
              Your offer: {currentUserOffer.status}
            </Badge>
          </div>
        )}
      </div>
    );
  };

  const renderStatsCards = () => {
    if (!stats) return <Spinner />;

    return (
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body className="text-center p-4">
              <FontAwesomeIcon
                icon={faFileAlt}
                size="2x"
                className="mb-3 text-primary"
              />
              <h3>{stats.totalApplications}</h3>
              <p className="mb-0">Total Applications</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body className="text-center p-4">
              <FontAwesomeIcon
                icon={faUserTie}
                size="2x"
                className="mb-3 text-success"
              />
              <h3>{stats.byStatus?.shortlisted || 0}</h3>
              <p className="mb-0">Shortlisted</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body className="text-center p-4">
              <FontAwesomeIcon
                icon={faBuilding}
                size="2x"
                className="mb-3 text-info"
              />
              <h3>{stats.byDepartment?.length || 0}</h3>
              <p className="mb-0">Departments</p>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stats-card">
            <Card.Body className="text-center p-4">
              <FontAwesomeIcon
                icon={faCheckCircle}
                size="2x"
                className="mb-3 text-warning"
              />
              <h3>{stats.byStatus?.hired || 0}</h3>
              <p className="mb-0">Hired</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  const renderApplicationsTable = () => {
    if (loading) return <Spinner />;

    if (applications.length === 0) {
      return (
        <Card className="text-center p-5">
          <Card.Body>
            <FontAwesomeIcon
              icon={faSearch}
              size="3x"
              className="mb-3 text-secondary"
            />
            <h3>No Applications Found</h3>
            <p className="text-muted">
              No applications match your current filters. Try adjusting your search criteria.
            </p>
            <Button variant="primary" onClick={resetFilters}>
              Reset Filters
            </Button>
          </Card.Body>
        </Card>
      );
    }

    return (
      <Table responsive hover className="align-middle hr-table">
        <thead>
          <tr>
            <th>Applicant</th>
            <th>Position</th>
            <th>Department</th>
            <th>Experience</th>
            <th>Skills</th>
            <th>Status</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((application) => (
            <tr key={application._id}>
              <td>
                {application.user?.name || 'Unknown'}
                <div className="text-muted small">
                  {application.user?.email || 'No email'}
                </div>
              </td>
              <td>{application.position}</td>
              <td>{application.department}</td>
              <td>{application.experience} years</td>
              <td>
                {application.skills.slice(0, 3).map((skill, index) => (
                  <Badge bg="light" text="dark" key={index} className="me-1">
                    {skill}
                  </Badge>
                ))}
                {application.skills.length > 3 && (
                  <Badge bg="secondary">+{application.skills.length - 3}</Badge>
                )}
              </td>
              <td>{getStatusBadge(application.status, application.hiredBy, application.hiringOffers, application.statusChanges)}</td>
              <td>
                {application.hrRating ? (
                  <div className="d-flex align-items-center">
                    <span className="me-1">{application.hrRating}</span>
                    <FontAwesomeIcon icon={faStar} className="text-warning" />
                  </div>
                ) : (
                  <span className="text-muted">Not rated</span>
                )}
              </td>
              <td>
                <div className="d-flex flex-column">
                  <div className="d-flex align-items-center mb-2">
                    <Button
                      as={Link}
                      to={`/applications/${application._id}`}
                      variant="outline-primary"
                      size="sm"
                      className="me-2 action-btn"
                      title="View Details"
                    >
                      <FontAwesomeIcon icon={faEye} className="me-1" /> View
                    </Button>

                    <Form.Select
                      size="sm"
                      style={{ width: '150px' }}
                      value={application.status}
                      onChange={(e) => updateApplicationStatus(application._id, e.target.value)}
                      className="status-select"
                    >
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hire Applicant</option>
                    </Form.Select>
                  </div>

                  {application.status === 'hired' && application.hiredBy && application.hiredBy._id === user?._id && (
                    <div className="small text-success">
                      <FontAwesomeIcon icon={faCheckCircle} className="me-1" />
                      You hired this applicant
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <Container fluid>
      <h1 className="mb-4">HR Dashboard</h1>

      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-4"
      >
        <Tab eventKey="applications" title="Applications">
          <Card className="mb-4 filter-card">
            <Card.Header>
              <h5 className="mb-0 text-primary">
                <FontAwesomeIcon icon={faFilter} className="me-2" />
                Filter Applications
              </h5>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Skills</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. React, Node.js"
                      name="skills"
                      value={filters.skills}
                      onChange={handleFilterChange}
                    />
                    <Form.Text className="text-muted">
                      Separate multiple skills with commas
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Min. Experience (years)</Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="e.g. 2"
                      name="minExperience"
                      value={filters.minExperience}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Department</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Engineering"
                      name="department"
                      value={filters.department}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Position</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Software Engineer"
                      name="position"
                      value={filters.position}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Education</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g. Bachelor's"
                      name="education"
                      value={filters.education}
                      onChange={handleFilterChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      name="status"
                      value={filters.status}
                      onChange={handleFilterChange}
                    >
                      <option value="">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="shortlisted">Shortlisted</option>
                      <option value="rejected">Rejected</option>
                      <option value="hired">Hired</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Min. Rating</Form.Label>
                    <Form.Select
                      name="minRating"
                      value={filters.minRating}
                      onChange={handleFilterChange}
                    >
                      <option value="">Any Rating</option>
                      <option value="1">1+ Star</option>
                      <option value="2">2+ Stars</option>
                      <option value="3">3+ Stars</option>
                      <option value="4">4+ Stars</option>
                      <option value="5">5 Stars</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Sort By</Form.Label>
                    <div className="d-flex">
                      <Form.Select
                        name="sortBy"
                        value={filters.sortBy}
                        onChange={handleFilterChange}
                        className="me-2"
                      >
                        <option value="createdAt">Date Applied</option>
                        <option value="experience">Experience</option>
                        <option value="hrRating">Rating</option>
                      </Form.Select>
                      <Form.Select
                        name="sortOrder"
                        value={filters.sortOrder}
                        onChange={handleFilterChange}
                      >
                        <option value="desc">Descending</option>
                        <option value="asc">Ascending</option>
                      </Form.Select>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
              <div className="d-flex justify-content-end">
                <Button variant="primary" onClick={resetFilters} className="me-2">
                  Reset Filters
                </Button>
                <Button variant="primary">
                  <FontAwesomeIcon icon={faSearch} className="me-2" />
                  Apply Filters
                </Button>
              </div>
            </Card.Body>
          </Card>

          {renderApplicationsTable()}
        </Tab>
        <Tab eventKey="analytics" title="Analytics">
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <FontAwesomeIcon icon={faChartBar} className="me-2" />
                Application Analytics
              </h5>
            </Card.Header>
            <Card.Body>
              {renderStatsCards()}

              <Row>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header>Applications by Status</Card.Header>
                    <Card.Body>
                      {stats && (
                        <Table>
                          <thead>
                            <tr>
                              <th>Status</th>
                              <th>Count</th>
                              <th>Percentage</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(stats.byStatus || {}).map(
                              ([status, count]) => (
                                <tr key={status}>
                                  <td>{getStatusBadge(status)}</td>
                                  <td>{count}</td>
                                  <td>
                                    {Math.round(
                                      (count / stats.totalApplications) * 100
                                    )}
                                    %
                                  </td>
                                </tr>
                              )
                            )}
                          </tbody>
                        </Table>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-4">
                    <Card.Header>Applications by Department</Card.Header>
                    <Card.Body>
                      {stats && (
                        <Table>
                          <thead>
                            <tr>
                              <th>Department</th>
                              <th>Count</th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.byDepartment &&
                              stats.byDepartment.map((dept) => (
                                <tr key={dept._id}>
                                  <td>{dept._id || 'Unknown'}</td>
                                  <td>{dept.count}</td>
                                </tr>
                              ))}
                          </tbody>
                        </Table>
                      )}
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      <style jsx>{`
        .status-select {
          border-radius: var(--border-radius);
          border: 1px solid #ddd;
          transition: all 0.3s ease;
        }
        
        .status-select:focus {
          box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
          border-color: var(--secondary-color);
        }
      `}</style>
    </Container>
  );
};

export default HRDashboard; 