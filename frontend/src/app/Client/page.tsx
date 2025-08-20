"use client";
import React, { useState, useEffect } from "react";
import StatsCard from "../Components/Stats_cards";
import ClientCard from "../Components/ClientCard";
import AddClientButton from "../Components/AddButton";
import AddClientModal from "../Components/AddClientForm";
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

// Types
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

interface ClientFormData {
  clientId: string;
  clientName: string;
  companyName: string;
  email: string;
  hourlyRate: string;
  projectDeadline: string;
  projectName: string;
}

const API_BASE_URL = 'http://localhost:8000/api';

// API Functions
const getClientsAPI = async (): Promise<any[]> => {
  const response = await fetch(`${API_BASE_URL}/clients/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};

const deleteClientAPI = async (clientId: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/clients/${clientId}/`, {
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
  // State management
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to get clients from Django API first
      try {
        const clientResponses = await getClientsAPI();
        // Convert Django response to Client format
        const clientsData = clientResponses.map((response: any) => ({
          name: response.client_name,
          company: response.company_name,
          email: response.email,
          hourlyRate: response.hourly_rate,
          dueDate: response.project_deadline,
          project: response.project_name,
          clientId: response.client_id,
          isOverdue: new Date(response.project_deadline) < new Date(),
        }));
        setClients(clientsData);
      } catch (apiError) {
        console.log("Django API not available, using fake data:", apiError);
       
      }
    } catch (err) {
      setError("Failed to load clients");
      console.error("Error loading clients:", err);
    } finally {
      setLoading(false);
    }
  };

  // Modal handlers
  const openModal = () => {
    console.log("Opening modal, current state:", isModalOpen);
    setEditingClient(null); // not editing, adding new client
    setIsModalOpen(true);
  };
  
  const closeModal = () => {
    console.log("Closing modal");
    setIsModalOpen(false);
    setEditingClient(null);
    setIsSubmitting(false);
  };

  // Handle form submission for adding new clients
  const handleAddClientSubmit = async (newClientData: ClientFormData) => {
    console.log("New client data submitted:", newClientData);
    
    // Convert form data to client format for local state
    const newClient: Client = {
      name: newClientData.clientName,
      company: newClientData.companyName,
      email: newClientData.email,
      hourlyRate: Number(newClientData.hourlyRate),
      dueDate: newClientData.projectDeadline,
      project: newClientData.projectName,
      clientId: newClientData.clientId,
      isOverdue: new Date(newClientData.projectDeadline) < new Date(),
    };

    // Add to clients state (optimistic update)
    setClients(prevClients => [newClient, ...prevClients]);
  };

  // Client action handlers
  const handleEditClient = (clientId: string) => {
    console.log(`Editing client with ID: ${clientId}`);
    const clientToEdit = clients.find(client => client.clientId === clientId);
    if (clientToEdit) {
      setEditingClient(clientToEdit);
      setIsModalOpen(true);
    }
  };

  const handleEditClientSubmit = async (updatedData: ClientFormData) => {
    console.log("Updated client data:", updatedData);

    const updatedClient: Client = {
      name: updatedData.clientName,
      company: updatedData.companyName,
      email: updatedData.email,
      hourlyRate: Number(updatedData.hourlyRate),
      dueDate: updatedData.projectDeadline,
      project: updatedData.projectName,
      clientId: updatedData.clientId,
      isOverdue: new Date(updatedData.projectDeadline) < new Date(),
    };

    // Update in state (optimistic update)
    setClients(prevClients =>
      prevClients.map(client =>
        client.clientId === updatedClient.clientId ? updatedClient : client
      )
    );

    closeModal();
  };

  const handleDeleteClient = async (clientId: string) => {
    const clientToDelete = clients.find(client => client.clientId === clientId);
    const clientName = clientToDelete ? clientToDelete.name : 'this client';
    
    const confirmDelete = window.confirm(`Are you sure you want to delete "${clientName}"? This action cannot be undone.`);
    
    if (confirmDelete) {
      try {
        console.log(`Deleting client with ID: ${clientId}`);
        
        // Optimistically remove from UI
        setClients(prevClients => prevClients.filter(client => client.clientId !== clientId));
        
        try {
          // Try to delete from Django API
          await deleteClientAPI(clientId);
          console.log("Client deleted successfully from API");
          
          // Show success message
          alert(`Client "${clientName}" has been deleted successfully.`);
          
        } catch (apiError) {
          console.log("Django API not available for delete, using local delete only:", apiError);
          // If API fails, we've already removed it from local state, so just show a message
          alert(`Client "${clientName}" has been removed from the local list.`);
        }
        
      } catch (error) {
        console.error("Error deleting client:", error);
        
        // Rollback the optimistic update if there's an error
        if (clientToDelete) {
          setClients(prevClients => [...prevClients, clientToDelete]);
        }
        
        const errorMessage = error instanceof Error 
          ? error.message 
          : "Unknown error occurred";
          
        alert(`Error deleting client: ${errorMessage}. Please try again.`);
      }
    }
  };
//Here I am Calculating stats based on the clients data
  const validRates = clients
  .map(c => Number(c.hourlyRate))
  .filter(rate => !isNaN(rate) && rate > 0);
  const totalClients = clients.length;
  const activeClients = clients.filter(client => !client.isOverdue).length;
  const avgRate = validRates.length > 0
  ? Math.round(validRates.reduce((sum, rate) => sum + rate, 0) / validRates.length)
  : 0;

  const statsData = [
    { 
      title: "Total Clients", 
      value: totalClients, 
      color: "blue" as const, 
      icon: <CircleIcon /> 
    },
    { 
      title: "Active clients", 
      value: activeClients, 
      color: "green" as const, 
      icon: <CircleIcon /> 
    },
    { 
      title: "Avg. Rate", 
      value: avgRate, 
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
            <h1 className="text-4xl font-bold text-black mb-2">Clients</h1>
            <h3 className="text-lg text-gray-600">
              Manage your Clients and track their projects
            </h3>
          </div>
          <div className="pr-5">
            <AddClientButton
              size="medium"
              variant="primary"
              onClick={() => {
                console.log("Add Client button clicked!");
                openModal();
              }}
            >
              Add Client
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

          {/* Clients */}
          {loading ? (
            <div className="text-gray-500 text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              Loading clients...
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-10 bg-red-50 rounded-lg">
              <p className="text-lg font-medium">{error}</p>
              <button 
                onClick={loadClients}
                className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : clients.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-sm">
              <div className="text-gray-400 text-6xl mb-4">👥</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No clients yet</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first client</p>
              <AddClientButton
                onClick={openModal}
                variant="primary"
                size="large"
              >
                Add Your First Client
              </AddClientButton>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.map((client, index) => (
                <ClientCard
                  key={client.clientId || index}
                  name={client.name}
                  company={client.company}
                  email={client.email}
                  hourlyRate={client.hourlyRate}
                  dueDate={client.dueDate}
                  project={client.project}
                  clientId={client.clientId}
                  isOverdue={client.isOverdue}
                  onEdit={() => handleEditClient(client.clientId)}
                  onDelete={() => handleDeleteClient(client.clientId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddClientModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSubmit={editingClient ? handleEditClientSubmit : handleAddClientSubmit}
        isLoading={isSubmitting}
        initialData={editingClient}
      />
    </div>
  );
};

export default DashboardPage;