import React, { useState } from 'react';
import { ArrowLeft, Briefcase, Plus, X, Save, AlertCircle, CheckCircle } from 'lucide-react';
import './form.css';

interface JobApplicationData {
  jobTitle: string;
  company: string;
  location: string;
  salaryRange: string;
  jobType: string;
  experienceLevel: string;
  platform: string;
  jobUrl: string;
  skills: string[];
  jobDescription: string;
  keyRequirements: string;
  personalNotes: string;
  bdId: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const JobApplicationForm = () => {
  const [formData, setFormData] = useState<JobApplicationData>({
    jobTitle: '',
    company: '',
    location: '',
    salaryRange: '',
    jobType: '',
    experienceLevel: '',
    platform: '',
    jobUrl: '',
    skills: [],
    jobDescription: '',
    keyRequirements: '',
    personalNotes: '',
    bdId: ''
  });

  const [currentSkill, setCurrentSkill] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  // Dropdown options
  const jobTypeOptions = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Internship',
    'Remote',
    'Hybrid'
  ];

  const experienceLevelOptions = [
    'Entry Level',
    'Junior (1-2 years)',
    'Mid-Level (3-5 years)',
    'Senior (5+ years)',
    'Lead/Principal',
    'Executive'
  ];

  const platformOptions = [
    'LinkedIn',
    'Indeed',
    'Glassdoor',
    'AngelList',
    'Stack Overflow Jobs',
    'GitHub Jobs',
    'Company Website',
    'Referral',
    'Other'
  ];

  const handleInputChange = (field: keyof JobApplicationData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if ((errors as any)[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const addSkill = () => {
    if (currentSkill.trim() && !formData.skills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, currentSkill.trim()]
      }));
      setCurrentSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Required fields validation
    if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    if (!formData.platform.trim()) newErrors.platform = 'Platform is required';

    // URL validation
    if (formData.jobUrl && formData.jobUrl.trim()) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(formData.jobUrl)) {
        newErrors.jobUrl = 'Please enter a valid URL (starting with http:// or https://)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveJobApplication = async () => {
    if (!validateForm()) {
      setMessage({ type: 'error', text: 'Please fix the errors below' });
      return;
    }

    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${API_BASE_URL}/job-applications/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        setMessage({
          type: 'success',
          text: data.message || 'Job application saved successfully!',
        });
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save job application' });
      }
    } catch (error) {
      console.error('Error saving job application:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
      setFormData({
        jobTitle: '',
        company: '',
        location: '',
        salaryRange: '',
        jobType: '',
        experienceLevel: '',
        platform: '',
        jobUrl: '',
        skills: [],
        jobDescription: '',
        keyRequirements: '',
        personalNotes: '',
        bdId: ''
      });
      setErrors({});
      setMessage({ type: '', text: '' });
    }
  };

  return (
    <div className="job-application-container">
      <div className="job-application-form">
        {/* Header */}
        <div className="form-header">
          <button className="back-button" onClick={() => window.history.back()}>
            <ArrowLeft size={20} />
          </button>
          <div className="header-content">
            <h1>Add New Job Application</h1>
            <p>Add a new job opportunity to your pipeline</p>
          </div>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`message ${message.type}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
            <span>{message.text}</span>
          </div>
        )}

        <div className="form-content">
          {/* Basic Information Section */}
          <section className="form-section">
            <div className="section-header">
              <div className="section-icon">
                <Briefcase size={24} />
              </div>
              <h2>Basic Information</h2>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="required">Job Title</label>
                <input
                  type="text"
                  placeholder="e.g. Senior React Developer"
                  value={formData.jobTitle}
                  onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                  className={errors.jobTitle ? 'error' : ''}
                />
                {errors.jobTitle && <span className="error-message">{errors.jobTitle}</span>}
              </div>

              <div className="form-group">
                <label className="required">Company</label>
                <input
                  type="text"
                  placeholder="e.g. TechCorp Inc"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className={errors.company ? 'error' : ''}
                />
                {errors.company && <span className="error-message">{errors.company}</span>}
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g. New York, NY or Remote"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Salary Range</label>
                <input
                  type="text"
                  placeholder="e.g. $80,000 - $100,000"
                  value={formData.salaryRange}
                  onChange={(e) => handleInputChange('salaryRange', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Job Type</label>
                <select
                  value={formData.jobType}
                  onChange={(e) => handleInputChange('jobType', e.target.value)}
                  className="select-field"
                >
                  <option value="">Select job type</option>
                  {jobTypeOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Experience Level</label>
                <select
                  value={formData.experienceLevel}
                  onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                  className="select-field"
                >
                  <option value="">Select experience level</option>
                  {experienceLevelOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Source Information Section */}
          <section className="form-section">
            <h2>Source Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label className="required">Platform</label>
                <select
                  value={formData.platform}
                  onChange={(e) => handleInputChange('platform', e.target.value)}
                  className={`select-field ${errors.platform ? 'error' : ''}`}
                >
                  <option value="">Where did you find this job?</option>
                  {platformOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
                {errors.platform && <span className="error-message">{errors.platform}</span>}
              </div>

              <div className="form-group">
                <label>Job URL</label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.jobUrl}
                  onChange={(e) => handleInputChange('jobUrl', e.target.value)}
                  className={errors.jobUrl ? 'error' : ''}
                />
                {errors.jobUrl && <span className="error-message">{errors.jobUrl}</span>}
              </div>
            </div>
          </section>

          {/* Required Skills Section */}
          <section className="form-section">
            <h2>Required Skills</h2>
            <div className="skills-input">
              <input
                type="text"
                placeholder="Add a skill (e.g. React, JavaScript)"
                value={currentSkill}
                onChange={(e) => setCurrentSkill(e.target.value)}
                onKeyPress={handleKeyPress}
                className="skill-input"
              />
              <button
                type="button"
                onClick={addSkill}
                className="add-skill-button"
                disabled={!currentSkill.trim()}
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="skills-list">
              {formData.skills.map((skill, index) => (
                <div key={index} className="skill-tag">
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="remove-skill"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Job Details Section */}
          <section className="form-section">
            <h2>Job Details</h2>
            <div className="form-group">
              <label>Job Description</label>
              <textarea
                placeholder="Paste the job description here..."
                value={formData.jobDescription}
                onChange={(e) => handleInputChange('jobDescription', e.target.value)}
                rows={6}
                className="textarea-field"
              />
            </div>

            <div className="form-group">
              <label>Key Requirements</label>
              <textarea
                placeholder="List the key requirements for this position..."
                value={formData.keyRequirements}
                onChange={(e) => handleInputChange('keyRequirements', e.target.value)}
                rows={4}
                className="textarea-field"
              />
            </div>

            <div className="form-group">
              <label>Personal Notes</label>
              <textarea
                placeholder="Add your personal notes about this opportunity..."
                value={formData.personalNotes}
                onChange={(e) => handleInputChange('personalNotes', e.target.value)}
                rows={4}
                className="textarea-field"
              />
            </div>
          </section>

          {/* BD-ID Section */}
          <section className="form-section">
            <h2>BD Information</h2>
            <div className="form-group">
              <label>BD-ID</label>
              <input
                type="text"
                placeholder="Enter BD ID"
                value={formData.bdId}
                onChange={(e) => handleInputChange('bdId', e.target.value)}
              />
            </div>
          </section>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-button"
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={saveJobApplication}
            className="submit-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                Add Job Application
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobApplicationForm;
