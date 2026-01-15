import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { ApiError } from '@/lib/api/types'

export function useApiQuery<T>(
  key: string[],
  fetcher: () => Promise<T>,
  options?: {
    enabled?: boolean
    staleTime?: number
    gcTime?: number
    refetchOnMount?: boolean
    refetchOnWindowFocus?: boolean
    showErrorToast?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: unknown) => void
  }
) {
  console.log('[USE-API-QUERY] Setting up query:', { key, enabled: options?.enabled })
  
  const queryResult = useQuery({
    queryKey: key,
    queryFn: async () => {
      console.log('[USE-API-QUERY] Fetching:', key)
      try {
        const result = await fetcher()
        console.log('[USE-API-QUERY] Success:', { key, hasData: !!result })
        return result
      } catch (error) {
        console.error('[USE-API-QUERY] Error:', { key, error })
        throw error
      }
    },
    enabled: options?.enabled,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnMount: options?.refetchOnMount,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  })

  useEffect(() => {
    if (queryResult.data && queryResult.isSuccess && options?.onSuccess) {
      options.onSuccess(queryResult.data)
    }
  }, [queryResult.data, queryResult.isSuccess, options?.onSuccess])

  useEffect(() => {
    if (queryResult.error && queryResult.isError) {
      const errorInfo = extractErrorInfo(queryResult.error)
      
      if (options?.showErrorToast !== false && errorInfo.statusCode !== 401) {
        toast.error(errorInfo.message)
      }

      console.error('[USE-API-QUERY] Query error:', {
        key,
        message: errorInfo.message,
        code: errorInfo.code,
        statusCode: errorInfo.statusCode,
        details: errorInfo.details,
      })

      options?.onError?.(queryResult.error)
    }
  }, [queryResult.error, queryResult.isError, options?.onError, options?.showErrorToast])

  return queryResult
}

/**
 * Safely extracts error information from various error types
 * Converts unknown errors to ApiError format for consistent handling
 */
function extractErrorInfo(error: unknown): ApiError {
  if (error && typeof error === 'object') {
    const errorObj = error as Record<string, any>
    
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      return {
        message: errorObj.message,
        code: typeof errorObj.code === 'string' ? errorObj.code : undefined,
        statusCode: typeof errorObj.statusCode === 'number' ? errorObj.statusCode : undefined,
        details: errorObj.details,
      }
    }
  }

  if (error instanceof Error) {
    return {
      message: error.message || 'Erro desconhecido',
      code: 'UNKNOWN_ERROR',
    }
  }

  if (typeof error === 'string') {
    return {
      message: error,
      code: 'UNKNOWN_ERROR',
    }
  }

  return {
    message: 'Erro desconhecido',
    code: 'UNKNOWN_ERROR',
  }
}

interface UseApiOptions {
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
  onSuccess?: (data: any, variables?: any) => void
  onError?: (error: unknown) => void
}

export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseApiOptions & {
    invalidateKeys?: string[][]
  }
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn,
    onSuccess: (data, variables) => {
      if (options?.showSuccessToast !== false) {
        toast.success(options?.successMessage || 'Operação realizada com sucesso!')
      }

      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }

      options?.onSuccess?.(data, variables)
    },
    onError: (error: unknown) => {
      const errorInfo = extractErrorInfo(error)

      if (options?.showErrorToast !== false && errorInfo.statusCode !== 401) {
        toast.error(errorInfo.message)
      }

      options?.onError?.(error)
    },
  })
}