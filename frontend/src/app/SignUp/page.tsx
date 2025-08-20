'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from 'lucide-react';
import DynamicDropdown from '../Components/Dynamic_dropdown';
import './SignUpPage.css';

export default function SignUpPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('developer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  const router = useRouter();

  const roleOptions = [
  
    { label: 'Admin', value: 'admin' },
    { label: 'Developer', value: 'developer' },
    
  ];

  const handleSignIn = () => {
    router.push('/Login');
  };

  const validateForm = () => {
    const newErrors = {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: ''
    };

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!role) {
      newErrors.role = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.values(newErrors).every(error => error === '');
  };

  const handleCreateAccount = () => {
  if (validateForm()) {
    const payload = {
      username: fullName,
      email: email,
      password: password,
      role: role,
    };

    // Step 1: Register the user
    fetch('http://localhost:8000/api/register/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || 'Something went wrong during registration');
          });
        }
        return response.json();
      })
      .then(() => {
        // Step 2: Automatically log them in after signup to get JWT tokens
        return fetch('http://localhost:8000/api/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: password,
            role: role
          })
        });
      })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.error || 'Login failed after registration');
          });
        }
        return response.json();
      })
      .then(data => {
        // Step 3: Store JWT tokens in localStorage
        localStorage.setItem('access_token', data.tokens.access);
        localStorage.setItem('refresh_token', data.tokens.refresh);

       if (role === 'developer') {
          router.push('/Developer_Dash');
        } else {
          router.push('/Dashboard');
        }
      })
      .catch(error => {
        alert(`Error: ${error.message}`);
      });
  }
};


  return (
    <div className="signup-container">
      {/* Logo and Header */}
      <div className="signup-header">
        <div className="logo-container">
          <div className="logo-icon">D</div>
        </div>
        <h1 className="app-title">FreelancePro</h1>
        <p className="app-subtitle">Business Suite</p>
      </div>

      {/* Form Container */}
      <div className="form-container">
        <div className="form-header">
          <h2 className="form-title">Create account</h2>
          <p className="form-subtitle">Join FreelancePro and start managing your business</p>
        </div>

        <div className="form-content">
          {/* Full Name */}
          <div className="input-group">
            <label className="input-label">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={`form-input ${errors.fullName ? 'input-error' : ''}`}
            />
            {errors.fullName && <span className="error-message">{errors.fullName}</span>}
          </div>

          {/* Email */}
          <div className="input-group">
            <label className="input-label">Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          {/* Role Dropdown */}
          <div className="input-group">
            <label className="input-label">Role</label>
            <DynamicDropdown
              options={roleOptions}
              placeholder="Select your role"
              defaultValue="Developer"
              onSelect={(option) => setRole(option.value)}
              variant="default"
              size="md"
              className="role-dropdown"
              buttonClassName="dropdown-button-custom"
              dropdownClassName="dropdown-menu-custom"
            />
            {errors.role && <span className="error-message">{errors.role}</span>}
          </div>

          {/* Password */}
          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`form-input password-input ${errors.password ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="password-toggle"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          {/* Confirm Password */}
          <div className="input-group">
            <label className="input-label">Confirm Password</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`form-input password-input ${errors.confirmPassword ? 'input-error' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="password-toggle"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
          </div>

          {/* Create Account Button */}
          <button
            onClick={handleCreateAccount}
            className="create-account-btn"
          >
            Create account
          </button>

          {/* Sign In Link */}
          <div className="signin-section">
            <p className="signin-text">
              Already have an account?{' '}
              <button 
                onClick={handleSignIn}
                className="signin-link"
              >
                Sign in
              </button>
            </p>
          </div>

          
        </div>
      </div>
    </div>
  );
}