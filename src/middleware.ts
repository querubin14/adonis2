import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Only protect /admin routes
  if (pathname.startsWith('/admin')) {
    // Exclude the login page itself to avoid redirect loops
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }
    
    // Check for the admin session cookie
    const session = request.cookies.get('admin_session')
    
    if (!session) {
      // Redirect to login if no session
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: '/admin/:path*',
}
