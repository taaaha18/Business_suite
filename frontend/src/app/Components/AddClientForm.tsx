import React, { useState, useRef, useEffect } from 'react';
import './CSS/AddClientForm.css';

// Interfaces
interface ClientFormData {
  clientId: string;
  clientName: string;
  companyName: string;
  email: string;
  hourlyRate: string;
  projectDeadline: string;
  projectName: string;
}

interface Client {
  name: string;
  company: string;
  email: string;
  hourlyRate: number;
  dueDate: string;
  project: string;
  clientId: string;
  isOverdue: boolean;
}

interface ClientResponse {
  id: number;
  client_id: string;
  client_name: string;
  company_name: string;
  email: string;
  hourly_rate: number;
  project_deadline: string;
  project_name: string;
  created_at: string;
  updated_at: string;
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ClientFormData) => void;
  isLoading?: boolean;
  initialData?: Client | null;
}

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// API Functions
const createClientAPI = async (clientData: ClientFormData): Promise<ClientResponse> => {
  const response = await fetch(`${API_BASE_URL}/clients/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientData.clientId,
      client_name: clientData.clientName,
      company_name: clientData.companyName,
      email: clientData.email,
      hourly_rate: parseFloat(clientData.hourlyRate),
      project_deadline: clientData.projectDeadline,
      project_name: clientData.projectName,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const updateClientAPI = async (clientData: ClientFormData): Promise<ClientResponse> => {
  const response = await fetch(`${API_BASE_URL}/clients/${clientData.clientId}/`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: clientData.clientId,
      client_name: clientData.clientName,
      company_name: clientData.companyName,
      email: clientData.email,
      hourly_rate: parseFloat(clientData.hourlyRate),
      project_deadline: clientData.projectDeadline,
      project_name: clientData.projectName,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const AddClientModal: React.FC<AddClientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null
}) => {
  const [formData, setFormData] = useState<ClientFormData>({
    clientId: '',
    clientName: '',
    companyName: '',
    email: '',
    hourlyRate: '',
    projectDeadline: '',
    projectName: ''
  });

  const [errors, setErrors] = useState<Partial<ClientFormData>>({});
  const [focusedField, setFocusedField] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!initialData;

  // Populate form with initial data when editing
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Edit mode - populate with existing data
        setFormData({
          clientId: String(initialData.clientId || ''),
          clientName: String(initialData.name || ''),
          companyName: String(initialData.company || ''),
          email: String(initialData.email || ''),
          hourlyRate: String(initialData.hourlyRate || ''),
          projectDeadline: String(initialData.dueDate || ''),
          projectName: String(initialData.project || '')
        });
      } else {
        // Add mode - generate new ID
        const nextId = `CL-${String(Date.now()).slice(-3).padStart(3, '0')}`;
        setFormData({
          clientId: nextId,
          clientName: '',
          companyName: '',
          email: '',
          hourlyRate: '',
          projectDeadline: '',
          projectName: ''
        });
      }
      // Clear any previous errors
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleInputChange = (field: keyof ClientFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleFocus = (field: string) => {
    setFocusedField(field);
  };

  const handleBlur = () => {
    setFocusedField('');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ClientFormData> = {};

    // Convert to string and trim safely
    const clientId = String(formData.clientId || '').trim();
    const clientName = String(formData.clientName || '').trim();
    const companyName = String(formData.companyName || '').trim();
    const email = String(formData.email || '').trim();
    const hourlyRate = String(formData.hourlyRate || '').trim();
    const projectDeadline = String(formData.projectDeadline || '').trim();
    const projectName = String(formData.projectName || '').trim();

    if (!clientId) newErrors.clientId = 'Client ID is required';
    if (!clientName) newErrors.clientName = 'Client name is required';
    if (!companyName) newErrors.companyName = 'Company name is required';
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!hourlyRate) {
      newErrors.hourlyRate = 'Hourly rate is required';
    } else if (isNaN(Number(hourlyRate)) || Number(hourlyRate) < 0) {
      newErrors.hourlyRate = 'Please enter a valid hourly rate';
    }
    if (!projectDeadline) newErrors.projectDeadline = 'Project deadline is required';
    if (!projectName) newErrors.projectName = 'Project name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log(`${isEditMode ? 'Updating' : 'Creating'} client:`, formData);
      
      let response: ClientResponse;
      
      if (isEditMode) {
        // Update existing client
        response = await updateClientAPI(formData);
        console.log("Client updated successfully:", response);
        alert(`Client "${formData.clientName}" has been updated successfully!`);
      } else {
        // Create new client
        response = await createClientAPI(formData);
        console.log("Client created successfully:", response);
        alert(`Client "${formData.clientName}" has been added successfully!`);
      }
      
      // Call the parent's onSubmit with the form data
      onSubmit(formData);
      
      // Reset form and close modal
      resetForm();
      onClose();
      
    } catch (error) {
      console.error(`Error ${isEditMode ? 'updating' : 'adding'} client:`, error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Unknown error occurred";
        
      alert(`Error ${isEditMode ? 'updating' : 'adding'} client: ${errorMessage}. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      clientName: '',
      companyName: '',
      email: '',
      hourlyRate: '',
      projectDeadline: '',
      projectName: ''
    });
    setErrors({});
    setFocusedField('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleBackdropClick}>
      <div className="modal-container" ref={modalRef}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditMode ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button 
            className="modal-close-button"
            onClick={handleClose}
            type="button"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="modal-content">
          <h3 className="form-title">
            {isEditMode ? 'Edit Client Details' : 'Add New Client'}
          </h3>
          
          <form onSubmit={handleSubmit} className="client-form">
            {/* Row 1: Client ID and Client Name */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Client ID</label>
                <input
                  ref={firstInputRef}
                  type="text"
                  className={`form-input ${focusedField === 'clientId' ? 'form-input--focused' : ''} ${errors.clientId ? 'form-input--error' : ''}`}
                  value={formData.clientId}
                  onChange={(e) => handleInputChange('clientId', e.target.value)}
                  onFocus={() => handleFocus('clientId')}
                  onBlur={handleBlur}
                  placeholder="CL-001"
                  readOnly={isEditMode} // Make ID readonly in edit mode
                  style={isEditMode ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}
                />
                {errors.clientId && <span className="form-error">{errors.clientId}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Client Name</label>
                <input
                  type="text"
                  className={`form-input ${focusedField === 'clientName' ? 'form-input--focused' : ''} ${errors.clientName ? 'form-input--error' : ''}`}
                  value={formData.clientName}
                  onChange={(e) => handleInputChange('clientName', e.target.value)}
                  onFocus={() => handleFocus('clientName')}
                  onBlur={handleBlur}
                  placeholder="John Doe"
                />
                {errors.clientName && <span className="form-error">{errors.clientName}</span>}
              </div>
            </div>

            {/* Row 2: Company Name and Email */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  className={`form-input ${focusedField === 'companyName' ? 'form-input--focused' : ''} ${errors.companyName ? 'form-input--error' : ''}`}
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  onFocus={() => handleFocus('companyName')}
                  onBlur={handleBlur}
                  placeholder="Tech Corp Inc."
                />
                {errors.companyName && <span className="form-error">{errors.companyName}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-input ${focusedField === 'email' ? 'form-input--focused' : ''} ${errors.email ? 'form-input--error' : ''}`}
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  onFocus={() => handleFocus('email')}
                  onBlur={handleBlur}
                  placeholder="john@techcorp.com"
                />
                {errors.email && <span className="form-error">{errors.email}</span>}
              </div>
            </div>

            {/* Row 3: Hourly Rate and Project Deadline */}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Hourly Rate ($)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={`form-input ${focusedField === 'hourlyRate' ? 'form-input--focused' : ''} ${errors.hourlyRate ? 'form-input--error' : ''}`}
                  value={formData.hourlyRate}
                  onChange={(e) => handleInputChange('hourlyRate', e.target.value)}
                  onFocus={() => handleFocus('hourlyRate')}
                  onBlur={handleBlur}
                  placeholder="0"
                />
                {errors.hourlyRate && <span className="form-error">{errors.hourlyRate}</span>}
              </div>
              
              <div className="form-group">
                <label className="form-label">Project Deadline</label>
                <div className="date-input-wrapper">
                  <input
                    type="date"
                    className={`form-input form-input--date ${focusedField === 'projectDeadline' ? 'form-input--focused' : ''} ${errors.projectDeadline ? 'form-input--error' : ''}`}
                    value={formData.projectDeadline}
                    onChange={(e) => handleInputChange('projectDeadline', e.target.value)}
                    onFocus={() => handleFocus('projectDeadline')}
                    onBlur={handleBlur}
                  />
                </div>
                {errors.projectDeadline && <span className="form-error">{errors.projectDeadline}</span>}
              </div>
            </div>

            {/* Row 4: Project Name */}
            <div className="form-group form-group--full">
              <label className="form-label">Project Name</label>
              <input
                type="text"
                className={`form-input ${focusedField === 'projectName' ? 'form-input--focused' : ''} ${errors.projectName ? 'form-input--error' : ''}`}
                value={formData.projectName}
                onChange={(e) => handleInputChange('projectName', e.target.value)}
                onFocus={() => handleFocus('projectName')}
                onBlur={handleBlur}
                placeholder="E-commerce Website Development"
              />
              {errors.projectName && <span className="form-error">{errors.projectName}</span>}
            </div>

            {/* Form Actions */}
            <div className="form-actions">
              <button
                type="submit"
                className="btn btn--primary"
                disabled={isSubmitting || isLoading}
              >
                {(isSubmitting || isLoading) ? (
                  <>
                    <span className="btn-spinner"></span>
                    {isEditMode ? 'Updating Client...' : 'Adding Client...'}
                  </>
                ) : (
                  isEditMode ? 'Update Client' : 'Add Client'
                )}
              </button>
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleClose}
                disabled={isSubmitting || isLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddClientModal;