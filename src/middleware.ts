import { NextRequest, NextResponse } from 'next/server'
import { decodeJwt } from 'jose'

// type tokenType = {
//   sub: string
//   username: string
//   iat: number
//   exp: number
// }
// type AuthResponseType = {
//   data: {
//     refreshTokenV2: {
//       access_token: string
//       refresh_token: string
//       user: UserType
//     }
//   }
// }
// type UserType = {
//   id: String
//   username: String
// }

export async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl
  const access_token = request.cookies.get('access_token')?.value
  let accessTokenExpiry
  if (access_token) {
    accessTokenExpiry = decodeJwt(access_token)
  }
  try {
    if (pathname === '/') {
      console.log('Login Route')
      if (
        accessTokenExpiry &&
        accessTokenExpiry.exp > Math.floor(Date.now() / 1000)
      ) {
        console.log('Token Is Valid')
        console.log('Route going to ', origin)
        return NextResponse.redirect(
          `${
            process.env.NODE_ENV === 'production'
              ? process.env.FRONTEND_URL_PROD
              : process.env.FRONTEND_URL_DEV
          }/todos`
        )
      }
      const response = NextResponse.rewrite(new URL(`/`, request.url))
      response.cookies.delete('access_token')
      return response
    }

    // For Every Other Path

    if (
      accessTokenExpiry &&
      accessTokenExpiry.exp > Math.floor(Date.now() / 1000)
    ) {
      console.log('Token Is Valid for Other Paths')

      return NextResponse.next()
    }
    const response = NextResponse.redirect(new URL(`/`, request.url))
    response.cookies.delete('access_token')
    return response
  } catch (error) {
    console.log(error)
  }
}
export const config = {
  matcher: ['/', '/todos'],
  // matcher: ['/((?!.*\\.).*)', '/favicon.ico'],
}
