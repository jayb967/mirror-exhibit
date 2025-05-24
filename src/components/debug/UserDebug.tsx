'use client'

import { useUser } from '@clerk/nextjs';
import { useAuth } from '@/hooks/useClerkAuth';

const UserDebug = () => {
  const { user: clerkUser } = useUser();
  const { user, isAdmin } = useAuth();

  if (!clerkUser) return <div>Not signed in</div>;

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      padding: '10px', 
      border: '1px solid #ccc',
      borderRadius: '5px',
      fontSize: '12px',
      maxWidth: '300px',
      zIndex: 99999
    }}>
      <h4>User Debug Info</h4>
      <p><strong>Email:</strong> {clerkUser.emailAddresses[0]?.emailAddress}</p>
      <p><strong>Is Admin:</strong> {isAdmin ? 'YES' : 'NO'}</p>
      <p><strong>Public Metadata:</strong></p>
      <pre>{JSON.stringify(clerkUser.publicMetadata, null, 2)}</pre>
      <p><strong>Private Metadata:</strong></p>
      <pre>{JSON.stringify(clerkUser.privateMetadata, null, 2)}</pre>
    </div>
  );
};

export default UserDebug;
