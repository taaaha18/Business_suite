import React from 'react';
import './CSS/StatsCard.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'orange' | 'purple';
  prefix?: string;
  className?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  prefix = '',
  className = ''
}) => {
  return (
    <div className={`stats-card ${className}`}>
      <div className="stats-card-content">
        <div className="stats-card-header">
          <span className="stats-card-title">{title}</span>
        </div>
        <div className="stats-card-body">
          <span className="stats-card-value">
            {prefix}{value}
          </span>
          {icon && (
            <div className={`stats-card-icon stats-card-icon-${color}`}>
              {icon}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;