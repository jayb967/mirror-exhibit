'use client';

import { useEffect } from 'react';
import { useAuth } from '@/hooks/useClerkAuth';
import { useRouter } from 'next/navigation';
import LoginLayout from '@/components/admin/LoginLayout';

export default function AdminLogin() {
  const { isAuthenticated, isAdmin, isLoading, signIn } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated as admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && isAdmin) {
      router.push('/admin/dashboard');
    }
  }, [isAuthenticated, isAdmin, isLoading, router]);

  const handleSignIn = () => {
    signIn();
  };

  // Show loading state
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#F8F8F8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading...</div>
      </div>
    );
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

        <div style={{ width: '100%', boxSizing: 'border-box' }}>
          <div style={{ marginBottom: '30px', textAlign: 'center' }}>
            <p style={{ color: '#54595F', fontSize: '16px', marginBottom: '20px' }}>
              Click the button below to sign in with your admin credentials
            </p>
          </div>

          <button
            type="button"
            onClick={handleSignIn}
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
            <span style={{ marginRight: '8px' }}>🔒</span>
            <span>Sign in with Clerk</span>
          </button>
        </div>
      </div>
    </LoginLayout>
  );
}