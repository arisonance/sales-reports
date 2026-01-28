'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/admin/manage', label: 'Overview' },
  { href: '/admin/manage/regions', label: 'Regions' },
  { href: '/admin/manage/rep-firms', label: 'Rep Firms' },
  { href: '/admin/manage/customers', label: 'Customers' },
  { href: '/admin/manage/directors', label: 'Directors' },
  { href: '/admin/setup-wizard', label: 'Setup Wizard', highlight: true },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-card-bg shadow rounded-lg p-2 mb-6">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin/manage' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-lg text-sm font-semibold uppercase tracking-wide transition-colors ${
                isActive
                  ? 'bg-sonance-blue text-white'
                  : item.highlight
                  ? 'bg-sonance-green/20 text-sonance-green hover:bg-sonance-green/30'
                  : 'text-foreground hover:bg-muted/50'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
