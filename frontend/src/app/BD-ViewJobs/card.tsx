import React from 'react';
import './card.css';

export interface JobApplication {
  job_id: number;
  job_title: string;
  company: string;
  location?: string;
  salary_range?: string;
  job_type?: string;
  experience_level?: string;
  platform: string;
  job_url?: string;
  skills: string[];
  job_description?: string;
  key_requirements?: string;
  personal_notes?: string;
  application_status: string;
  bd_name?: string;
  skills_display?: string;
  applied_date: string;
  created_at: string;
  updated_at: string;
  bd_info?: {
    bd_id: string;
    name: string;
    email: string;
  };
}

interface JobCardProps {
  job: JobApplication;
  onEdit?: (job: JobApplication) => void;
  onDelete?: (jobId: number) => void;
  onViewDetails?: (job: JobApplication) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onEdit, onDelete, onViewDetails }) => {
  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'Applied': 'status-applied',
      'Under Review': 'status-review',
      'Interview Scheduled': 'status-interview',
      'Interview Completed': 'status-interview-completed',
      'Offer Received': 'status-offer',
      'Rejected': 'status-rejected',
      'Withdrawn': 'status-withdrawn',
      'Accepted': 'status-accepted'
    };
    return statusColors[status] || 'status-default';
  };

  const getPlatformIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      'LinkedIn': '💼',
      'Indeed': '🔍',
      'Glassdoor': '🏢',
      'AngelList': '🚀',
      'Stack Overflow Jobs': '📚',
      'GitHub Jobs': '💻',
      'Company Website': '🌐',
      'Referral': '👥',
      'Other': '📄'
    };
    return icons[platform] || '📄';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(job);
    }
  };

  return (
    <div className="job-card" onClick={handleCardClick}>
      {/* Header Section */}
      <div className="job-card-header">
        <div className="job-title-section">
          <h3 className="job-title">{job.job_title}</h3>
          <div className="company-info">
            <span className="company-name">{job.company}</span>
            {job.location && (
              <span className="location">📍 {job.location}</span>
            )}
          </div>
        </div>
        <div className="job-actions">
          <button 
            className="action-btn edit-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit && onEdit(job);
            }}
            title="Edit Job"
          >
            ✏️
          </button>
          <button 
            className="action-btn delete-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete && onDelete(job.job_id);
            }}
            title="Delete Job"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Status and Platform Row */}
      <div className="job-meta-row">
        <span className={`status-badge ${getStatusColor(job.application_status)}`}>
          {job.application_status}
        </span>
        <div className="platform-info">
          <span className="platform-icon">{getPlatformIcon(job.platform)}</span>
          <span className="platform-name">{job.platform}</span>
        </div>
      </div>

      {/* Job Details */}
      <div className="job-details">
        {job.salary_range && (
          <div className="detail-item">
            <span className="detail-label">💰 Salary:</span>
            <span className="detail-value">{job.salary_range}</span>
          </div>
        )}
        
        {job.job_type && (
          <div className="detail-item">
            <span className="detail-label">⏰ Type:</span>
            <span className="detail-value">{job.job_type}</span>
          </div>
        )}
        
        {job.experience_level && (
          <div className="detail-item">
            <span className="detail-label">📊 Level:</span>
            <span className="detail-value">{job.experience_level}</span>
          </div>
        )}
      </div>

      {/* Skills Section */}
      {job.skills && job.skills.length > 0 && (
        <div className="skills-section">
          <div className="skills-container">
            {job.skills.slice(0, 4).map((skill, index) => (
              <span key={index} className="skill-tag">
                {skill}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="skill-tag more-skills">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Description Preview */}
      {job.job_description && (
        <div className="key-requirements">
    <h4 className="section-title">Job Description</h4>
          <p className="description-text">
            {job.job_description.length > 120 
              ? `${job.job_description.substring(0, 120)}...` 
              : job.job_description
            }
          </p>

          {/* Key Requirements Section */}
{job.key_requirements && (
  <div className="key-requirements">
    <h4 className="section-title">Key Requirements</h4>
    <p className="requirements-text">
      {job.key_requirements}
    </p>
  </div>
)}

{/* Personal Notes Section */}
{job.personal_notes && (
  <div className="personal-notes">
    <h4 className="section-title">Personal Notes</h4>
    <p className="notes-text">
      {job.personal_notes}
    </p>
  </div>
)}

        </div>
      )}

      {/* Footer */}
      <div className="job-card-footer">
        <div className="bd-info">
          {job.bd_info && (
            <span className="bd-name">👤 {job.bd_info.name}</span>
          )}
        </div>
        <div className="dates-info">
          <span className="applied-date">Applied: {formatDate(job.applied_date)}</span>
          {job.job_url && (
            <a 
              href={job.job_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="job-link"
              onClick={(e) => e.stopPropagation()}
              title="View Job Posting"
            >
              🔗
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;