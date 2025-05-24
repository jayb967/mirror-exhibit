import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { UserProfile, AuthState } from '@/types/auth'

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true,
    error: null,
  })

  const supabase = createClientComponentClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserProfile(session.user.id)
      } else {
        setState({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
          error: null,
        })
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) throw error

      setState({
        user: profile as UserProfile,
        isAuthenticated: true,
        isAdmin: profile.role === 'admin',
        isLoading: false,
        error: null,
      })
    } catch (error) {
      console.error('Error fetching user profile:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load user profile',
      }))
    }
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user?.id)
        .select()
        .single()

      if (error) throw error

      setState(prev => ({
        ...prev,
        user: profile as UserProfile,
      }))
    } catch (error) {
      console.error('Error updating profile:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return {
    ...state,
    updateProfile,
    signOut,
  }
} 