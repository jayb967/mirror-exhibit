'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/utils/supabase/client'

export default function SettingsForm() {
  const [settings, setSettings] = useState({
    siteName: 'Mirror Exhibit',
    siteDescription: '',
    contactEmail: '',
    shippingFee: '',
    taxRate: ''
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') throw error
      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { error } = await supabase
        .from('settings')
        .upsert(settings)

      if (error) throw error
      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white shadow rounded-lg p-6">
      <div>
        <label htmlFor="siteName" className="block text-sm font-medium text-gray-700">
          Site Name
        </label>
        <input
          type="text"
          id="siteName"
          value={settings.siteName}
          onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="siteDescription" className="block text-sm font-medium text-gray-700">
          Site Description
        </label>
        <textarea
          id="siteDescription"
          rows={3}
          value={settings.siteDescription}
          onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700">
          Contact Email
        </label>
        <input
          type="email"
          id="contactEmail"
          value={settings.contactEmail}
          onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="shippingFee" className="block text-sm font-medium text-gray-700">
          Default Shipping Fee
        </label>
        <input
          type="number"
          id="shippingFee"
          min="0"
          step="0.01"
          value={settings.shippingFee}
          onChange={(e) => setSettings({ ...settings, shippingFee: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <label htmlFor="taxRate" className="block text-sm font-medium text-gray-700">
          Tax Rate (%)
        </label>
        <input
          type="number"
          id="taxRate"
          min="0"
          max="100"
          step="0.01"
          value={settings.taxRate}
          onChange={(e) => setSettings({ ...settings, taxRate: e.target.value })}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </form>
  )
}