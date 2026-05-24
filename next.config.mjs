/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ["@google/generative-ai"],
  poweredByHeader: false,
};

export default nextConfig;
