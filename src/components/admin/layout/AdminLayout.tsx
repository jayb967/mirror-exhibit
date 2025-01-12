'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabaseClient, useUser } from '@supabase/auth-helpers-react'
import Sidebar from './Sidebar'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = useSupabaseClient()
  const user = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/admin/login')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}