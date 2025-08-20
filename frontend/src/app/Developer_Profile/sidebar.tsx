"use client";
import { useRouter, useSearchParams } from 'next/navigation'; // for Next.js 13+
import { useState } from 'react';
import SidebarNavButton from '../Components/Dashboard_button';
import {
  FaHome,
  FaUser,
  FaClock,
  FaFileInvoiceDollar,
  FaCog,
  FaFolderOpen,
} from 'react-icons/fa';
import './Sidebar.css';

export default function Sidebar() {
  const router = useRouter();
  const [activeButton, setActiveButton] = useState('clients');

  const handleButtonClick = (buttonName: string, href?: string) => {
    setActiveButton(buttonName);
    if (href) router.push(href);
  };

  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  return (
    <div className="sidebar-container">
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">D</div>
          <div className="logo-text">
            <h3 className="logo-title">FreelancePro</h3>
            <p className="logo-subtitle">Business Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sidebar-nav">
        <SidebarNavButton
          icon={<FaHome />}
          label="Dashboard"
          isActive={activeButton === 'dashboard'}
          onClick={() =>
            handleButtonClick(
              'dashboard',
              `/Developer_Dash?email=${encodeURIComponent(email || "")}`
            )
          }
          variant={activeButton === 'dashboard' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaUser />}
          label="My Profile"
          isActive={activeButton === 'clients'}
          onClick={() =>
            handleButtonClick(
              'clients',
              `/Developer_Profile?email=${encodeURIComponent(email || "")}`
            )
          }
          variant={activeButton === 'clients' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaFolderOpen />}
          label= "My Interviews"
          isActive={activeButton === 'projects'}
          onClick={() =>
            handleButtonClick(
              'projects',
              `/Developer_Interview?email=${encodeURIComponent(email || "")}`
            )
          }
          variant={activeButton === 'projects' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaClock />}
          label="Time Tracking"
          isActive={activeButton === 'time-tracking'}
          onClick={() =>
            handleButtonClick(
              'time-tracking',
              `/Developer_time?email=${encodeURIComponent(email || "")}`
            )
          }
          variant={activeButton === 'time-tracking' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaFileInvoiceDollar />}
          label="My Stats"
          isActive={activeButton === 'invoices'}
          onClick={() =>
            handleButtonClick(
              'invoices',
              `/Developer_Stats?email=${encodeURIComponent(email || "")}`
            )
          }
          variant={activeButton === 'invoices' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaCog />}
          label="Settings"
          isActive={activeButton === 'settings'}
          onClick={() =>
            handleButtonClick(
              'settings',
              `/settings?email=${encodeURIComponent(email || "")}`
            )
          }
          variant={activeButton === 'settings' ? 'active' : 'default'}
          size="md"
        />
      </div>
    </div>
  );
}
