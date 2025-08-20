"use client";
import React, { useState, useEffect } from 'react';
import DeveloperCard from '../Components/Developer_card';
import { Developer } from '../Components/types';
import Sidebar from './sidebar'; // ✅ Sidebar correctly imported here
import Navbar from './navbar'; // ✅ Navbar correctly imported here
import AddClientButton from "../Components/AddButton";
import { useSearchParams } from "next/navigation";


export default function SidebarOnlyPage() {
    const searchParams = useSearchParams();
  const email = searchParams.get("email");
  return (

      
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar stays on the left */}
      <Sidebar />

      {/* Optional: Blank content area */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold">Main Content Area</h1>
        <p>This is where your page content will go. {email}</p>
      </div>
    </div>
  );
}