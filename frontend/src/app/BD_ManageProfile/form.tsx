import React, { useState } from 'react';
import { User, GraduationCap, Briefcase, Save, AlertCircle, CheckCircle, MapPin, Phone } from 'lucide-react';

interface BDProfileData {
  BD_id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  location: string;
  education: string;
  experience: string;
  availability: string;
  salary: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  bd?: any;
  error?: string;
  details?: any;
}

const BDProfile: React.FC = () => {
  const [formData, setFormData] = useState<BDProfileData>({
    BD_id: '',
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    education: '',
    experience: '0-1 years',
    availability: 'Full-time',
    salary: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});


  const handleInputChange = (field: keyof BDProfileData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear specific field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = () => {
    const newErrors: any = {};
    
    // Required fields validation
    if (!formData.BD_id.trim()) newErrors.BD_id = 'BD ID is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.password.trim()) newErrors.password = 'Password is required';
    if (!formData.salary.trim()) newErrors.salary = 'Salary is required';

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone number validation (allow empty for N/A default)
    if (formData.phone && formData.phone !== 'N/A') {
      const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
      if (!phoneRegex.test(formData.phone)) {
        newErrors.phone = 'Please enter a valid phone number';
      }
    }

    // BD ID validation (basic format check)
    if (formData.BD_id && formData.BD_id.length < 3) {
      newErrors.BD_id = 'BD ID must be at least 3 characters long';
    }

    // Name validation
    if (formData.name && formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const saveProfile = async () => {
  if (!validateForm()) {
    setMessage({ type: 'error', text: 'Please fix the errors below' });
    return;
  }

  setIsLoading(true);
  setMessage({ type: '', text: '' });

  try {
    const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

    // Check if BD already exists by ID
    const checkResponse = await fetch(`${API_BASE_URL}/bds/${formData.BD_id}/`);
    const exists = checkResponse.ok;

    // If exists → update, else → create
    const method = exists ? "PUT" : "POST";
    const endpoint = exists ? `${API_BASE_URL}/bds/${formData.BD_id}/` : `${API_BASE_URL}/bds/`;

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    const data: ApiResponse = await response.json();

    if (response.ok && data.success) {
      setMessage({
        type: "success",
        text: data.message || (exists ? "BD Profile updated successfully!" : "BD Profile created successfully!"),
      });
    } else {
      if (data.details) {
        setErrors(data.details);
      }
      setMessage({ type: "error", text: data.error || "Failed to save BD profile" });
    }
  } catch (error) {
    console.error("Error saving BD profile:", error);
    setMessage({ type: "error", text: "Network error. Please try again." });
  } finally {
    setIsLoading(false);
  }
};

  const experienceOptions = ['0-1 years', '1-2 years', '2-3 years', '3-5 years', '5+ years', '10+ years'];
  const availabilityOptions = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Unavailable'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-8">
            <h1 className="text-3xl font-bold mb-2">Business Development Profile</h1>
            <p className="text-blue-100 mb-6">Manage your professional information and details</p>
            
            {/* Message Display */}
            {message.text && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${
                message.type === 'success' 
                  ? 'bg-green-500 bg-opacity-20 text-green-100' 
                  : 'bg-red-500 bg-opacity-20 text-red-100'
              }`}>
                {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                <span>{message.text}</span>
              </div>
            )}

            <button
              onClick={saveProfile}
              disabled={isLoading}
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-semibold hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Save Profile
                </>
              )}
            </button>
          </div>

          <div className="p-8">
            {/* Personal Information Section */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <User className="text-blue-600" size={24} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Personal Information</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">BD ID *</label>
                  <input
                    type="text"
                    value={formData.BD_id}
                    placeholder="Enter your BD ID"
                    onChange={(e) => handleInputChange('BD_id', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.BD_id ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.BD_id && <p className="text-red-500 text-sm mt-1">{errors.BD_id}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    placeholder="Enter your full name"
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  placeholder="Enter your email address"
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password *</label>
                <input
                  type="password"
                  value={formData.password}
                  placeholder="Enter your password"
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    placeholder="Enter your phone number (optional)"
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  <p className="text-xs text-gray-500 mt-1">Leave empty for default "N/A"</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    placeholder="Enter your location (optional)"
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for default "N/A"</p>
                </div>
              </div>
            </section>

            {/* Education Section */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-green-100 p-2 rounded-lg">
                  <GraduationCap className="text-green-600" size={24} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Education</h2>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Educational Background</label>
                <textarea
                  value={formData.education}
                  placeholder="Enter your educational background (optional)"
                  onChange={(e) => handleInputChange('education', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for default "N/A"</p>
              </div>
            </section>

            {/* Professional Details Section */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <Briefcase className="text-indigo-600" size={24} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Professional Details</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {experienceOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary *</label>
                  <input
                    type="text"
                    value={formData.salary}
                    placeholder="Enter your salary information"
                    onChange={(e) => handleInputChange('salary', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.salary ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.salary && <p className="text-red-500 text-sm mt-1">{errors.salary}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
                  <select
                    value={formData.availability}
                    onChange={(e) => handleInputChange('availability', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {availabilityOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Profile Summary */}
            <section className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Profile Summary</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">🆔</span>
                  <span className="text-sm text-gray-600 truncate">{formData.BD_id || 'No BD ID'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✉️</span>
                  <span className="text-sm text-gray-600 truncate">{formData.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">📞</span>
                  <span className="text-sm text-gray-600 truncate">{formData.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">📍</span>
                  <span className="text-sm text-gray-600 truncate">{formData.location || 'N/A'}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <span className="text-indigo-600">📅</span>
                  <span className="text-sm text-gray-600 truncate">{formData.experience} experience</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-red-600">💰</span>
                  <span className="text-sm text-gray-600 truncate">{formData.salary || 'No salary info'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-teal-600">⏰</span>
                  <span className="text-sm text-gray-600 truncate">{formData.availability}</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BDProfile;