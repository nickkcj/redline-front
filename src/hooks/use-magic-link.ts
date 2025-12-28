// ============================================================
// USE MAGIC LINK - Hook para Magic Link flow
// ============================================================

"use client"

import { useState } from 'react'
import { useAuth } from '@/providers/auth-provider'

export function useMagicLink() {
  const { requestMagicLink, verifyMagicLink, error, isLoading } = useAuth()
  const [emailSent, setEmailSent] = useState(false)

  const sendMagicLink = async (email: string) => {
    try {
      await requestMagicLink(email)
      setEmailSent(true)
    } catch (err) {
      console.error('Failed to send magic link:', err)
      throw err
    }
  }

  const verifyToken = async (token: string) => {
    try {
      await verifyMagicLink(token)
    } catch (err) {
      console.error('Failed to verify magic link:', err)
      throw err
    }
  }

  return {
    sendMagicLink,
    verifyToken,
    emailSent,
    isLoading,
    error,
  }
}
