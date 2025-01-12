'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import Link from 'next/link'

export default function SignUpForm() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error, data: { user: createdUser } } = await supabase.auth.signUp({
        email,
        password
    });

      if (error) throw error

      router.push('/')
    } catch (error: any) {
      console.log('what is the error that I am getting for the user', error)
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
              <h3 className="tp-section-title pb-10">Create Account</h3>
              <p className="mb-30">Join us to get started with your account.</p>

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
                    placeholder="Create Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ color: '#000', '::placeholder': { color: '#666' } }}
                    className="dark-input"
                  />
                  <input 
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
                    <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
                  </button>
                </div>

                <p className="mt-20">
                  Already have an account? <Link href="/signin" className="text-theme-1">Sign In</Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}