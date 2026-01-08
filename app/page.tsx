'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function Home() {
  const router = useRouter()
  const [directors, setDirectors] = useState<Array<{ id: string; name: string; email: string; region: string }>>([])
  const [selectedDirector, setSelectedDirector] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if there's a saved director in localStorage
    const savedDirectorId = localStorage.getItem('selectedDirectorId')
    if (savedDirectorId) {
      setSelectedDirector(savedDirectorId)
    }

    // Fetch directors from API
    fetchDirectors()
  }, [])

  const fetchDirectors = async () => {
    try {
      const res = await fetch('/api/directors')
      if (res.ok) {
        const data = await res.json()
        setDirectors(data)
      }
    } catch (error) {
      console.error('Failed to fetch directors:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartReport = () => {
    if (!selectedDirector) {
      alert('Please select your name first')
      return
    }

    // Save selection to localStorage for persistence
    localStorage.setItem('selectedDirectorId', selectedDirector)

    // Navigate to report form
    router.push('/report')
  }

  const selectedDirectorData = directors.find(d => d.id === selectedDirector)

  return (
    <div className="min-h-screen bg-[#333F48] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Sonance Accent Bar */}
        <div className="h-1 bg-gradient-to-r from-[#00A3E1] to-[#333F48]"></div>

        <div className="p-8">
          {/* Header with Sonance Logo */}
          <div className="text-center mb-8">
            <div className="mb-6">
              <Image
                src="/logos/sonance_logo_dark.png"
                alt="Sonance"
                width={180}
                height={28}
                className="mx-auto"
                priority
              />
            </div>
            <h1 className="text-xl font-bold text-[#333F48] mb-2 uppercase tracking-wide">
              Field Team Member
            </h1>
            <h2 className="text-2xl font-bold text-[#00A3E1] uppercase tracking-wide">
              Bi-Weekly Report
            </h2>
            <p className="text-[#333F48] text-sm mt-3 opacity-70">
              Comprehensive Sales Performance & Market Intelligence
            </p>
          </div>

          {/* Director Selection */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-[#333F48] mb-2 uppercase tracking-wide">
                Select Your Name
              </label>
              <select
                value={selectedDirector}
                onChange={(e) => setSelectedDirector(e.target.value)}
                className="w-full px-4 py-3 border-2 border-[#D9D9D6] rounded-lg focus:ring-2 focus:ring-[#00A3E1] focus:border-[#00A3E1] bg-white text-[#333F48] transition-colors"
                disabled={loading}
              >
                <option value="">Select your name...</option>
                {directors.map((director) => (
                  <option key={director.id} value={director.id}>
                    {director.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedDirectorData && (
              <div className="bg-[#D9D9D6]/30 rounded-lg p-4 border-l-4 border-[#00A3E1]">
                <p className="text-sm text-[#333F48]">
                  <span className="font-semibold">Region:</span> {selectedDirectorData.region}
                </p>
                <p className="text-sm text-[#333F48]">
                  <span className="font-semibold">Email:</span> {selectedDirectorData.email}
                </p>
              </div>
            )}

            <button
              onClick={handleStartReport}
              disabled={!selectedDirector}
              className="w-full py-4 bg-[#00A3E1] text-white font-semibold rounded-lg hover:bg-[#0091c8] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg uppercase tracking-wide"
            >
              Start / Continue Report
            </button>
          </div>

          {/* Admin Link */}
          <div className="mt-8 pt-6 border-t border-[#D9D9D6] text-center">
            <a
              href="/admin"
              className="text-sm text-[#333F48] opacity-60 hover:text-[#00A3E1] hover:opacity-100 transition-all uppercase tracking-wide"
            >
              Admin Access
            </a>
          </div>

          {/* Tagline */}
          <div className="mt-6 text-center">
            <p className="text-xs text-[#333F48] opacity-40 italic">
              Life is Better with Music
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
