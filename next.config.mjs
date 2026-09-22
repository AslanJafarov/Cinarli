/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Deployment builds into a separate folder and swaps it in only after success (see .cpanel.yml),
  // so a failed build never destroys the build the site is currently serving.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  experimental: {
    // Build workers default to "CPU cores minus one". The shared host reports 24 cores but caps the
    // account at 2 GB, so 23 workers get the build killed. .cpanel.yml sets NEXT_BUILD_CPUS=1.
    ...(process.env.NEXT_BUILD_CPUS ? { cpus: Number(process.env.NEXT_BUILD_CPUS) } : {}),
  },
};

export default nextConfig;
