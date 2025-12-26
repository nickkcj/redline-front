import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'
import { ApiError } from '@/lib/auth/types/auth.types'

interface UseApiOptions {
  onSuccess?: (data: any) => void
  onError?: (error: unknown) => void
  showSuccessToast?: boolean
  showErrorToast?: boolean
  successMessage?: string
}

export function useApiQuery<T>(
  key: string[],
  fetcher: () => Promise<T>,
  options?: {
    enabled?: boolean
    staleTime?: number
    gcTime?: number
    refetchOnMount?: boolean
    refetchOnWindowFocus?: boolean
    onSuccess?: (data: T) => void
    onError?: (error: unknown) => void
  }
) {
  const queryResult = useQuery({
    queryKey: key,
    queryFn: fetcher,
    enabled: options?.enabled,
    staleTime: options?.staleTime,
    gcTime: options?.gcTime,
    refetchOnMount: options?.refetchOnMount,
    refetchOnWindowFocus: options?.refetchOnWindowFocus,
  })

  // Handle success callback
  useEffect(() => {
    if (queryResult.data && queryResult.isSuccess && options?.onSuccess) {
      options.onSuccess(queryResult.data)
    }
  }, [queryResult.data, queryResult.isSuccess, options?.onSuccess])

  // Handle error callback
  useEffect(() => {
    if (queryResult.error && queryResult.isError && options?.onError) {
      console.error('Query error:', queryResult.error)
      options.onError(queryResult.error)
    }
  }, [queryResult.error, queryResult.isError, options?.onError])

  return queryResult
}

/**
 * Safely extracts error information from various error types
 */
function extractErrorInfo(error: unknown): {
  message: string
  code?: string
  statusCode?: number
  details?: any
  stack?: string
  type: string
} {
  const errorInfo: ReturnType<typeof extractErrorInfo> = {
    message: 'Erro desconhecido',
    type: typeof error,
  }

  if (error instanceof Error) {
    errorInfo.message = error.message
    errorInfo.stack = error.stack
    errorInfo.type = error.constructor.name
  } else if (error && typeof error === 'object') {
    // Handle ApiError or similar objects
    const errorObj = error as Record<string, any>
    
    if ('message' in errorObj && typeof errorObj.message === 'string') {
      errorInfo.message = errorObj.message
    }
    
    if ('code' in errorObj && typeof errorObj.code === 'string') {
      errorInfo.code = errorObj.code
    }
    
    if ('statusCode' in errorObj && typeof errorObj.statusCode === 'number') {
      errorInfo.statusCode = errorObj.statusCode
    }
    
    if ('details' in errorObj) {
      errorInfo.details = errorObj.details
    }
    
    if ('stack' in errorObj && typeof errorObj.stack === 'string') {
      errorInfo.stack = errorObj.stack
    }
  } else if (typeof error === 'string') {
    errorInfo.message = error
  }

  return errorInfo
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
    onSuccess: (data) => {
      if (options?.showSuccessToast !== false) {
        toast.success(options?.successMessage || 'Operação realizada com sucesso!')
      }

      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key })
        })
      }

      options?.onSuccess?.(data)
    },
    onError: (error: unknown) => {
      const errorInfo = extractErrorInfo(error)

      if (options?.showErrorToast !== false) {
        toast.error(errorInfo.message)
      }

      // Log error with extracted information (avoid logging the raw error object which may not serialize)
      console.error('Mutation error:', errorInfo)
      
      // Also log the raw error for debugging if it's an Error instance
      if (error instanceof Error) {
        console.error('Raw error:', error)
      }
      
      options?.onError?.(error)
    },
  })
}