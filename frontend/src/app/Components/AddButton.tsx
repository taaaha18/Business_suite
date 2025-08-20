import React, { useState } from 'react';
import './CSS/AddButton.css';

interface AddClientButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  children?: React.ReactNode;
}

const AddClientButton: React.FC<AddClientButtonProps> = ({
  onClick,
  disabled = false,
  loading = false,
  size = 'medium',
  variant = 'primary',
  className = '',
  children
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleMouseDown = () => {
    setIsPressed(true);
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleMouseLeave = () => {
    setIsPressed(false);
  };

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  const buttonClasses = [
    'add-client-button',
    `add-client-button--${size}`,
    `add-client-button--${variant}`,
    disabled ? 'add-client-button--disabled' : '',
    loading ? 'add-client-button--loading' : '',
    isPressed ? 'add-client-button--pressed' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      type="button"
    >
      <span className="add-client-button__content">
        {loading ? (
          <>
            <span className="add-client-button__spinner" />
            <span className="add-client-button__text">Adding...</span>
          </>
        ) : (
          <>
            <span className="add-client-button__icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </span>
            <span className="add-client-button__text">
              {children || 'Add Client'}
            </span>
          </>
        )}
      </span>
      
      {/* Ripple effect */}
      <span className="add-client-button__ripple" />
    </button>
  );
};

export default AddClientButton;