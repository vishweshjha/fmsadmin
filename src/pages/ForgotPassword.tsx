import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Mail, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { ADMIN_AUTH_FORGOT } from '../context/AuthContext'

type PageState = 'idle' | 'loading' | 'success' | 'error'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [pageState, setPageState] = useState<PageState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPageState('loading')
    setErrorMessage('')

    try {
      const response = await fetch(ADMIN_AUTH_FORGOT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        const serverMessage =
          (Array.isArray(responseData.message)
            ? responseData.message.join(', ')
            : responseData.message) ||
          responseData.error?.message ||
          'Something went wrong. Please try again.'
        setErrorMessage(serverMessage)
        setPageState('error')
        return
      }

      // Show success regardless of whether email exists — security best practice
      setPageState('success')
    } catch {
      setErrorMessage('Network error — is the local backend running?')
      setPageState('error')
    }
  }

  const handleTryAgain = () => {
    setEmail('')
    setErrorMessage('')
    setPageState('idle')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">F</span>
            </div>
            <span className="text-3xl font-bold text-gray-900">FMS ADMIN</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">

          {/* ── Success State ── */}
          {pageState === 'success' ? (
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="text-green-600" size={32} />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your inbox</h1>
              <p className="text-gray-600 text-sm mb-6">
                If an account with <span className="font-medium text-gray-800">{email}</span> exists,
                a password reset link has been sent. Please check your spam folder too.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 font-semibold"
              >
                <ArrowLeft size={16} />
                Back to Sign In
              </Link>
            </div>
          ) : (
            <>
              {/* ── Form State ── */}
              <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
                <p className="text-gray-600 mt-2 text-sm">
                  Enter your admin email address and we'll send you a link to reset your password.
                </p>
              </div>

              {/* Error Banner */}
              {pageState === 'error' && errorMessage && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span className="text-sm">{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="forgot-email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      id="forgot-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={pageState === 'loading'}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="admin@fms.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="forgot-password-submit"
                  disabled={pageState === 'loading'}
                  className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pageState === 'loading' ? 'Sending reset link…' : 'Send Reset Link'}
                </button>
              </form>

              {pageState === 'error' && (
                <div className="mt-4 text-center">
                  <button
                    onClick={handleTryAgain}
                    className="text-sm text-gray-500 hover:text-gray-700 underline"
                  >
                    Try a different email
                  </button>
                </div>
              )}

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft size={14} />
                  Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
