'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface CustomLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
  prefetch?: boolean
}

export default function CustomLink({ href, children, className, onClick, prefetch = false }: CustomLinkProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={className}
      onClick={onClick}
    >
      {children}
    </Link>
  )
}

