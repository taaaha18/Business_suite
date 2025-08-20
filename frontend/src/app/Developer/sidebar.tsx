"use client";
import { useRouter } from 'next/navigation'; // for Next.js 13+
import { useState } from 'react';
import SidebarNavButton from '../Components/Dashboard_button';
import {
  FaHome,
  FaUser,
  FaClock,
  FaFileInvoiceDollar,
  FaCode,
  FaChartLine,
  FaCog,
  FaFolderOpen,
} from 'react-icons/fa';
import './Sidebar.css';

export default function Sidebar() {
  const router = useRouter();
  const [activeButton, setActiveButton] = useState('developers');

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
          onClick={() => handleButtonClick('dashboard', '/Dashboard')}
          variant={activeButton === 'dashboard' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaUser />}
          label="User Management"
          isActive={activeButton === 'clients'}
          onClick={() => handleButtonClick('clients', '/Client')}
          variant={activeButton === 'clients' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaFolderOpen />}
          label="Roles and Permissions"
          isActive={activeButton === 'projects'}
          onClick={() => handleButtonClick('projects', '/projects')}
          variant={activeButton === 'projects' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaCode />}
          label="Developers"
          isActive={activeButton === 'developers'}
          onClick={() => handleButtonClick('developers', '/Developer')}
          variant={activeButton === 'developers' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaClock />}
          label="HR Team"
          isActive={activeButton === 'time-tracking'}
          onClick={() => handleButtonClick('time-tracking', '/time-tracking')}
          variant={activeButton === 'time-tracking' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaFileInvoiceDollar />}
          label="BD Team"
          isActive={activeButton === 'invoices'}
          onClick={() => handleButtonClick('invoices', '/BD')}
          variant={activeButton === 'invoices' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaChartLine />}
          label="Reports"
          isActive={activeButton === 'reports'}
          onClick={() => handleButtonClick('reports', '/reports')}
          variant={activeButton === 'reports' ? 'active' : 'default'}
          size="md"
        />

        <SidebarNavButton
          icon={<FaCog />}
          label="Settings"
          isActive={activeButton === 'settings'}
          onClick={() => handleButtonClick('settings', '/settings')}
          variant={activeButton === 'settings' ? 'active' : 'default'}
          size="md"
        />
      </div>
    </div>
  );
}
