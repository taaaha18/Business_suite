import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import './CSS/DynamicDropdown.css';

interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface DropdownProps {
  options: DropdownOption[];
  placeholder?: string;
  width?: string;
  height?: string;
  className?: string;
  dropdownClassName?: string;
  buttonClassName?: string;
  optionClassName?: string;
  selectedOptionClassName?: string;
  disabledOptionClassName?: string;
  onSelect?: (option: DropdownOption) => void;
  defaultValue?: string;
  disabled?: boolean;
  maxHeight?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

const DynamicDropdown: React.FC<DropdownProps> = ({
  options = [],
  placeholder = "Select an option",
  width,
  height,
  className = '',
  dropdownClassName = '',
  buttonClassName = '',
  optionClassName = '',
  selectedOptionClassName = '',
  disabledOptionClassName = '',
  onSelect,
  defaultValue,
  disabled = false,
  maxHeight,
  variant = 'default',
  size = 'md'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    defaultValue ? options.find(opt => opt.value === defaultValue) || null : null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option: DropdownOption) => {
    if (option.disabled) return;
    
    setSelectedOption(option);
    setIsOpen(false);
    onSelect?.(option);
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const getButtonClasses = () => {
    const baseClasses = 'dropdown-button';
    const variantClass = `dropdown-button--${variant}`;
    const sizeClass = `dropdown-button--${size}`;
    const disabledClass = disabled ? 'dropdown-button--disabled' : '';
    
    return `${baseClasses} ${variantClass} ${sizeClass} ${disabledClass} ${buttonClassName}`.trim();
  };

  const getDropdownClasses = () => {
    const baseClasses = 'dropdown-menu';
    const variantClass = `dropdown-menu--${variant}`;
    const sizeClass = `dropdown-menu--${size}`;
    
    return `${baseClasses} ${variantClass} ${sizeClass} ${dropdownClassName}`.trim();
  };

  const getOptionClasses = (option: DropdownOption, index: number) => {
    const baseClasses = 'dropdown-option';
    const variantClass = `dropdown-option--${variant}`;
    const sizeClass = `dropdown-option--${size}`;
    const selectedClass = selectedOption?.value === option.value ? 'dropdown-option--selected' : '';
    const disabledClass = option.disabled ? 'dropdown-option--disabled' : '';
    const borderClass = index !== options.length - 1 ? 'dropdown-option--bordered' : '';
    
    let customClasses = optionClassName;
    if (selectedOption?.value === option.value && selectedOptionClassName) {
      customClasses = selectedOptionClassName;
    }
    if (option.disabled && disabledOptionClassName) {
      customClasses = disabledOptionClassName;
    }
    
    return `${baseClasses} ${variantClass} ${sizeClass} ${selectedClass} ${disabledClass} ${borderClass} ${customClasses}`.trim();
  };

  const containerStyle = {
    width: width || undefined,
    height: height || undefined,
    maxHeight: maxHeight || undefined
  };

  return (
    <div className={`dropdown-container ${className}`} ref={dropdownRef} style={containerStyle}>
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={toggleDropdown}
        disabled={disabled}
        className={getButtonClasses()}
      >
        <span className="dropdown-button__text">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          className={`dropdown-button__icon ${isOpen ? 'dropdown-button__icon--rotated' : ''}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={getDropdownClasses()}>
          {options.length === 0 ? (
            <div className="dropdown-empty">
              No options available
            </div>
          ) : (
            options.map((option, index) => (
              <button
                key={`${option.value}-${index}`}
                type="button"
                onClick={() => handleSelect(option)}
                disabled={option.disabled}
                className={getOptionClasses(option, index)}
              >
                {option.label}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default DynamicDropdown;