'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Store, ShieldCheck, Lock, Mail, Loader2, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [infoMessage, setInfoMessage] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setInfoMessage(null)
    setIsSubmitting(true)

    try {
      if (isSigningUp) {
        // Sign Up admin
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
          options: {
            data: {
              full_name: 'Store Administrator',
            },
          },
        })

        if (error) throw error

        if (data.session) {
          router.push('/admin')
          router.refresh()
        } else {
          setInfoMessage('Account created! Please check your email to confirm registration or sign in directly if auto-confirm is enabled.')
        }
      } else {
        // Sign In
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        })

        if (error) throw error

        if (data.session) {
          router.push('/admin')
          router.refresh()
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err)
      setErrorMessage(err.message || 'Failed to authenticate. Please verify your credentials.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md space-y-8 bg-slate-900 border border-slate-800 p-8 sm:p-10 rounded-3xl shadow-2xl relative">
        {/* Back Link */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-amber-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Public Store</span>
        </Link>

        {/* Brand Header */}
        <div className="text-center space-y-3 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 mx-auto shadow-lg shadow-amber-500/25">
            <Store className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Admin Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Sign in to manage <span className="font-semibold text-amber-400">SAIF STORE</span> inventory & database.
            </p>
          </div>
        </div>

        {/* Feedback alerts */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-800 text-red-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{infoMessage}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@saifstore.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-white text-sm placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 text-white text-sm placeholder:text-slate-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20 disabled:opacity-50 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Authenticating with Supabase...</span>
              </>
            ) : (
              <span>{isSigningUp ? 'Create Admin Account' : 'Sign In to Dashboard'}</span>
            )}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="pt-2 text-center border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsSigningUp(!isSigningUp)
              setErrorMessage(null)
              setInfoMessage(null)
            }}
            className="text-xs text-slate-400 hover:text-amber-400 transition-colors"
          >
            {isSigningUp
              ? 'Already have an admin account? Sign In'
              : 'Need a new admin account for testing? Create One'}
          </button>
        </div>

        {/* Security explanation note for learning */}
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-800 text-[11px] text-slate-400 space-y-1">
          <p className="font-semibold text-amber-400/90 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5" />
            Supabase Auth Security Flow
          </p>
          <p>
            When you log in, Supabase issues a cryptographically signed JWT session stored securely in HTTP-only cookies. Row Level Security uses this token to grant full CRUD permissions to products and categories.
          </p>
        </div>
      </div>
    </div>
  )
}
