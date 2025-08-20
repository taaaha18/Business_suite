"use client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import Sidebar from "./sidebar";
import JobCard, { JobApplication } from "./card";

export default function Dashboard_Page() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  useEffect(() => {
  console.log("📢 useEffect triggered!");
  fetchJobs();
}, []);

  
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState({
    status: '',
    platform: '',
    company: '',
    jobType: ''
  });

  // Fetch job applications from API
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('🔄 Starting to fetch job applications...');
      
      // Use the main job-applications endpoint instead of search
      const response = await fetch('http://localhost:8000/api/job-applications/', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add any authentication headers if needed
          // 'Authorization': `Bearer ${token}`
        },
      });
      
      console.log('📡 API Response Status:', response.status);
      console.log('📡 API Response Headers:', response.headers);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('📦 Raw API Response:', data);
      
      // Check if response has the expected structure
      if (data.success !== undefined) {
        // Backend returns { success: true, count: X, jobs: [...] }
        if (data.success) {
          console.log('✅ API Success - Jobs found:', data.count);
          console.log('📋 Jobs Data:', data.jobs);
          setJobs(data.jobs || []);
        } else {
          console.error('❌ API returned success: false', data);
          throw new Error(data.message || 'Failed to fetch jobs');
        }
      } else if (Array.isArray(data)) {
        // Backend returns direct array of jobs
        console.log('✅ API Success - Direct array response:', data.length, 'jobs');
        console.log('📋 Jobs Data:', data);
        setJobs(data);
      } else {
        console.error('❌ Unexpected API response format:', data);
        throw new Error('Unexpected response format from API');
      }
      
    } catch (err) {
      console.error('💥 Error fetching jobs:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log('🏁 Finished fetching jobs');
    }
  };

  // Handle job editing
  const handleEditJob = (job: JobApplication) => {
    console.log('✏️ Edit job clicked:', job);
    // Implement edit functionality - could open a modal or redirect to edit page
    // You can implement a modal or navigate to edit page here
  };

  // Handle job deletion
  const handleDeleteJob = async (jobId: number) => {
    console.log('🗑️ Delete job requested for ID:', jobId);
    
    if (window.confirm('Are you sure you want to delete this job application?')) {
      try {
        console.log('🔄 Deleting job with ID:', jobId);
        
        const response = await fetch(`http://localhost:8000/api/job-applications/${jobId}/`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        console.log('📡 Delete Response Status:', response.status);
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Job deleted successfully:', result);
          
          // Remove job from local state
          setJobs(jobs.filter(job => job.job_id !== jobId));
        } else {
          const errorText = await response.text();
          console.error('❌ Delete failed:', errorText);
          throw new Error('Failed to delete job');
        }
      } catch (err) {
        console.error('💥 Error deleting job:', err);
        alert('Failed to delete job application');
      }
    } else {
      console.log('❌ Job deletion cancelled by user');
    }
  };

  // Handle viewing job details
  const handleViewDetails = (job: JobApplication) => {
    console.log('👀 View details clicked for job:', job);
    // Implement view details functionality
    // You can implement a modal or navigate to details page here
  };

  // Filter jobs based on current filters
  const filteredJobs = jobs.filter(job => {
    const matchesStatus = filter.status === '' || job.application_status === filter.status;
    const matchesPlatform = filter.platform === '' || job.platform === filter.platform;
    const matchesCompany = filter.company === '' || job.company.toLowerCase().includes(filter.company.toLowerCase());
    const matchesJobType = filter.jobType === '' || job.job_type === filter.jobType;
    
    return matchesStatus && matchesPlatform && matchesCompany && matchesJobType;
  });

  // Get unique values for filter dropdowns
  const uniqueStatuses = [...new Set(jobs.map(job => job.application_status).filter(Boolean))];
  const uniquePlatforms = [...new Set(jobs.map(job => job.platform).filter(Boolean))];
  const uniqueJobTypes = [...new Set(jobs.map(job => job.job_type).filter(Boolean))];

  // Log filter changes
  useEffect(() => {
    console.log('🔍 Filters changed:', filter);
    console.log('📊 Filtered jobs count:', filteredJobs.length);
  }, [filter, filteredJobs.length]);

  // Log jobs data whenever it changes
  useEffect(() => {
    console.log('📈 Jobs state updated - Total jobs:', jobs.length);
    if (jobs.length > 0) {
      console.log('📝 Sample job data:', jobs[0]);
      console.log('🏢 Companies found:', [...new Set(jobs.map(job => job.company))]);
      console.log('📱 Platforms found:', [...new Set(jobs.map(job => job.platform))]);
      console.log('📊 Statuses found:', [...new Set(jobs.map(job => job.application_status))]);
    }
  }, [jobs]);

  

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Job Applications Dashboard</h1>
          {email && (
            <p className="text-gray-600">Welcome back, {email}</p>
          )}
        </div>

        {/* Debug Info - Remove in production */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-6">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Debug Info (Remove in production)</h3>
          <p className="text-xs text-blue-700">
            Total Jobs: {jobs.length} | Filtered: {filteredJobs.length} | Loading: {loading.toString()} | Error: {error || 'None'}
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={filter.status}
                onChange={(e) => setFilter({ ...filter, status: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Platform Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Platform
              </label>
              <select
                value={filter.platform}
                onChange={(e) => setFilter({ ...filter, platform: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Platforms</option>
                {uniquePlatforms.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>

            {/* Job Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Type
              </label>
              <select
                value={filter.jobType}
                onChange={(e) => setFilter({ ...filter, jobType: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Types</option>
                {uniqueJobTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Company Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company
              </label>
              <input
                type="text"
                value={filter.company}
                onChange={(e) => setFilter({ ...filter, company: e.target.value })}
                placeholder="Search companies..."
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => {
                console.log('🧹 Clearing all filters');
                setFilter({ status: '', platform: '', company: '', jobType: '' });
              }}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Clear all filters
            </button>
            <span className="text-sm text-gray-500">
              Showing {filteredJobs.length} of {jobs.length} applications
            </span>
          </div>
        </div>

        {/* Job Applications List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading job applications...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-800">Error: {error}</p>
              <button
                onClick={() => {
                  console.log('🔄 Retrying to fetch jobs...');
                  fetchJobs();
                }}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No job applications found</h3>
              <p className="text-gray-600">
                {jobs.length === 0 
                  ? "Start by adding your first job application." 
                  : "Try adjusting your filters to see more results."
                }
              </p>
              {jobs.length === 0 && (
                <button
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    console.log('➕ Add new job application clicked');
                    // Navigate to add job page
                  }}
                >
                  Add Job Application
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Statistics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500">Total Applications</h3>
                  <p className="text-2xl font-bold text-gray-900">{jobs.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500">Under Review</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {jobs.filter(job => job.application_status === 'Under Review').length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500">Interviews</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {jobs.filter(job => 
                      job.application_status === 'Interview Scheduled' || 
                      job.application_status === 'Interview Completed'
                    ).length}
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h3 className="text-sm font-medium text-gray-500">Offers</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {jobs.filter(job => 
                      job.application_status === 'Offer Received' || 
                      job.application_status === 'Accepted'
                    ).length}
                  </p>
                </div>
              </div>

              {/* Job Cards */}
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.job_id}
                    job={job}
                    onEdit={handleEditJob}
                    onDelete={handleDeleteJob}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}