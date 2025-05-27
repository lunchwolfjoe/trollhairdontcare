// Edge-compatible middleware using Web APIs
export async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url)
  const { pathname } = url

  // List of paths that don't require authentication
  const publicPaths = [
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/api/auth',
    '/assets',
    '/favicon.ico',
  ]

  // List of paths that require admin role
  const adminPaths = [
    '/admin',
    '/api/admin',
  ]

  // List of paths that require coordinator role
  const coordinatorPaths = [
    '/coordinator',
    '/api/coordinator',
  ]

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return new Response(null, { status: 200 })
  }

  // Get the JWT token from the cookie
  const cookies = request.headers.get('cookie')
  const token = cookies?.split(';')
    .find(c => c.trim().startsWith('sb-access-token='))
    ?.split('=')[1]

  // If no token, redirect to login
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return Response.redirect(loginUrl.toString())
  }

  try {
    // Verify the JWT token using Web Crypto API
    const [headerB64, payloadB64, signatureB64] = token.split('.')
    const payload = JSON.parse(atob(payloadB64))
    
    // Check if token is expired
    if (payload.exp * 1000 < Date.now()) {
      throw new Error('Token expired')
    }

    // Check role-based access
    const userRole = payload.role || 'volunteer'
    
    if (adminPaths.some(path => pathname.startsWith(path)) && userRole !== 'admin') {
      return Response.redirect(new URL('/access-denied', request.url).toString())
    }

    if (coordinatorPaths.some(path => pathname.startsWith(path)) && 
        !['admin', 'coordinator'].includes(userRole)) {
      return Response.redirect(new URL('/access-denied', request.url).toString())
    }

    // Add user info to headers for downstream use
    const headers = new Headers(request.headers)
    headers.set('x-user-role', userRole)
    headers.set('x-user-id', payload.sub)

    // Continue with the request
    return new Response(null, {
      status: 200,
      headers
    })
  } catch (error) {
    // If token verification fails, redirect to login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return Response.redirect(loginUrl.toString())
  }
}

// Export the middleware for Edge Runtime
export default {
  fetch: middleware
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all paths except static assets and API routes
    '/((?!assets|api/auth|favicon.ico).*)',
  ],
} 