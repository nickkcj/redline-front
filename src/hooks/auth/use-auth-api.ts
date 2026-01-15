/**
 * Auth API Hooks
 */

import { useApiMutation } from '../api/use-api'
import { authService } from '@/lib/api/services/auth.service'
import { tokenStore } from '@/lib/stores/token.store'
import type { UserDTO } from '@/lib/api/types/user.types'
import type { UserInfoDto } from '@/lib/api/types/auth.types'

export function useGoogleOAuthUrl() {
  return useApiMutation<string, string>(
    (callbackUrl) => authService.getGoogleOAuthUrl(callbackUrl).then(res => res.authUrl),
    {
      showSuccessToast: false,
      showErrorToast: true,
    }
  )
}

export function useGoogleCallback() {
  return useApiMutation<
    { success: boolean; sessionToken: string; user: UserInfoDto },
    { code: string; callbackUrl: string }
  >(
    ({ code, callbackUrl }) => authService.googleCallback(code, callbackUrl),
    {
      successMessage: 'Login com Google realizado com sucesso!',
      onSuccess: (data) => {
        if (data.success && data.sessionToken) {
          tokenStore.setTokens({
            sessionToken: data.sessionToken,
            expiresIn: 24 * 60 * 60 * 1000,
          })
        }
      },
    }
  )
}

export function useRequestMagicLink() {
  return useApiMutation<{ success: boolean; message: string }, string>(
    (email) => authService.requestMagicLink(email),
    {
      successMessage: 'Magic link enviado! Verifique seu email.',
    }
  )
}

export function useVerifyMagicLink() {
  return useApiMutation<{ success: boolean; sessionToken: string; user: UserInfoDto }, string>(
    (token) => authService.verifyMagicLink(token),
    {
      successMessage: 'Login realizado com sucesso!',
      onSuccess: (data) => {
        if (data.success && data.sessionToken) {
          tokenStore.setTokens({
            sessionToken: data.sessionToken,
            expiresIn: 24 * 60 * 60 * 1000,
          })
        }
      },
    }
  )
}

export function useLogout() {
  return useApiMutation<void, void>(
    () => authService.logout(),
    {
      successMessage: 'Logout realizado!',
      onSuccess: () => {
        tokenStore.clear()
      },
    }
  )
}

export function useUserInfo() {
  return useApiMutation<UserDTO, void>(
    () => authService.getUserInfo(),
    {
      showSuccessToast: false,
      showErrorToast: false, // Não mostrar erro porque é usado em background
    }
  )
}
