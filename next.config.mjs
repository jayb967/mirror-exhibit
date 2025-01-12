/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['i.ibb.co', 'wfcjmklzsrielzcibmsf.supabase.co'], // Add Supabase storage domain
  },
  // Enable both JS and TS
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  // Enable webpack config for both JS and TS
  webpack: (config) => {
    config.resolve.extensions.push('.js', '.jsx', '.ts', '.tsx');
    return config;
  },
};

export default nextConfig;