'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import DynamicInput from '../Components/Dynamic_input';
import DynamicButton from '../Components/Dynamic_button';
import DynamicDropdown from '../Components/Dynamic_dropdown';
import './LoginPage.css';



export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('developer');
  const [roleError, setRoleError] = useState('');

  
const router = useRouter();


  const roleOptions = [
 
    { label: 'Admin', value: 'admin' },
    { label: 'Developer', value: 'developer' },
     { label: 'BD', value: 'bd' },
    { label: 'HR', value: 'hr' },
    
  ];

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value && value.length < 6) {
      setPasswordError('Password must be at least 6 characters');
    } else {
      setPasswordError('');
    }
  };
const handleSignIn = async () => {
  let valid = true;

  if (!email) {
    setEmailError('Email is required');
    valid = false;
  }
  if (!password) {
    setPasswordError('Password is required');
    valid = false;
  }
  if (!role) {
    setRoleError('Role is required');
    valid = false;
  }

  if (!emailError && !passwordError && valid) {
    try {
      const response = await fetch('http://localhost:8000/api/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role }), // ✅ Role now included
      });

      const data = await response.json();

      if (response.ok) {
        // Save tokens in localStorage
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);

        console.log('JWT Tokens stored:', data);
       if (role === 'developer') {
  router.push(`/Developer_Dash?email=${encodeURIComponent(email)}`);
} else if (role === 'bd') {
  router.push(`/BD_Dash?email=${encodeURIComponent(email)}`);
} else if (role === 'hr') {
  router.push(`/HR_Dash?email=${encodeURIComponent(email)}`);
} else {
  router.push(`/Dashboard?email=${encodeURIComponent(email)}`); // default (Admin)
}


      } else {
        alert(data.detail || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Error connecting to backend:', error);
      alert('Could not connect to the server.');
    }
  }
};


  const handleSignUp = () => {
    console.log('Sign Up clicked!');
    router.push('/SignUp');
   
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page-container">
      {/* Logo and Brand */}
      <div className="login-brand">
        <div className="login-logo">
          <div className="logo-icon">
            D
          </div>
        </div>
        <h1 className="brand-title">FreelancePro</h1>
        <p className="brand-subtitle">Business Suite</p>
      </div>

      {/* Login Form Card */}
      <div className="login-card">
        <div className="login-header">
          <h2 className="login-title">Welcome back</h2>
          <p className="login-subtitle">Sign in to your FreelancePro account</p>
        </div>

        <form className="login-form" onSubmit={(e) => e.preventDefault()}>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email</label>
            <DynamicInput
              label=""
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
              error={emailError}
              type="email"
              size="md"
              variant="default"
              className="login-input"
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-field">
              <DynamicInput
                label=""
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                error={passwordError}
                type={showPassword ? "text" : "password"}
                size="md"
                variant="default"
                className="login-input password-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
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
            {roleError && <span className="error-message">{roleError}</span>}

          </div>
          </div>

          {/* Sign In Button */}
          <div className="form-group">
            <DynamicButton
              text="Sign in"
              onClick={handleSignIn}
              color="#4A90E2"
              variant="solid"
              size="md"
              rounded="lg"
              width="full"
              height="48px"
              className="signin-button"
            />
          </div>
        </form>

        {/* Sign Up Link */}
        <div className="signup-section">
          <p className="signup-text">
            Don't have an account?{' '}
            <button className="signup-link" onClick={handleSignUp}>
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}