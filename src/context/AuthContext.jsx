import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [perfil, setPerfil]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) {
        setLoading(true)
        fetchPerfil(data.session.user.id)
      } else {
        setLoading(false)
      }
    })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        setPerfil(current => {
          if (!current) {
            setLoading(true)
          }
          return current
        })
        fetchPerfil(session.user.id)
      } else {
        setPerfil(null)
        setLoading(false)
      }
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  async function fetchPerfil(userId) {
    const { data, error } = await supabase.from('perfiles').select('*').eq('id', userId).single()
    if (error) {
      console.error('Error fetching perfil:', error)
      setAuthError(error)
    }
    setPerfil(data)
    setLoading(false)
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
