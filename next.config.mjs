/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        // Apply these headers to ALL routes in your application
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
            value: 'SAMEORIGIN' 
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' 
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            // 👇 FINAL CSP WITH ALL FIXES 👇
            value: `
              default-src 'self'; 
              script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live; 
              style-src 'self' 'unsafe-inline'; 
              img-src 'self' blob: data: https://grainy-gradients.vercel.app; 
              font-src 'self'; 
              frame-src 'self' https://vercel.live; 
              worker-src 'self' blob:; 
              media-src 'self' blob: data:; 
              connect-src 'self' blob: data: 
                http://127.0.0.1:8000 
                ws://127.0.0.1:8000 
                https://sliverboy-heal-her-backend.hf.space 
                wss://sliverboy-heal-her-backend.hf.space; 
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  }
}

export default nextConfig;