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
            value: 'SAMEORIGIN' // Prevents your site from being embedded in an iframe (Clickjacking protection)
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff' // Prevents the browser from guessing file types (MIME sniffing)
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self'; 
              script-src 'self' 'unsafe-eval' 'unsafe-inline'; 
              style-src 'self' 'unsafe-inline'; 
              img-src 'self' blob: data: https://grainy-gradients.vercel.app; 
              font-src 'self'; 
              connect-src 'self' http://127.0.0.1:8000 ws://127.0.0.1:8000; 
            `.replace(/\s{2,}/g, ' ').trim()
          }
        ]
      }
    ]
  }
}

export default nextConfig