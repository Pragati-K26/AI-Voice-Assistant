import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET() {
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = headersList.get('x-forwarded-proto') || 'http'
  
  // Redirect favicon.ico requests to favicon.svg
  return NextResponse.redirect(new URL('/favicon.svg', `${protocol}://${host}`), 301)
}

