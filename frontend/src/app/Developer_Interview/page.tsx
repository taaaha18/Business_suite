"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import InterviewScheduleCards from './card';
import { useSearchParams } from "next/navigation";

interface DeveloperData {
  office_id: string;
  full_name: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  professionalTitle: string;
  experience: string;
  availability: string;
}

export default function SidebarOnlyPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [developerData, setDeveloperData] = useState<DeveloperData | null>(null);
  const [devId, setDevId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const API_BASE_URL = 'http://localhost:8000/api';

  useEffect(() => {
    const fetchDeveloperData = async () => {
      if (!email) {
        setError('No email provided');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const response = await fetch(`${API_BASE_URL}/developers/email/${encodeURIComponent(email)}/`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (response.ok && result.success) {
          setDeveloperData(result.developer);
          setDevId(result.developer.office_id);
          console.log('Developer ID:', result.developer.office_id);
        } else {
          setError(result.message || 'Failed to fetch developer data');
        }
      } catch (error) {
        setError('Network error. Please check your connection.');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeveloperData();
  }, [email]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-3xl font-bold text-black mb-6">Developer Dashboard</h1>

        {/* Interview Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-black mb-4">Interviews Schedule</h2>

          {loading && (
            <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4">
              Loading developer data...
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error}
            </div>
          )}

          {devId && (
            <InterviewScheduleCards 
              devId={devId} 
              apiBaseUrl={API_BASE_URL}
            />
          )}

          {!devId && !loading && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <p className="text-gray-500">
                Please provide a valid email parameter to view interview schedules.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
