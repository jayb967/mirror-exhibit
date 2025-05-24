'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useClerkAuth';

interface ProfileButtonComponentProps {
  iconColor?: string;
  variant?: 'navbar' | 'mobile';
}

const ProfileButtonComponent: React.FC<ProfileButtonComponentProps> = ({
  iconColor = 'currentColor',
  variant = 'navbar'
}) => {
  const { user, isAuthenticated, isLoading, signIn, signUp, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSignIn = () => {
    signIn();
    setDropdownOpen(false);
  };

  const handleSignUp = () => {
    signUp();
    setDropdownOpen(false);
  };

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  if (isLoading) {
    return (
      <div className={`tp-header-icon profile ${variant === 'mobile' ? '' : 'd-none d-xl-block'}`}>
        <button className="profile-icon" style={{ color: iconColor, background: 'none', border: 'none' }}>
          <i className="fa-solid fa-spinner fa-spin" style={{ color: iconColor }}></i>
        </button>
      </div>
    );
  }

  return (
    <div className={`tp-header-icon profile ${variant === 'mobile' ? '' : 'd-none d-xl-block'}`} ref={dropdownRef}>
      <button 
        className="profile-icon" 
        onClick={toggleDropdown}
        style={{ 
          color: iconColor, 
          background: 'none', 
          border: 'none',
          position: 'relative',
          padding: '8px',
          cursor: 'pointer'
        }}
      >
        <i className="fa-solid fa-user" style={{ color: iconColor, fontSize: '18px' }}></i>
      </button>

      {dropdownOpen && (
        <div 
          className="profile-dropdown"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            backgroundColor: 'white',
            border: '1px solid #e0e0e0',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            minWidth: '200px',
            zIndex: 1000,
            marginTop: '8px'
          }}
        >
          {isAuthenticated && user ? (
            // Authenticated user menu
            <div>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#333' }}>
                  {user.full_name || 'User'}
                </div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {user.email}
                </div>
              </div>
              
              <div style={{ padding: '8px 0' }}>
                <Link 
                  href="/account" 
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'block',
                    padding: '8px 16px',
                    color: '#333',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <i className="fa-solid fa-user" style={{ marginRight: '8px', width: '16px' }}></i>
                  My Account
                </Link>
                
                <Link 
                  href="/orders" 
                  onClick={() => setDropdownOpen(false)}
                  style={{
                    display: 'block',
                    padding: '8px 16px',
                    color: '#333',
                    textDecoration: 'none',
                    fontSize: '14px',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <i className="fa-solid fa-box" style={{ marginRight: '8px', width: '16px' }}></i>
                  My Orders
                </Link>

                {user.role === 'admin' && (
                  <Link 
                    href="/admin/dashboard" 
                    onClick={() => setDropdownOpen(false)}
                    style={{
                      display: 'block',
                      padding: '8px 16px',
                      color: '#333',
                      textDecoration: 'none',
                      fontSize: '14px',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i className="fa-solid fa-cog" style={{ marginRight: '8px', width: '16px' }}></i>
                    Admin Dashboard
                  </Link>
                )}
                
                <div style={{ borderTop: '1px solid #f0f0f0', marginTop: '8px', paddingTop: '8px' }}>
                  <button
                    onClick={handleLogout}
                    style={{
                      display: 'block',
                      width: '100%',
                      padding: '8px 16px',
                      color: '#dc3545',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <i className="fa-solid fa-sign-out-alt" style={{ marginRight: '8px', width: '16px' }}></i>
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          ) : (
            // Guest user menu
            <div style={{ padding: '8px 0' }}>
              <button
                onClick={handleSignIn}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  color: '#333',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <i className="fa-solid fa-sign-in-alt" style={{ marginRight: '8px', width: '16px' }}></i>
                Sign In
              </button>
              
              <button
                onClick={handleSignUp}
                style={{
                  display: 'block',
                  width: '100%',
                  padding: '12px 16px',
                  color: '#333',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f5'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <i className="fa-solid fa-user-plus" style={{ marginRight: '8px', width: '16px' }}></i>
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileButtonComponent;
