import React from 'react';
import { DeveloperCardProps } from './types';
import './CSS/Developer_Card.css';

// Icon components
const EmailIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const PhoneIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const LocationIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IdIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
    <line x1="8" y1="21" x2="16" y2="21"/>
    <line x1="12" y1="17" x2="12" y2="21"/>
  </svg>
);

const DeveloperCard: React.FC<DeveloperCardProps> = ({
  developer,
  onContact,
  className = ''
}) => {
  const {
    office_id,
    firstName,
    lastName,
    email,
    phone,
    location,
    professionalTitle,
    degree,
    university,
    graduationYear,
    technicalSkills,
    languages,
    experience,
    Salary,
    availability
  } = developer;

  const displayInitials = `${firstName[0]}${lastName[0]}`.toUpperCase();

  const handleContact = () => {
    if (onContact) {
      onContact(office_id);
    }
  };

  return (
    <div className={`developer-card ${className}`}>
      
      {/* Office ID Badge - Top right corner */}
      <div className="developer-card-office-id">
        <IdIcon />
        <span>ID: {office_id}</span>
      </div>

      {/* Header */}
      <div className="developer-card-header">
        <div className="developer-card-avatar-section">
          <div className="developer-card-avatar-placeholder">{displayInitials}</div>
          <div className="developer-card-basic-info">
            <h3 className="developer-card-name">{firstName} {lastName}</h3>
            <p className="developer-card-experience">{professionalTitle}</p>
          </div>
        </div>
        <div className={`developer-card-status status-${availability}`}>
          {availability}
        </div>
      </div>

      {/* Contact Info */}
      <div className="developer-card-contact">
        <div className="developer-card-contact-item">
          <EmailIcon />
          <span>{email}</span>
        </div>
        <div className="developer-card-contact-item">
          <PhoneIcon />
          <span>{phone}</span>
        </div>
        <div className="developer-card-contact-item">
          <LocationIcon />
          <span>{location}</span>
        </div>
      </div>

      {/* Education */}
      <div className="developer-card-education">
        <h4 className="developer-card-section-title">Education</h4>
        <p>{degree}, {university} ({graduationYear})</p>
      </div>

      {/* Skills */}
      <div className="developer-card-skills">
        <h4 className="developer-card-section-title">Technical Skills</h4>
        <div className="developer-card-skills-list">
          {technicalSkills && technicalSkills.length > 0 ? (
            technicalSkills.map((skill: string, index: number) => (
              <span key={index} className="developer-card-skill-tag">{skill}</span>
            ))
          ) : (
            <span className="developer-card-no-data">No skills listed</span>
          )}
        </div>
      </div>

      {/* Languages */}
      <div className="developer-card-skills">
        <h4 className="developer-card-section-title">Languages</h4>
        <div className="developer-card-skills-list">
          {languages && languages.length > 0 ? (
            languages.map((lang: string, index: number) => (
              <span key={index} className="developer-card-skill-tag">{lang}</span>
            ))
          ) : (
            <span className="developer-card-no-data">No languages listed</span>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="developer-card-stats">
        <div className="developer-card-stat">
          <span className="developer-card-stat-label">Salary</span>
          <span className="developer-card-stat-value">{Salary || 'Not specified'}</span>
        </div>
        <div className="developer-card-stat">
          <span className="developer-card-stat-label">Experience</span>
          <span className="developer-card-stat-value">{experience}</span>
        </div>
      </div>

      {/* Only Contact Button */}
      <div className="developer-card-actions">
        <button
          className="developer-card-btn developer-card-btn-primary"
          onClick={handleContact}
          title={`Contact ${firstName} ${lastName} (Office ID: ${office_id})`}
        >
          Contact
        </button>
      </div>

    </div>
  );
};

export default DeveloperCard;