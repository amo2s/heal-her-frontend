/** @type {import('next').NextConfig} */
const nextConfig = {
  optimizeFonts: false, // Bypasses the build-time Google Fonts network fetch
  typescript: {
    // Keep this for now to move fast, but set to false before you go live!
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY' // Hardened to prevent Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' 
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin' // Prevents leaking internal paths
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self'; 
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com; 
              style-src 'self' 'unsafe-inline'; 
              img-src 'self' blob: data: https://grainy-gradients.vercel.app https://res.cloudinary.com; 
              font-src 'self'; 
              frame-src 'self' https://vercel.live; 
              worker-src 'self' blob:; 
              media-src 'self' blob: data: https://res.cloudinary.com; 
              connect-src 'self' blob: data: 
                https://res.cloudinary.com
                http://127.0.0.1:8000 
                ws://127.0.0.1:8000 
                https://sliverboy-healher-backend.hf.space
                wss://sliverboy-healher-backend.hf.space
                https://*.supabase.co
                https://script.google.com
                https://script.googleusercontent.com; 
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  }
}

export default nextConfig;