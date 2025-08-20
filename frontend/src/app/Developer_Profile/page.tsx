"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar'; // ✅ Sidebar correctly imported here
import Form from './form'; // ✅ Form correctly imported here
import { useSearchParams } from "next/navigation";

export default function SidebarOnlyPage() {
   const searchParams = useSearchParams();
    const email = searchParams.get("email");
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar stays on the left */}
      <Sidebar />
      {email}

      {/* Optional: Blank content area */}
      <div className="flex-1 p-6">
        <Form/>
        {email}
      </div>
    </div>
  );
}