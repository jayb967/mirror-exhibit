'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'

export default function SignInForm() {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')


    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      router.push('/')
      router.refresh()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="tp-contact-area pt-140 pb-130">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-lg-8">
            <div className="tp-contact-form text-center">
              <h3 className="tp-section-title pb-10">Sign In</h3>
              <p className="mb-30">Welcome back! Please sign in to your account.</p>

              {error && (
                <div className="alert alert-danger mb-20" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="tp-contact-input-box mb-20">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ color: '#000', '::placeholder': { color: '#666' } }}
                    className="dark-input"
                  />
                </div>

                <div className="tp-contact-input-box mb-20">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ color: '#000', '::placeholder': { color: '#666' } }}
                    className="dark-input"
                  />
                </div>

                <div className="tp-contact-btn">
                  <button
                    type="submit"
                    className="tp-btn-black w-100"
                    disabled={loading}
                  >
                    <span>{loading ? 'Signing in...' : 'Sign In'}</span>
                  </button>
                </div>

                <p className="mt-20">
                  Don't have an account? <Link href="/signup" className="text-theme-1">Sign Up</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}