import React, { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import './Navbar.css';

interface NavbarItem {
  id: string;
  label: string;
  count?: number;
}

interface DynamicNavbarProps {
  searchPlaceholder?: string;
  navItems?: NavbarItem[];
  onSearch?: (searchTerm: string) => void;
  onTabChange?: (activeTab: string) => void;
  className?: string;
}

const DynamicNavbar: React.FC<DynamicNavbarProps> = ({
  searchPlaceholder = "Search developers, skills, or email...",
  navItems = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'pending', label: 'Pending' },
    { id: 'inactive', label: 'Inactive' }
  ],
  onSearch,
  onTabChange,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(searchTerm);
    }
  };

  return (
    <div className={`dynamic-navbar ${className}`}>
      <div className="navbar-container">
        {/* Search Section */}
        <div className="navbar-search">
          <form onSubmit={handleSearchSubmit} className="search-form">
            <div className="search-input-container">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>
          </form>
        </div>

        {/* Navigation Tabs */}
        <div className="navbar-tabs">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`nav-tab ${activeTab === item.id ? 'nav-tab--active' : ''}`}
            >
              <span className="nav-tab-label">{item.label}</span>
              {item.count !== undefined && (
                <span className="nav-tab-count">{item.count}</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DynamicNavbar;