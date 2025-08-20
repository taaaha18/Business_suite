"use client";
import React, { useState, useEffect } from 'react';
import StatsCard from '../Components/Stats_cards';
import DeveloperCard from '../Components/Developer_card';
import { Developer } from '../Components/types';
import Sidebar from './sidebar';
import Navbar from './navbar';
import AddClientButton from "../Components/AddButton";

const CircleIcon = () => (
  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'currentColor' }} />
);

const DollarIcon = () => (
  <span style={{ fontSize: '18px', fontWeight: 'bold' }}>$</span>
);

// API service for backend communication
const apiService = {
  baseURL: 'http://localhost:8000/api', // Adjust this to match your Django backend URL
  
  async fetchDevelopers(): Promise<Developer[]> {
    try {
      const response = await fetch(`${this.baseURL}/developers/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers if needed
          // 'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform Django response to match frontend Developer interface
      const developers = data.developers || data;
      return developers.map((dev: any) => ({
        id: dev.office_id, // Using office_id as the unique identifier
        office_id: dev.office_id,
        firstName: dev.firstName,
        lastName: dev.lastName,
        email: dev.email,
        phone: dev.phone,
        location: dev.location,
        professionalTitle: dev.professionalTitle,
        degree: dev.degree,
        university: dev.university,
        graduationYear: dev.graduationYear,
        technicalSkills: dev.technicalSkills || [],
        languages: dev.languages || [],
        experience: dev.experience,
        Salary: dev.Salary,
        availability: dev.availability,
        created_at: dev.created_at,
        updated_at: dev.updated_at,
        full_name: dev.full_name
      }));
    } catch (error) {
      console.error('Error fetching developers:', error);
      throw error;
    }
  },

  async fetchDeveloperById(office_id: string): Promise<Developer> {
    try {
      const response = await fetch(`${this.baseURL}/developers/${office_id}/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // Add authorization headers if needed
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      const dev = data.developer || data;
      
      return {
        id: dev.office_id,
        office_id: dev.office_id,
        firstName: dev.firstName,
        lastName: dev.lastName,
        email: dev.email,
        phone: dev.phone,
        location: dev.location,
        professionalTitle: dev.professionalTitle,
        degree: dev.degree,
        university: dev.university,
        graduationYear: dev.graduationYear,
        technicalSkills: dev.technicalSkills || [],
        languages: dev.languages || [],
        experience: dev.experience,
        Salary: dev.Salary,
        availability: dev.availability,
        created_at: dev.created_at,
        updated_at: dev.updated_at,
        full_name: dev.full_name
      };
    } catch (error) {
      console.error('Error fetching developer:', error);
      throw error;
    }
  }
};

const DashboardPage: React.FC = () => {
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate stats based on actual developer data
  const calculateStats = (developers: Developer[]) => {
    const totalDevelopers = developers.length;
    const activeDevelopers = developers.filter(dev => 
      dev.availability === 'Full-time' || dev.availability === 'Part-time'
    ).length;
    const pendingDevelopers = developers.filter(dev => 
      dev.availability === 'Contract' || dev.availability === 'Freelance'
    ).length;
    
    // Calculate average salary (extract numeric value from salary strings)
    const salaryValues = developers
      .map(dev => {
        const salaryStr = dev.Salary?.replace(/[$,/year/month]/g, '');
        const salary = parseFloat(salaryStr || '0');
        return isNaN(salary) ? 0 : salary;
      })
      .filter(salary => salary > 0);
    
    const avgSalary = salaryValues.length > 0 
      ? Math.round(salaryValues.reduce((sum, salary) => sum + salary, 0) / salaryValues.length / 1000) 
      : 0;

    return [
      {
        title: 'Total Developers',
        value: totalDevelopers,
        color: 'blue' as const,
        icon: <CircleIcon />
      },
      {
        title: 'Active',
        value: activeDevelopers,
        color: 'green' as const,
        icon: <CircleIcon />
      },
     
      {
        title: 'Avg. Salary',
        value: avgSalary,
        color: 'purple' as const,
        prefix: '$',
        suffix: 'K',
        icon: <DollarIcon />
      }
    ];
  };

  const [statsData, setStatsData] = useState(calculateStats([]));

  useEffect(() => {
    loadDevelopers();
  }, []);

  const loadDevelopers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.fetchDevelopers();
      setDevelopers(data);
      setStatsData(calculateStats(data));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load developers';
      setError(errorMessage);
      console.error('Error loading developers:', err);
      
      // Show user-friendly error messages
      if (errorMessage.includes('Failed to fetch')) {
        setError('Unable to connect to server. Please check if the backend is running on port 8000.');
      } else if (errorMessage.includes('404')) {
        setError('API endpoint not found. Please check the backend URL configuration.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (developerId: string) => {
    try {
      const developer = await apiService.fetchDeveloperById(developerId);
      console.log('Developer profile:', developer);
      // You can implement a modal or navigation to show detailed profile
    } catch (error) {
      console.error('Error fetching developer profile:', error);
    }
  };

  const handleContact = (developerId: string) => {
    const developer = developers.find(dev => dev.office_id === developerId);
    if (developer?.email) {
      window.location.href = `mailto:${developer.email}`;
    } else {
      console.log('Contact developer:', developerId);
    }
  };

  const handleRefresh = () => {
    loadDevelopers();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar - stays on the left */}
      <Sidebar />

      {/* Main Area: navbar on top, content below */}
      <div className="flex-1 flex flex-col">
        {/* Navbar on top */}
        <Navbar />

        <div className="flex items-center justify-between ml-6 mt-6 mr-5 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Developers</h1>
            <h3 className="text-lg text-gray-600">
              Manage your developers and track their progress
              {developers.length > 0 && (
                <span className="ml-2 text-sm text-blue-600">
                  ({developers.length} developer{developers.length !== 1 ? 's' : ''} found)
                </span>
              )}
            </h3>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
            <AddClientButton
              size="medium"
              variant="primary"
              onClick={() => console.log("Add Developer button clicked!")}
            >
              Assign Project
            </AddClientButton>
          </div>
        </div>

        {/* Main Content below navbar */}
        <div className="p-6 space-y-8">
          {/* Stats Cards */}
          <div className="flex flex-wrap gap-6 justify-start">
            {statsData.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                color={stat.color}
                prefix={stat.prefix}
                suffix={stat.suffix}
                icon={stat.icon}
              />
            ))}
          </div>

          {/* Developer Cards */}
          {loading ? (
            <div className="text-gray-500 text-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500 mx-auto mb-4"></div>
              Loading developers from backend...
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-10">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2">Error Loading Developers</h3>
                <p className="mb-4">{error}</p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : developers.length === 0 ? (
            <div className="text-gray-500 text-center py-10">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold mb-2">No Developers Found</h3>
                <p className="mb-4">There are no developers in the database yet.</p>
                <AddClientButton
                  size="medium"
                  variant="primary"
                  onClick={() => console.log("Add first developer")}
                >
                  Add First Developer
                </AddClientButton>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {developers.map((developer) => (
                <DeveloperCard
                  key={developer.office_id}
                  developer={developer}
                  onViewProfile={handleViewProfile}
                  onContact={handleContact}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;