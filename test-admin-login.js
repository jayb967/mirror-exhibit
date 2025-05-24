// Simple script to test the admin login functionality
console.log('Testing admin login functionality...');

// Check if environment variables are properly loaded
console.log('Checking environment variables:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Not set');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

// Instructions for testing
console.log('\nTo test the fix:');
console.log('1. Run the development server: npm run dev');
console.log('2. Navigate to http://localhost:3000/admin/login');
console.log('3. Try to log in with valid credentials');
console.log('4. If the login is successful, you should be redirected to the admin dashboard');
console.log('5. If there are any errors, check the browser console for details');
