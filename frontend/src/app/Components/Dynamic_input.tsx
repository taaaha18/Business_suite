import React, { useState } from 'react';
import './CSS/DynamicInput.css';

interface DynamicInputProps {
  label: string;
  placeholder: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  required?: boolean;
  disabled?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outlined' | 'filled';
  icon?: React.ReactNode;
  className?: string;
}

const DynamicInput: React.FC<DynamicInputProps> = ({
  label,
  placeholder,
  type = 'text',
  required = false,
  disabled = false,
  value,
  onChange,
  onBlur,
  onFocus,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  icon,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [internalValue, setInternalValue] = useState(value || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInternalValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) {
      onFocus();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  const currentValue = value !== undefined ? value : internalValue;
  const hasValue = currentValue.length > 0;
  const hasError = !!error;

  const containerClasses = `
    dynamic-input-container
    ${size === 'sm' ? 'dynamic-input-sm' : ''}
    ${size === 'lg' ? 'dynamic-input-lg' : ''}
    ${variant === 'outlined' ? 'dynamic-input-outlined' : ''}
    ${variant === 'filled' ? 'dynamic-input-filled' : ''}
    ${hasError ? 'dynamic-input-error' : ''}
    ${disabled ? 'dynamic-input-disabled' : ''}
    ${isFocused ? 'dynamic-input-focused' : ''}
    ${hasValue ? 'dynamic-input-has-value' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={containerClasses}>
      <div className="dynamic-input-wrapper">
        {icon && (
          <div className="dynamic-input-icon">
            {icon}
          </div>
        )}
        
        <div className="dynamic-input-field">
          <input
            type={type}
            value={currentValue}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            disabled={disabled}
            required={required}
            className="dynamic-input"
            placeholder={isFocused ? placeholder : ''}
          />
          
          <label className="dynamic-input-label">
            {label}
            {required && <span className="dynamic-input-required">*</span>}
          </label>
        </div>
      </div>
      
      {(error || helperText) && (
        <div className="dynamic-input-helper">
          {error ? (
            <span className="dynamic-input-error-text">{error}</span>
          ) : (
            <span className="dynamic-input-helper-text">{helperText}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicInput;