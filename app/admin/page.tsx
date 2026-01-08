'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      if (res.ok) {
        // Store admin session
        localStorage.setItem('adminAuthenticated', 'true')
        router.push('/admin/dashboard')
      } else {
        setError('Invalid password')
      }
    } catch (err) {
      setError('Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#333F48] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Sonance Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-[#00A3E1] to-[#333F48]"></div>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className="mb-6">
              <Image
                src="/logos/sonance_logo_dark.png"
                alt="Sonance"
                width={160}
                height={25}
                className="mx-auto"
                priority
              />
            </div>
            <h1 className="text-xl font-bold text-[#333F48] mb-2 uppercase tracking-wide">Admin Access</h1>
            <p className="text-[#333F48] opacity-70">Enter the admin password to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#333F48] mb-2 uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1] bg-white text-[#333F48] transition-colors"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm border-l-4 border-red-500">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#00A3E1] text-white font-semibold rounded-lg hover:bg-[#0091c8] transition-all disabled:opacity-50 shadow-lg uppercase tracking-wide"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-[#333F48] opacity-60 hover:text-[#00A3E1] hover:opacity-100 transition-all uppercase tracking-wide">
              Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
