"use client";
import React, { useState, useEffect } from "react";
import StatsCard from "../Components/Stats_cards";
import DeveloperCard from "../Components/Developer_card"; // Import DeveloperCard
import AddClientButton from "../Components/AddButton";
import AddBDForm from "../Components/Add_BD_form";
import Sidebar from "./sidebar";
import Navbar from "./navbar";

// Icons
const CircleIcon = () => (
  <div
    style={{
      width: "16px",
      height: "16px",
      borderRadius: "50%",
      backgroundColor: "currentColor",
    }}
  />
);

const DollarIcon = () => (
  <span style={{ fontSize: "18px", fontWeight: "bold" }}>$</span>
);

// Updated Types to match the form component
interface BusinessDeveloper {
  name: string;
  email: string;
  salary: number;
  bdId: string;
  password: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BDFormData {
  bdId: string;
  name: string;
  password: string;
  email: string;
  salary: string;
}

// Updated interface to match the actual API response
interface BDResponse {
  BD_id: string;  // Changed from bd_id to BD_id
  name: string;
  password?: string;  // Made optional since it might be excluded in response
  email: string;
  salary: string;
  phone?: string;
  location?: string;
  education?: string;
//  experience?: string;
  availability?: string;
  created_at: string;
  updated_at: string;
  full_name?: string;  // Added since serializer includes this
}

const API_BASE_URL = 'http://localhost:8000/api';

// Updated API Functions for Business Developers
const getBDsAPI = async (): Promise<BDResponse[]> => {
  const response = await fetch(`${API_BASE_URL}/bds/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Get BDs API Error:', errorText);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  console.log('BDs API Response:', data);
  return data;
};

const deleteBDAPI = async (bdId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/bds/${bdId}/`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
};

const DashboardPage: React.FC = () => {
  // Updated state management for Business Developers
  const [businessDevelopers, setBusinessDevelopers] = useState<BusinessDeveloper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingBD, setEditingBD] = useState<BusinessDeveloper | null>(null);

  // Load business developers on component mount
  useEffect(() => {
    loadBusinessDevelopers();
  }, []);

  const loadBusinessDevelopers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      try {
        const bdResponses = await getBDsAPI();
        console.log('Loaded BDs:', bdResponses);
        
        // Convert Django response to BusinessDeveloper format
        const bdsData = bdResponses.map((response: BDResponse) => ({
          name: response.name,
          email: response.email,
          salary: typeof response.salary === 'string' ? parseFloat(response.salary) || 0 : response.salary,
          bdId: response.BD_id,  // Use BD_id from response
          password: response.password || '',
          createdAt: response.created_at,
          updatedAt: response.updated_at,
        }));
        
        setBusinessDevelopers(bdsData);
        console.log('Converted BDs data:', bdsData);
      } catch (apiError) {
        console.log("Django API error:", apiError);
        setError("Failed to connect to server");
        setBusinessDevelopers([]);
      }
    } catch (err) {
      setError("Failed to load business developers");
      console.error("Error loading business developers:", err);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const openModal = () => {
    console.log("Opening modal");
    setEditingBD(null);
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    console.log("Closing modal");
    setIsModalOpen(false);
    setEditingBD(null);
    setIsSubmitting(false);
  };

  // Handle form submission for adding new BDs
  const handleAddBDSubmit = async (newBDData: BDFormData) => {
    console.log("New BD data submitted:", newBDData);
    
    // Convert form data to BusinessDeveloper format for local state
    const newBD: BusinessDeveloper = {
      name: newBDData.name,
      email: newBDData.email,
      salary: Number(newBDData.salary),
      bdId: newBDData.bdId,
      password: newBDData.password,
    };

    // Add to business developers state (optimistic update)
    setBusinessDevelopers(prevBDs => [newBD, ...prevBDs]);
    closeModal();
  };

  // BD action handlers
  const handleEditBD = (bdId: string) => {
    console.log(`Editing BD with ID: ${bdId}`);
    const bdToEdit = businessDevelopers.find(bd => bd.bdId === bdId);
    if (bdToEdit) {
      setEditingBD(bdToEdit);
      setIsModalOpen(true);
    }
  };

  const handleEditBDSubmit = async (updatedData: BDFormData) => {
    console.log("Updated BD data:", updatedData);

    const updatedBD: BusinessDeveloper = {
      name: updatedData.name,
      email: updatedData.email,
      salary: Number(updatedData.salary),
      bdId: updatedData.bdId,
      password: updatedData.password,
    };

    // Update in state (optimistic update)
    setBusinessDevelopers(prevBDs =>
      prevBDs.map(bd =>
        bd.bdId === updatedBD.bdId ? updatedBD : bd
      )
    );

    closeModal();
  };

  const handleDeleteBD = async (bdId: string) => {
    const bdToDelete = businessDevelopers.find(bd => bd.bdId === bdId);
    const bdName = bdToDelete ? bdToDelete.name : 'this business developer';
    
    const confirmDelete = window.confirm(`Are you sure you want to delete "${bdName}"? This action cannot be undone.`);
    
    if (confirmDelete) {
      try {
        console.log(`Deleting BD with ID: ${bdId}`);
        
        // Optimistically remove from UI
        setBusinessDevelopers(prevBDs => prevBDs.filter(bd => bd.bdId !== bdId));
        
        try {
          // Try to delete from Django API
          await deleteBDAPI(bdId);
          console.log("BD deleted successfully from API");
          
          // Show success message
          alert(`Business Developer "${bdName}" has been deleted successfully.`);
          
        } catch (apiError) {
          console.log("Django API not available for delete, using local delete only:", apiError);
          // If API fails, we've already removed it from local state, so just show a message
          alert(`Business Developer "${bdName}" has been removed from the local list.`);
        }
        
      } catch (error) {
        console.error("Error deleting BD:", error);
        
        // Rollback the optimistic update if there's an error
        if (bdToDelete) {
          setBusinessDevelopers(prevBDs => [...prevBDs, bdToDelete]);
        }
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Unknown error occurred";
          
        alert(`Error deleting business developer: ${errorMessage}. Please try again.`);
      }
    }
  };

  // Handle contact action from DeveloperCard
  const handleContact = (bdId: string) => {
    const bd = businessDevelopers.find(bd => bd.bdId === bdId);
    if (bd) {
      // You can implement your contact logic here
      // For now, let's show an alert with contact info
      alert(`Contact ${bd.name}\nEmail: ${bd.email}\nBD ID: ${bd.bdId}`);
    }
  };

  // Convert BusinessDeveloper to DeveloperCardProps format
  const convertBDToDeveloper = (bd: BusinessDeveloper) => {
    const nameParts = bd.name.trim().split(' ').filter(part => part.length > 0);
  const firstName = nameParts[0] || 'B'; // Fallback to 'B' for Business
  const lastName = nameParts[1] || 'B/D'; // Fallback

    return {
      office_id: bd.bdId,
      firstName: firstName,
      lastName: lastName,
      email: bd.email,
      phone: 'Not available', // BD data doesn't have phone
      location: 'Not specified', // BD data doesn't have location
      professionalTitle: 'Business Developer',
      degree: 'Not specified', // BD data doesn't have degree
      university: 'Not specified', // BD data doesn't have university
      graduationYear: 'N/A', // BD data doesn't have graduation year
      technicalSkills: ['Business Development', 'Sales', 'Client Relations'], // Default skills for BDs
      languages: ['English'], // Default language
     // experience: 'Not specified', // BD data doesn't have experience
      Salary: `$${bd.salary.toLocaleString()}`,
      availability: 'Available' // Default availability



    };
  };

  // Calculate stats based on the business developers data
  const validSalaries = businessDevelopers
    .map(bd => Number(bd.salary))
    .filter(salary => !isNaN(salary) && salary > 0);
  
  const totalBDs = businessDevelopers.length;
  const activeBDs = businessDevelopers.length; // All BDs are considered active unless you have specific logic
  const avgSalary = validSalaries.length > 0
    ? Math.round(validSalaries.reduce((sum, salary) => sum + salary, 0) / validSalaries.length)
    : 0;

  const statsData = [
    { 
      title: "Total Business Developers", 
      value: totalBDs, 
      color: "blue" as const, 
      icon: <CircleIcon /> 
    },
    { 
      title: "Active Business Developers", 
      value: activeBDs, 
      color: "green" as const, 
      icon: <CircleIcon /> 
    },
    { 
      title: "Avg. Salary", 
      value: avgSalary, 
      color: "purple" as const, 
      prefix: "$", 
      icon: <DollarIcon /> 
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Navbar />

        {/* Header */}
        <div className="flex justify-between items-center mb-8 ml-6 mt-6">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2">Business Developers</h1>
            <h3 className="text-lg text-gray-600">
              Manage your Business developers and track their information
            </h3>
          </div>
          <div className="pr-5">
            <AddClientButton
              size="medium"
              variant="primary"
              onClick={() => {
                console.log("Add BD button clicked!");
                openModal();
              }}
            >
              Add BD
            </AddClientButton>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Stats */}
          <div className="flex flex-wrap gap-6 justify-start">
            {statsData.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                color={stat.color}
                prefix={stat.prefix}
                icon={stat.icon}
              />
            ))}
          </div>

          {/* Business Developers using DeveloperCard */}
          {loading ? (
            <div className="text-gray-500 text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Loading business developers...
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-10 bg-red-50 rounded-lg">
              <p className="text-lg font-medium">{error}</p>
              <button 
                onClick={loadBusinessDevelopers}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : businessDevelopers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No business developers yet</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first business developer</p>
              <AddClientButton
                onClick={openModal}
                variant="primary"
                size="large"
              >
                Add Your First Business Developer
              </AddClientButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {businessDevelopers.map((bd, index) => (
                <DeveloperCard
                  key={bd.bdId || index}
                  developer={convertBDToDeveloper(bd)}
                  onContact={handleContact}
                  className="hover:shadow-lg transition-shadow duration-200"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddBDForm
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingBD ? handleEditBDSubmit : handleAddBDSubmit}
        isLoading={isSubmitting}
        initialData={editingBD ? {
          bdId: editingBD.bdId,
          name: editingBD.name,
          password: editingBD.password,
          email: editingBD.email,
          salary: editingBD.salary.toString(),
        } : null}
      />
    </div>
  );
};

export default DashboardPage;