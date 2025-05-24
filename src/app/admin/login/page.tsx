'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import LoginLayout from '@/components/admin/LoginLayout';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Use useEffect to set mounted state to true after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const supabase = createClientComponentClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      // Use window.location for navigation instead of router
      window.location.href = '/admin/dashboard';
    } catch (error: any) {
      setError(error.message || 'Failed to sign in');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  // Only render the form when the component is mounted
  if (!mounted) {
    return <div style={{ minHeight: '100vh', backgroundColor: '#F8F8F8' }}></div>;
  }

  return (
    <LoginLayout>
      <div>
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            margin: '0 auto 15px',
            backgroundColor: '#A6A182',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}>
            🔒
          </div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '8px'
          }}>Admin Access</h2>
          <p style={{
            color: '#54595F',
            fontSize: '16px'
          }}>Sign in to access the admin dashboard</p>
        </div>

        <form onSubmit={handleLogin} style={{ width: '100%', boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '20px', width: '100%', boxSizing: 'border-box' }}>
            <label htmlFor="email" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500'
            }}>Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                height: '50px',
                padding: '0 15px',
                border: '1px solid #E6E6E6',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px', width: '100%', boxSizing: 'border-box' }}>
            <label htmlFor="password" style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: '500'
            }}>Password</label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                height: '50px',
                padding: '0 15px',
                border: '1px solid #E6E6E6',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: '#FFEBEE',
              color: '#D32F2F',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <span style={{ marginRight: '8px' }}>⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: '#E8F5E9',
              color: '#2E7D32',
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <span style={{ marginRight: '8px' }}>✅</span>
              <p>Login successful! Redirecting to admin dashboard...</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '50px',
              backgroundColor: '#A6A182',
              color: 'white',
              border: 'none',
              fontWeight: '600',
              fontSize: '14px',
              letterSpacing: '1.2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}
          >
            {loading ? (
              <>
                <span style={{ marginRight: '8px' }}>⏳</span>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span style={{ marginRight: '8px' }}>🔒</span>
                <span>Sign in</span>
              </>
            )}
          </button>
        </form>
      </div>
    </LoginLayout>
  );
}