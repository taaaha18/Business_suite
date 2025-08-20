import React, { useState } from 'react';
import { User, GraduationCap, Code, Globe, Briefcase, Save, AlertCircle, CheckCircle } from 'lucide-react';

interface DeveloperProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  office_id: string;
  location: string;
  professionalTitle: string;
  degree: string;
  university: string;
  graduationYear: string;
  technicalSkills: string[];
  languages: string[];
  experience: string;
  Salary: string;
  availability: string;
}

interface ApiResponse {
  success: boolean;
  message: string;
  developer?: any;
  error?: string;
  details?: any;
}

const DeveloperProfile: React.FC = () => {
  const [formData, setFormData] = useState<DeveloperProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    office_id: '',
    location: '',
    professionalTitle: '',
    degree: '',
    university: '',
    graduationYear: '',
    technicalSkills: ['JavaScript', 'React', 'Node.js', 'TypeScript'],
    languages: ['English', 'Urdu'],
    experience: '',
    Salary: '',
    availability: 'Full-time'
  });

  const [newSkill, setNewSkill] = useState('');
  const [newLanguage, setNewLanguage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});


  const handleInputChange = (field: keyof DeveloperProfileData, value: string) => {
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

  const addSkill = () => {
    if (newSkill.trim() && !formData.technicalSkills.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        technicalSkills: [...prev.technicalSkills, newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      technicalSkills: prev.technicalSkills.filter(s => s !== skill)
    }));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !formData.languages.includes(newLanguage.trim())) {
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, newLanguage.trim()]
      }));
      setNewLanguage('');
    }
  };

  const removeLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.filter(l => l !== language)
    }));
  };

  const validateForm = () => {
    const newErrors: any = {};

    // Required fields validation
    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.office_id.trim()) newErrors.office_id = 'Office ID is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.professionalTitle.trim()) newErrors.professionalTitle = 'Professional title is required';
    if (!formData.experience) newErrors.experience = 'Experience is required';
    if (!formData.Salary.trim()) newErrors.Salary = 'Salary is required';

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Phone number basic validation
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
    if (formData.phone && !phoneRegex.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
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
      // Replace with your actual API endpoint
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';
      
      const response = await fetch(`${API_BASE_URL}/developers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization header if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse = await response.json();

      if (response.ok && data.success) {
        setMessage({ 
          type: 'success', 
          text: data.message || 'Profile saved successfully!' 
        });
        // Optionally clear form or redirect
        // window.location.reload(); // or redirect to profile view
      } else {
        // Handle validation errors from backend
        if (data.details) {
          setErrors(data.details);
        }
        setMessage({ 
          type: 'error', 
          text: data.error || 'Failed to save profile' 
        });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
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
            <h1 className="text-3xl font-bold mb-2">Developer Profile</h1>
            <p className="text-blue-100 mb-6">Manage your professional information and skills</p>
            
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    placeholder="Enter your first name"
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.firstName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    placeholder="Enter your last name"
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.lastName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    placeholder="Enter your phone number"
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    value={formData.location}
                    placeholder="Enter your location"
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Office ID *</label>
                <input
                  type="text"
                  value={formData.office_id}
                  placeholder="Enter your Office ID"
                  onChange={(e) => handleInputChange('office_id', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.office_id ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.office_id && <p className="text-red-500 text-sm mt-1">{errors.office_id}</p>}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Professional Title *</label>
                <input
                  type="text"
                  value={formData.professionalTitle}
                  placeholder="Enter your professional title"
                  onChange={(e) => handleInputChange('professionalTitle', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                    errors.professionalTitle ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.professionalTitle && <p className="text-red-500 text-sm mt-1">{errors.professionalTitle}</p>}
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

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Degree</label>
                <input
                  type="text"
                  value={formData.degree}
                  placeholder="Enter your degree"
                  onChange={(e) => handleInputChange('degree', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                  <input
                    type="text"
                    value={formData.university}
                    placeholder="Enter your university name"
                    onChange={(e) => handleInputChange('university', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Graduation Year</label>
                  <input
                    type="text"
                    value={formData.graduationYear}
                    placeholder="Enter your graduation year"
                    onChange={(e) => handleInputChange('graduationYear', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </section>

            {/* Technical Skills Section */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Code className="text-purple-600" size={24} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Technical Skills</h2>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.technicalSkills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg flex items-center gap-2">
                      {skill}
                      <button 
                        onClick={() => removeSkill(skill)} 
                        className="hover:bg-blue-200 rounded-full p-1 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    placeholder="Add a skill"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <button 
                    onClick={addSkill} 
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </section>

            {/* Languages Section */}
            <section className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-orange-100 p-2 rounded-lg">
                  <Globe className="text-orange-600" size={24} />
                </div>
                <h2 className="text-2xl font-semibold text-gray-800">Languages</h2>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {formData.languages.map((language, index) => (
                    <span key={index} className="bg-green-100 text-green-800 px-3 py-2 rounded-lg flex items-center gap-2">
                      {language}
                      <button 
                        onClick={() => removeLanguage(language)} 
                        className="hover:bg-green-200 rounded-full p-1 transition-colors"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newLanguage}
                    onChange={(e) => setNewLanguage(e.target.value)}
                    placeholder="Add a language"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    onKeyPress={(e) => e.key === 'Enter' && addLanguage()}
                  />
                  <button 
                    onClick={addLanguage} 
                    className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Experience *</label>
                  <select
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.experience ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Select your experience</option>
                    {experienceOptions.map(option => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Salary *</label>
                  <input
                    type="text"
                    value={formData.Salary}
                    placeholder="Enter your salary"
                    onChange={(e) => handleInputChange('Salary', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                      errors.Salary ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.Salary && <p className="text-red-500 text-sm mt-1">{errors.Salary}</p>}
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">✉️</span>
                  <span className="text-sm text-gray-600 truncate">{formData.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">📞</span>
                  <span className="text-sm text-gray-600 truncate">{formData.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-orange-600">📍</span>
                  <span className="text-sm text-gray-600 truncate">{formData.location || 'No location'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-purple-600">📅</span>
                  <span className="text-sm text-gray-600 truncate">{formData.experience || 'No experience'} experience</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperProfile;