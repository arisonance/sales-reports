'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AdminNav from '@/components/admin/AdminNav'

const manageItems = [
  {
    title: 'Regions',
    description: 'Manage sales regions (West, Southeast, Central, etc.)',
    href: '/admin/manage/regions',
    count: null,
  },
  {
    title: 'Rep Firms',
    description: 'Manage the master list of rep firms for reports',
    href: '/admin/manage/rep-firms',
    count: null,
  },
  {
    title: 'Directors',
    description: 'Manage sales directors and their assigned regions',
    href: '/admin/manage/directors',
    count: null,
  },
  {
    title: 'Customers',
    description: 'Manage direct customers for strategic accounts',
    href: '/admin/manage/customers',
    count: null,
  },
]

export default function AdminManagePage() {
  const router = useRouter()

  useEffect(() => {
    const isAdmin = localStorage.getItem('adminAuthenticated')
    if (!isAdmin) {
      router.push('/admin')
    }
  }, [router])

  return (
    <div className="min-h-screen bg-page-bg">
      {/* Header */}
      <div className="bg-card-bg shadow">
        <div className="h-1 bg-gradient-to-r from-sonance-blue to-sonance-charcoal"></div>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <img
              src="/logos/sonance_logo_dark.png"
              alt="Sonance"
              className="h-6"
            />
            <h1 className="text-xl font-bold text-foreground uppercase tracking-wide">
              Manage Data
            </h1>
          </div>
          <Link
            href="/admin/dashboard"
            className="text-sm text-foreground opacity-60 hover:text-sonance-blue hover:opacity-100 transition-all uppercase tracking-wide"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <AdminNav />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {manageItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="bg-card-bg rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-sonance-blue"
            >
              <h2 className="text-lg font-bold text-foreground uppercase tracking-wide mb-2">
                {item.title}
              </h2>
              <p className="text-sm text-foreground opacity-70">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
