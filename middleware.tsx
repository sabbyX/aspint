import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getMe } from '@/app/actions/authActions';

// const protectedRoutes = ['/autobook', '/']
const publicRoutes = ['/login']

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname
    // const isProtectedRoute = protectedRoutes.includes(path)
    const isPublicRoute = publicRoutes.includes(path)

    const token = cookies().get('JSESSIONID')?.value
    const user = await getMe(token);
    if (!isPublicRoute && !user?.username) {
        return NextResponse.redirect(new URL('/login', req.nextUrl))
    }

    if (
        isPublicRoute &&
        user?.username &&
        !req.nextUrl.pathname.startsWith('/')
    ) {
        return NextResponse.redirect(new URL('/', req.nextUrl))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}