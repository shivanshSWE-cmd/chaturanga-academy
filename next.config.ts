import type { NextConfig } from 'next';

const isGithubPages = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  // If building in GitHub Actions for GitHub Pages, export static HTML with repository basePath
  ...(isGithubPages && {
    output: 'export',
    basePath: '/chaturanga-academy',
    images: { unoptimized: true },
  }),
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
};

export default nextConfig;
