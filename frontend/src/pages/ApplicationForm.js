import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faPaperPlane } from '@fortawesome/free-solid-svg-icons';

const ApplicationForm = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState('');
  const [uploadError, setUploadError] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const navigate = useNavigate();

  // Validation schema
  const validationSchema = Yup.object({
    position: Yup.string().required('Position is required'),
    department: Yup.string().required('Department is required'),
    experience: Yup.number()
      .required('Experience is required')
      .min(0, 'Experience cannot be negative')
      .integer('Experience must be a whole number'),
    skills: Yup.string().required('At least one skill is required'),
    degree: Yup.string().required('Degree is required'),
    institution: Yup.string().required('Institution is required'),
    year: Yup.number()
      .required('Graduation year is required')
      .min(1950, 'Year must be after 1950')
      .max(new Date().getFullYear(), 'Year cannot be in the future')
      .integer('Year must be a whole number'),
    coverLetter: Yup.string(),
  });

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    const fileType = file.type;
    if (
      fileType !== 'application/pdf' &&
      fileType !== 'application/msword' &&
      fileType !==
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      setUploadError('Only PDF and DOC files are allowed');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size should not exceed 10MB');
      return;
    }

    setResumeFile(file);
    setUploadError(null);

    // Upload the file
    const formData = new FormData();
    formData.append('resume', file);

    setIsUploading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/applications/upload-resume',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      setResumeUrl(res.data.data.filePath);
      setIsUploading(false);
    } catch (err) {
      setUploadError('Failed to upload resume. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Submit Job Application</h2>

              <Formik
                initialValues={{
                  position: '',
                  department: '',
                  experience: '',
                  skills: '',
                  degree: '',
                  institution: '',
                  year: '',
                  coverLetter: '',
                }}
                validationSchema={validationSchema}
                onSubmit={async (values, { setSubmitting, setErrors }) => {
                  if (!resumeUrl) {
                    setUploadError('Please upload your resume');
                    setSubmitting(false);
                    return;
                  }

                  try {
                    // Format the data
                    const applicationData = {
                      position: values.position,
                      department: values.department,
                      experience: parseInt(values.experience),
                      skills: values.skills.split(',').map((skill) => skill.trim()),
                      education: {
                        degree: values.degree,
                        institution: values.institution,
                        year: parseInt(values.year),
                      },
                      resumeUrl,
                      coverLetter: values.coverLetter,
                    };

                    // Submit the application
                    await axios.post(
                      'http://localhost:5000/api/applications',
                      applicationData
                    );

                    // Redirect to dashboard
                    navigate('/dashboard');
                  } catch (err) {
                    setErrors({
                      submit:
                        err.response?.data?.message ||
                        'Failed to submit application. Please try again.',
                    });
                    setSubmitting(false);
                  }
                }}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  isSubmitting,
                }) => (
                  <Form onSubmit={handleSubmit}>
                    {errors.submit && (
                      <Alert variant="danger" className="mb-4">
                        {errors.submit}
                      </Alert>
                    )}

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Position</Form.Label>
                          <Form.Control
                            type="text"
                            name="position"
                            value={values.position}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.position && errors.position}
                            placeholder="e.g. Software Engineer"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.position}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Department</Form.Label>
                          <Form.Control
                            type="text"
                            name="department"
                            value={values.department}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.department && errors.department}
                            placeholder="e.g. Engineering"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.department}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Years of Experience</Form.Label>
                          <Form.Control
                            type="number"
                            name="experience"
                            value={values.experience}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.experience && errors.experience}
                            placeholder="e.g. 3"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.experience}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Skills</Form.Label>
                          <Form.Control
                            type="text"
                            name="skills"
                            value={values.skills}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.skills && errors.skills}
                            placeholder="e.g. React, Node.js, MongoDB"
                          />
                          <Form.Text className="text-muted">
                            Separate multiple skills with commas
                          </Form.Text>
                          <Form.Control.Feedback type="invalid">
                            {errors.skills}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <h5 className="mt-4 mb-3">Education</h5>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Highest Degree</Form.Label>
                          <Form.Control
                            type="text"
                            name="degree"
                            value={values.degree}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.degree && errors.degree}
                            placeholder="e.g. Bachelor's in Computer Science"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.degree}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Institution</Form.Label>
                          <Form.Control
                            type="text"
                            name="institution"
                            value={values.institution}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.institution && errors.institution}
                            placeholder="e.g. University of California"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.institution}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Graduation Year</Form.Label>
                          <Form.Control
                            type="number"
                            name="year"
                            value={values.year}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            isInvalid={touched.year && errors.year}
                            placeholder="e.g. 2020"
                          />
                          <Form.Control.Feedback type="invalid">
                            {errors.year}
                          </Form.Control.Feedback>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Resume</Form.Label>
                          <div className="d-flex">
                            <Form.Control
                              type="file"
                              accept=".pdf,.doc,.docx"
                              onChange={handleResumeUpload}
                              isInvalid={uploadError}
                              disabled={isUploading}
                            />
                            {isUploading && (
                              <Button variant="primary" disabled className="ms-2">
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                  aria-hidden="true"
                                ></span>
                              </Button>
                            )}
                          </div>
                          {uploadError && (
                            <div className="text-danger small mt-1">
                              {uploadError}
                            </div>
                          )}
                          {resumeFile && !uploadError && !isUploading && (
                            <div className="text-success small mt-1">
                              Resume uploaded: {resumeFile.name}
                            </div>
                          )}
                          <Form.Text className="text-muted">
                            Upload your resume (PDF or DOC, max 10MB)
                          </Form.Text>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Form.Group className="mb-4">
                      <Form.Label>Cover Letter (Optional)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={5}
                        name="coverLetter"
                        value={values.coverLetter}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        isInvalid={touched.coverLetter && errors.coverLetter}
                        placeholder="Write a brief cover letter explaining why you're a good fit for this position..."
                      />
                      <Form.Control.Feedback type="invalid">
                        {errors.coverLetter}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <div className="d-grid">
                      <Button
                        variant="primary"
                        type="submit"
                        size="lg"
                        disabled={isSubmitting || isUploading}
                      >
                        <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                        {isSubmitting ? 'Submitting...' : 'Submit Application'}
                      </Button>
                    </div>
                  </Form>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ApplicationForm; 