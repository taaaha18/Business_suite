import React from 'react';
import './Dashboard_button.css';

interface SidebarNavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'active';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  badge?: string | number;
  href?: string;
}

const SidebarNavButton: React.FC<SidebarNavButtonProps> = ({
  icon,
  label,
  isActive = false,
  onClick,
  variant = 'default',
  size = 'md',
  className = '',
  disabled = false,
  badge,
  href,
}) => {
  const baseClasses = 'sidebar-nav-button';
  const variantClasses = isActive || variant === 'active' 
    ? 'sidebar-nav-button--active' 
    : 'sidebar-nav-button--default';
  const sizeClasses = `sidebar-nav-button--${size}`;
  const disabledClasses = disabled ? 'sidebar-nav-button--disabled' : '';
  
  const allClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} ${className}`.trim();

  const handleClick = (e: React.MouseEvent) => {
    if (!disabled && onClick) {
      // Prevent default navigation if onClick is provided
      if (href) {
        e.preventDefault();
      }
      onClick();
    }
  };

  const buttonContent = (
    <>
      <div className="sidebar-nav-button__icon">
        {icon}
      </div>
      <span className="sidebar-nav-button__label">{label}</span>
      {badge && (
        <div className="sidebar-nav-button__badge">
          {badge}
        </div>
      )}
    </>
  );

  if (href && !disabled) {
    return (
      <a
        href={href}
        className={allClasses}
        onClick={handleClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleClick(e as any);
          }
        }}
      >
        {buttonContent}
      </a>
    );
  }

  return (
    <button
      className={allClasses}
      onClick={handleClick}
      disabled={disabled}
      type="button"
      role="button"
      aria-pressed={isActive}
    >
      {buttonContent}
    </button>
  );
};

export default SidebarNavButton;