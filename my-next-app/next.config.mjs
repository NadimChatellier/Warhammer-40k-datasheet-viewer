/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true, // Optional: If you want to use React Strict Mode
    swcMinify: true,       // Optional: Enables SWC minification for better build performance
  
    // Uncomment and configure this if you're using a custom server
    // target: 'serverless', // Uncomment this line for serverless deployment
  
    // Netlify specific configuration (optional)
    experimental: {
      outputStandalone: true, // Make the build independent of the server for better performance on Netlify
    },
  
    // You can specify a public path if necessary for your app (optional)
    // basePath: '/my-base-path',
  };
  
  export default nextConfig;
  