const nextConfig = {
    eslint: {
      ignoreDuringBuilds: true, // Skip ESLint checks during Netlify build
    },
    output: 'standalone',
  };
  export default nextConfig;
  