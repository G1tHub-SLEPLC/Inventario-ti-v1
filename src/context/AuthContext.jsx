import { createContext, useContext, useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [perfil, setPerfil]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  const perfilRef = useRef(null)
  const fetchingUserIdRef = useRef(null)

  useEffect(() => {
    perfilRef.current = perfil
  }, [perfil])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) {
        fetchPerfil(data.session.user.id)
      } else {
        setLoading(false)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(prev => {
        if (prev && session && prev.access_token === session.access_token) return prev;
        return session;
      });
      if (session) {
        fetchPerfil(session.user.id)
      } else {
        setPerfil(null)
        setLoading(false)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchPerfil(userId) {
    if (perfilRef.current && perfilRef.current.id === userId) {
      return
    }
    if (fetchingUserIdRef.current === userId) {
      return
    }
    fetchingUserIdRef.current = userId

    if (!perfilRef.current) {
      setLoading(true)
    }

    try {
      const { data, error } = await supabase.from('perfiles').select('*').eq('id', userId).single()
      if (error) {
        console.error('Error fetching perfil:', error)
        setAuthError(error)
      } else {
        setPerfil(data)
      }
    } finally {
      setLoading(false)
      fetchingUserIdRef.current = null
    }
  }

  const isAdmin = perfil?.rol === 'admin_ti'
  const isSlep = perfil?.rol === 'slep'

  return (
    <AuthContext.Provider value={{ session, perfil, isAdmin, isSlep, loading, authError }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
