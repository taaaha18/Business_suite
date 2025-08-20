import React, { useState } from 'react';
import { X } from 'lucide-react';
import './interviewForm.css'; // Assuming you have some styles for the form

interface Developer {
  office_id: string;
  firstName: string;
  lastName: string;
  full_name?: string;
  professionalTitle: string;
}

interface FormData {
  developerId: string;
  bdId: string;
  jobId: string;
  companyName: string;
  role: string;
  interviewDate: string;
  interviewTime: string;
  companyUrl: string;
}

interface InterviewAssignmentFormProps {
  developers?: Developer[];
  apiBaseUrl?: string; // Add this to make the API URL configurable
}

const InterviewAssignmentForm: React.FC<InterviewAssignmentFormProps> = ({ 
  developers = [],
  apiBaseUrl = 'http://localhost:8000/api' // Default API base URL
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    developerId: '',
    bdId: '',
    jobId: '',
    companyName: '',
    role: '',
    interviewDate: '',
    interviewTime: '',
    companyUrl: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Prepare the data for the API call
      const interviewData = {
        dev_id: formData.developerId,
        bd_id: formData.bdId,
        job_id: formData.jobId,
        company_name: formData.companyName,
        role: formData.role,
        interview_date: formData.interviewDate,
        interview_time: formData.interviewTime,
        company_url: formData.companyUrl || null // Send null if empty
      };

      const response = await fetch(`${apiBaseUrl}/interview-schedules/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(interviewData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Success
        console.log('Interview scheduled successfully:', result.interview);
        alert('Interview scheduled successfully!');
        
        // Close modal and reset form
        setIsModalOpen(false);
        setFormData({
          developerId: '',
          bdId: '',
          jobId: '',
          companyName: '',
          role: '',
          interviewDate: '',
          interviewTime: '',
          companyUrl: ''
        });
      } else {
        // Handle API errors
        console.error('API Error:', result);
        let errorMessage = result.message || 'Failed to schedule interview';
        
        if (result.errors) {
          // Format validation errors
          const errorDetails = Object.entries(result.errors)
            .map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`)
            .join('\n');
          errorMessage += '\n\nDetails:\n' + errorDetails;
        }
        
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Network Error:', error);
      alert('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setIsModalOpen(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSubmitting) {
      handleClose();
    }
  };

  return (
    <div className="relative">
      <button 
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg"
        onClick={() => setIsModalOpen(true)}
      >
        Assign Interview
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={handleOverlayClick}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Assign Interview to Developer</h2>
              <button 
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50"
                onClick={handleClose}
                type="button"
                disabled={isSubmitting}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="developerId" className="block text-sm font-medium text-gray-700">Developer*</label>
                  {developers.length > 0 ? (
                    <select
                      id="developerId"
                      name="developerId"
                      value={formData.developerId}
                      onChange={handleInputChange}
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
                    >
                      <option value="">Select a developer</option>
                      {developers.map((dev) => (
                        <option key={dev.office_id} value={dev.office_id}>
                          {dev.full_name || `${dev.firstName} ${dev.lastName}`} - {dev.professionalTitle}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      id="developerId"
                      name="developerId"
                      value={formData.developerId}
                      onChange={handleInputChange}
                      placeholder="Enter developer ID"
                      required
                      disabled={isSubmitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="bdId" className="block text-sm font-medium text-gray-700">BD ID*</label>
                  <input
                    type="text"
                    id="bdId"
                    name="bdId"
                    value={formData.bdId}
                    onChange={handleInputChange}
                    placeholder="Enter BD ID"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="jobId" className="block text-sm font-medium text-gray-700">Job ID*</label>
                  <input
                    type="text"
                    id="jobId"
                    name="jobId"
                    value={formData.jobId}
                    onChange={handleInputChange}
                    placeholder="Enter Job ID"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">Company Name*</label>
                  <input
                    type="text"
                    id="companyName"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    placeholder="Enter company name"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">Role*</label>
                  <input
                    type="text"
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    placeholder="Enter job role"
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="interviewDate" className="block text-sm font-medium text-gray-700">Interview Date*</label>
                  <input
                    type="date"
                    id="interviewDate"
                    name="interviewDate"
                    value={formData.interviewDate}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="interviewTime" className="block text-sm font-medium text-gray-700">Interview Time*</label>
                  <input
                    type="time"
                    id="interviewTime"
                    name="interviewTime"
                    value={formData.interviewTime}
                    onChange={handleInputChange}
                    required
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label htmlFor="companyUrl" className="block text-sm font-medium text-gray-700">Company URL</label>
                  <input
                    type="url"
                    id="companyUrl"
                    name="companyUrl"
                    value={formData.companyUrl}
                    onChange={handleInputChange}
                    placeholder="https://company-website.com"
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:bg-gray-100"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                <button 
                  type="button" 
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors duration-200 flex-1 sm:flex-none disabled:opacity-50"
                  onClick={handleClose}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors duration-200 shadow-md hover:shadow-lg flex-1 sm:flex-none disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Scheduling...' : 'Assign Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewAssignmentForm;