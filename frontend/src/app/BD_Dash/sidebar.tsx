"use client";
import { useRouter } from 'next/navigation'; // for Next.js 13+
import { useState } from 'react';
import SidebarNavButton from '../Components/Dashboard_button';
import {
  FaHome,          // Dashboard
  FaBriefcase,     // All Jobs
  FaPlusCircle,    // Add Jobs
  FaUsers,         // Developers
  FaChartBar,      // Analytics
  FaBullseye,      // Targets
  FaUserCog,       // Manage Profile
  FaCog,           // Settings
} from 'react-icons/fa';
import './Sidebar.css';

export default function Sidebar() {
  const router = useRouter();
  const [activeButton, setActiveButton] = useState('dashboard');

  const handleButtonClick = (buttonName: string, href?: string) => {
    setActiveButton(buttonName);
    if (href) router.push(href);
  };

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
          onClick={() => handleButtonClick('dashboard', '/BD_Dash')}
          variant={activeButton === 'dashboard' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaBriefcase />}
          label="All Jobs"
          isActive={activeButton === 'clients'}
          onClick={() => handleButtonClick('clients', '/BD-ViewJobs')}
          variant={activeButton === 'clients' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaPlusCircle />}
          label="Add Jobs"
          isActive={activeButton === 'projects'}
          onClick={() => handleButtonClick('projects', '/BD-AddJobs')}
          variant={activeButton === 'projects' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaUsers />}
          label="Developers"
          isActive={activeButton === 'developers'}
          onClick={() => handleButtonClick('developers', '/BD-Developer')}
          variant={activeButton === 'developers' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaChartBar />}
          label="Analytics"
          isActive={activeButton === 'reports'}
          onClick={() => handleButtonClick('reports', '/BD-Analytics')}
          variant={activeButton === 'reports' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaBullseye />}
          label="Targets"
          isActive={activeButton === 'invoices'}
          onClick={() => handleButtonClick('invoices', '/BD_Targets')}
          variant={activeButton === 'invoices' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaUserCog />}
          label="Manage Profile"
          isActive={activeButton === 'time-tracking'}
          onClick={() => handleButtonClick('time-tracking', '/BD_ManageProfile')}
          variant={activeButton === 'time-tracking' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaCog />}
          label="Settings"
          isActive={activeButton === 'settings'}
          onClick={() => handleButtonClick('settings', '/BD_settings')}
          variant={activeButton === 'settings' ? 'active' : 'default'}
          size="md"
        />
      </div>
    </div>
  );
}
