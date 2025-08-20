"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Building2, User, Briefcase, ExternalLink, Mail, Phone } from 'lucide-react';
import './card.css';

interface InterviewSchedule {
  interview_id: number;
  company_name: string;
  role: string;
  interview_date: string;
  interview_time: string;
  company_url?: string;
  created_at: string;
  updated_at: string;
  bd_info: {
    bd_id: string;
    name: string;
    email: string;
  };
  developer_info: {
    office_id: string;
    name: string;
    email: string;
    title: string;
  };
}

interface InterviewScheduleCardsProps {
  devId: string;
  apiBaseUrl?: string;
}

const InterviewScheduleCards: React.FC<InterviewScheduleCardsProps> = ({
  devId,
  apiBaseUrl = 'http://localhost:8000/api'
}) => {
  const [interviews, setInterviews] = useState<InterviewSchedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchInterviews = async () => {
      if (!devId) {
        setError('Developer ID is required');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${apiBaseUrl}/interview-schedules/developer/${encodeURIComponent(devId)}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Add authentication headers if needed
            // 'Authorization': `Bearer ${token}`,
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setInterviews(result.interview_schedules || []);
        } else {
          setError(result.message || 'Failed to fetch interview schedules');
          console.error('API Error:', result);
        }
      } catch (error) {
        setError('Network error. Please check your connection.');
        console.error('Network Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, [devId, apiBaseUrl]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    const time = new Date(`2000-01-01T${timeString}`);
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (interviewDate: string) => {
    const today = new Date();
    const interview = new Date(interviewDate);
    
    if (interview < today) {
      return 'past';
    } else if (interview.toDateString() === today.toDateString()) {
      return 'today';
    } else {
      return 'upcoming';
    }
  };

  const handleCompanyUrlClick = (url: string) => {
    if (url) {
      const formattedUrl = url.startsWith('http') ? url : `https://${url}`;
      window.open(formattedUrl, '_blank');
    }
  };

  if (loading) {
    return (
      <div className="interview-cards-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading interview schedules...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="interview-cards-container">
        <div className="error-container">
          <p className="error-message">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="interview-cards-container">
        <div className="no-interviews-container">
          <Calendar size={48} className="no-interviews-icon" />
          <h3>No Interview Schedules Found</h3>
          <p>There are no interview schedules for this developer yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="interview-cards-container">
      <div className="cards-header">
        <h2>Interview Schedules</h2>
        <span className="interview-count">{interviews.length} scheduled</span>
      </div>
      
      <div className="cards-grid">
        {interviews.map((interview) => {
          const statusColor = getStatusColor(interview.interview_date);
          
          return (
            <div key={interview.interview_id} className={`interview-card ${statusColor}`}>
              <div className="card-header">
                <div className="company-info">
                  <div className="company-name-row">
                    <Building2 size={20} className="company-icon" />
                    <h3 className="company-name">{interview.company_name}</h3>
                  </div>
                  {interview.company_url && (
                    <button
                      className="company-url-btn"
                      onClick={() => handleCompanyUrlClick(interview.company_url!)}
                      title="Visit company website"
                    >
                      <ExternalLink size={16} />
                    </button>
                  )}
                </div>
                <div className={`status-badge ${statusColor}`}>
                  {statusColor === 'past' ? 'Completed' : statusColor === 'today' ? 'Today' : 'Upcoming'}
                </div>
              </div>

              <div className="card-body">
                <div className="role-section">
                  <Briefcase size={16} className="role-icon" />
                  <span className="role-title">{interview.role}</span>
                </div>

                <div className="datetime-section">
                  <div className="datetime-item">
                    <Calendar size={16} className="datetime-icon" />
                    <span>{formatDate(interview.interview_date)}</span>
                  </div>
                  <div className="datetime-item">
                    <Clock size={16} className="datetime-icon" />
                    <span>{formatTime(interview.interview_time)}</span>
                  </div>
                </div>

                <div className="bd-info-section">
                  <div className="bd-header">
                    <User size={16} className="bd-icon" />
                    <span className="bd-label">Business Development</span>
                  </div>
                  <div className="bd-details">
                    <span className="bd-name">{interview.bd_info.name}</span>
                    <div className="bd-contact">
                      <Mail size={14} />
                      <span>{interview.bd_info.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-footer">
                <div className="interview-id">
                  Interview #{interview.interview_id}
                </div>
                <div className="created-date">
                  Scheduled: {new Date(interview.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default InterviewScheduleCards;