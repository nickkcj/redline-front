import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { toast } from 'sonner'

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
    onSuccess?: (data: T) => void
    onError?: (error: unknown) => void
  }
) {
  const queryResult = useQuery({
    queryKey: key,
    queryFn: fetcher,
    enabled: options?.enabled,
    staleTime: options?.staleTime,
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
      if (options?.showErrorToast !== false) {
        toast.error(error instanceof Error ? error.message : 'Erro desconhecido')
      }

      console.error('Mutation error:', error)
      options?.onError?.(error)
    },
  })
}