import React, { useState, useRef, useEffect } from "react";
import "./CSS/AddClientForm.css";

// Interfaces
interface BDFormData {
  bdId: string;
  name: string;
  password: string;
  email: string;
  salary: string;
}

interface BDResponse {
  BD_id: string;  // Changed to match Django response
  name: string;
  password?: string;  // Optional since it might be excluded
  email: string;
  salary: string;
  phone?: string;
  location?: string;
  education?: string;
  experience?: string;
  availability?: string;
  created_at: string;
  updated_at: string;
  full_name?: string;
}

interface AddBDModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BDFormData) => void;
  isLoading?: boolean;
  initialData?: BDFormData | null;
}

// API Configuration
const API_BASE_URL = "http://localhost:8000/api";

// API Functions
const createBDAPI = async (bdData: BDFormData): Promise<BDResponse> => {
  const requestData = {
    BD_id: bdData.bdId,  // Use BD_id to match Django model
    name: bdData.name,
    password: bdData.password,
    email: bdData.email,
    salary: bdData.salary,  // Keep as string
    // Hardcoded fields that Django expects
    phone: "N/A",
    location: "N/A", 
    education: "N/A",
    experience: "0-1 years",
    availability: "Full-time",
  };

  console.log('Sending create request:', requestData);

  const response = await fetch(`${API_BASE_URL}/bds/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });

  console.log('Create response status:', response.status);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Create API Error Response:', errorText);
    
    try {
      const errorData = JSON.parse(errorText);
      console.error('Parsed error data:', errorData);
      
      // Handle validation errors
      if (errorData.details) {
        const errorMessages = Object.entries(errorData.details)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        throw new Error(`Validation Error:\n${errorMessages}`);
      }
      
      throw new Error(errorData.message || errorData.error || 'Unknown error');
    } catch (parseError) {
      throw new Error(`HTTP error! status: ${response.status}\n${errorText}`);
    }
  }

  const result = await response.json();
  console.log('Create API Success Response:', result);
  return result;
};

const updateBDAPI = async (bdData: BDFormData): Promise<BDResponse> => {
  const requestData = {
    BD_id: bdData.bdId,
    name: bdData.name,
    password: bdData.password,
    email: bdData.email,
    salary: bdData.salary,
    // Hardcoded fields
    phone: "N/A",
    location: "N/A",
    education: "N/A", 
    experience: "0-1 years",
    availability: "Full-time",
  };

  console.log('Sending update request:', requestData);

  const response = await fetch(`${API_BASE_URL}/bds/${bdData.bdId}/`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestData),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Update API Error Response:', errorText);
    
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.details) {
        const errorMessages = Object.entries(errorData.details)
          .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
          .join('\n');
        throw new Error(`Validation Error:\n${errorMessages}`);
      }
      throw new Error(errorData.message || errorData.error || 'Unknown error');
    } catch (parseError) {
      throw new Error(`HTTP error! status: ${response.status}\n${errorText}`);
    }
  }

  const result = await response.json();
  console.log('Update API Success Response:', result);
  return result;
};

const AddBDModal: React.FC<AddBDModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  initialData = null,
}) => {
  const [formData, setFormData] = useState<BDFormData>({
    bdId: "",
    name: "",
    password: "",
    email: "",
    salary: "",
  });

  const [errors, setErrors] = useState<Partial<BDFormData>>({});
  const [focusedField, setFocusedField] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const firstInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!initialData;

  // Populate form with initial data when editing
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        console.log('Editing with initial data:', initialData);
        setFormData({
          bdId: initialData.bdId,
          name: initialData.name,
          password: initialData.password,
          email: initialData.email,
          salary: initialData.salary,
        });
      } else {
        // Generate a better unique ID
        const timestamp = Date.now();
        const randomNum = Math.floor(Math.random() * 1000);
        const nextId = `BD-${timestamp}-${randomNum}`;
        console.log('Creating new BD with ID:', nextId);
        
        setFormData({
          bdId: nextId,
          name: "",
          password: "",
          email: "",
          salary: "",
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Focus first input when modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      setTimeout(() => firstInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleInputChange = (field: keyof BDFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<BDFormData> = {};
    
    if (!formData.bdId.trim()) {
      newErrors.bdId = "ID is required";
    }
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
    }
    
    if (!formData.salary.trim()) {
      newErrors.salary = "Salary is required";
    } else if (isNaN(Number(formData.salary)) || Number(formData.salary) < 0) {
      newErrors.salary = "Please enter a valid salary";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted with data:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed:', errors);
      return;
    }

    setIsSubmitting(true);
    try {
      let response: BDResponse;
      if (isEditMode) {
        console.log('Updating BD...');
        response = await updateBDAPI(formData);
        alert(`BD "${formData.name}" updated successfully!`);
      } else {
        console.log('Creating new BD...');
        response = await createBDAPI(formData);
        alert(`BD "${formData.name}" added successfully!`);
      }
      
      console.log('API call successful:', response);
      onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`Error saving BD: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    console.log('Closing modal');
    setFormData({
      bdId: "",
      name: "",
      password: "",
      email: "",
      salary: "",
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">{isEditMode ? "Edit Business Developer" : "Add Business Developer"}</h2>
          <button className="modal-close-button" onClick={handleClose} type="button">
            ✕
          </button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit} className="client-form">
            {/* ID */}
            <div className="form-group">
              <label className="form-label">BD ID</label>
              <input
                ref={firstInputRef}
                type="text"
                value={formData.bdId}
                onChange={(e) => handleInputChange("bdId", e.target.value)}
                readOnly={isEditMode}
                className={`form-input ${errors.bdId ? "form-input--error" : ""}`}
                placeholder="BD-XXXX-XXX"
              />
              {errors.bdId && <span className="form-error">{errors.bdId}</span>}
            </div>

            {/* Name */}
            <div className="form-group">
              <label className="form-label">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={`form-input ${errors.name ? "form-input--error" : ""}`}
                placeholder="Enter full name"
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`form-input ${errors.password ? "form-input--error" : ""}`}
                placeholder="Enter password (min 6 characters)"
                minLength={6}
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`form-input ${errors.email ? "form-input--error" : ""}`}
                placeholder="user@example.com"
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            {/* Salary */}
            <div className="form-group">
              <label className="form-label">Salary ($)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.salary}
                onChange={(e) => handleInputChange("salary", e.target.value)}
                className={`form-input ${errors.salary ? "form-input--error" : ""}`}
                placeholder="50000"
              />
              {errors.salary && <span className="form-error">{errors.salary}</span>}
            </div>

            <div className="form-actions">
              <button 
                type="submit" 
                className="btn btn--primary" 
                disabled={isSubmitting || isLoading}
              >
                {isSubmitting || isLoading 
                  ? (isEditMode ? "Updating..." : "Adding...") 
                  : (isEditMode ? "Update BD" : "Add BD")
                }
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

export default AddBDModal;