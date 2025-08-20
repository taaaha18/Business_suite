import React from 'react';
import './CSS/DynamicButton.css';

interface DynamicButtonProps {
  text: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  width?: 'auto' | 'full' | 'fit' | string;
  height?: 'sm' | 'md' | 'lg' | 'xl' | string;
  color?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'dark' | 'light' | string;
  variant?: 'solid' | 'outline' | 'ghost' | 'gradient';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  rounded?: 'none' | 'sm' | 'md' | 'lg' | 'full';
  shadow?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  className?: string;
  style?: React.CSSProperties;
}

const DynamicButton: React.FC<DynamicButtonProps> = ({
  text,
  onClick,
  type = 'button',
  disabled = false,
  loading = false,
  width = 'auto',
  height = 'md',
  color = 'primary',
  variant = 'solid',
  size = 'md',
  rounded = 'md',
  shadow = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  style = {},
}) => {
  // Generate class names based on props
  const buttonClasses = `
    dynamic-button
    dynamic-button-${variant}
    dynamic-button-${color}
    dynamic-button-size-${size}
    dynamic-button-rounded-${rounded}
    dynamic-button-shadow-${shadow}
    ${width === 'full' ? 'dynamic-button-width-full' : ''}
    ${width === 'fit' ? 'dynamic-button-width-fit' : ''}
    ${disabled ? 'dynamic-button-disabled' : ''}
    ${loading ? 'dynamic-button-loading' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Generate inline styles for custom dimensions and colors
  const inlineStyles: React.CSSProperties = {
    ...style,
  };

  // Handle custom width
  if (width && !['auto', 'full', 'fit'].includes(width)) {
    inlineStyles.width = width;
  }

  // Handle custom height
  if (height && !['sm', 'md', 'lg', 'xl'].includes(height)) {
    inlineStyles.height = height;
  } else {
    // Apply predefined height classes
    const heightClass = `dynamic-button-height-${height}`;
    inlineStyles.minHeight = getHeightValue(height);
  }

  // Handle custom color (hex, rgb, etc.)
  if (color && !['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'dark', 'light'].includes(color)) {
    if (variant === 'solid') {
      inlineStyles.backgroundColor = color;
      inlineStyles.borderColor = color;
      inlineStyles.color = getContrastColor(color);
    } else if (variant === 'outline') {
      inlineStyles.borderColor = color;
      inlineStyles.color = color;
    }
  }

  const handleClick = () => {
    if (!disabled && !loading && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      className={buttonClasses}
      style={inlineStyles}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      {/* Loading Spinner */}
      {loading && (
        <div className="dynamic-button-spinner">
          <div className="dynamic-button-spinner-circle"></div>
        </div>
      )}

      {/* Button Content */}
      <div className={`dynamic-button-content ${loading ? 'dynamic-button-content-loading' : ''}`}>
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <span className="dynamic-button-icon dynamic-button-icon-left">
            {icon}
          </span>
        )}

        {/* Button Text */}
        <span className="dynamic-button-text">{text}</span>

        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <span className="dynamic-button-icon dynamic-button-icon-right">
            {icon}
          </span>
        )}
      </div>
    </button>
  );
};

// Helper function to get height values
const getHeightValue = (height: string): string => {
  const heightMap: Record<string, string> = {
    sm: '2rem',
    md: '2.5rem',
    lg: '3rem',
    xl: '3.5rem',
  };
  return heightMap[height] || '2.5rem';
};

// Helper function to determine contrasting text color
const getContrastColor = (backgroundColor: string): string => {
  // Simple contrast detection - you might want to use a more sophisticated method
  const color = backgroundColor.replace('#', '');
  const r = parseInt(color.substr(0, 2), 16);
  const g = parseInt(color.substr(2, 2), 16);
  const b = parseInt(color.substr(4, 2), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#000000' : '#ffffff';
};

export default DynamicButton;