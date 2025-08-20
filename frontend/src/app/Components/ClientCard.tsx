import React from 'react';
import './CSS/ClientCard.css';

interface ClientCardProps {
  name: string;
  company: string;
  email: string;
  hourlyRate: number;
  dueDate: string;
  project: string;
  clientId: string;
  isOverdue?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({
  name,
  company,
  email,
  hourlyRate,
  dueDate,
  project,
  clientId,
  isOverdue = false,
  onEdit,
  onDelete
}) => {
  // Generate initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('');
  };

  // Generate background color based on name
  const getAvatarColor = (name: string): string => {
    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-yellow-500',
      'bg-teal-500'
    ];
    
    const index = name.length % colors.length;
    return colors[index];
  };

  return (
    <div className="client-card">
      {/* Header with avatar and overdue badge */}
      <div className="client-card-header">
        <div className="flex items-center space-x-4">
          <div className={`client-avatar ${getAvatarColor(name)}`}>
            <span className="client-initials">
              {getInitials(name)}
            </span>
          </div>
          <div className="client-info">
            <h3 className="client-name">{name}</h3>
            <p className="client-company">
              <span className="company-icon">🏢</span>
              {company}
            </p>
          </div>
        </div>
        {isOverdue && (
          <span className="overdue-badge">
            Overdue
          </span>
        )}
      </div>

      {/* Contact and rate info */}
      <div className="client-details">
        <div className="detail-item">
          <span className="detail-icon">✉️</span>
          <span className="detail-text">{email}</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">💰</span>
          <span className="detail-text">${hourlyRate}/hour</span>
        </div>
        <div className="detail-item">
          <span className="detail-icon">📅</span>
          <span className="detail-text">Due: {dueDate}</span>
        </div>
      </div>

      {/* Project info */}
      <div className="project-section">
        <h4 className="project-title">Project</h4>
        <p className="project-name">{project}</p>
        <p className="client-id">Client ID: {clientId}</p>
      </div>

      {/* Action buttons */}
      <div className="card-actions">
        <button 
          className="edit-button"
          onClick={onEdit}
        >
          <span className="button-icon">✏️</span>
          Edit
        </button>
        <button 
          className="delete-button"
          onClick={onDelete}
        >
          <span className="button-icon">🗑️</span>
        </button>
      </div>
    </div>
  );
};

export default ClientCard;