import { NextResponse } from 'next/server'

export async function GET() {
  // Redirect favicon.ico requests to favicon.svg
  return NextResponse.redirect(new URL('/favicon.svg', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'), 301)
}

