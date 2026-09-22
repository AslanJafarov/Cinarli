/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  // Deployment builds into a separate folder and swaps it in only after success (see .cpanel.yml),
  // so a failed build never destroys the build the site is currently serving.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
