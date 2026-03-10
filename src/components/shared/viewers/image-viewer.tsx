"use client"

import React, { useState, useEffect } from 'react'
import { CircleNotch, WarningCircle, FileText } from '@phosphor-icons/react'

interface ImageViewerProps {
  url: string
  fileName: string
}

export function ImageViewer({ url, fileName }: ImageViewerProps) {
  const [imageData, setImageData] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchImage = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch(url, {
          method: 'GET',
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        setImageData(imageUrl)
      } catch (err) {
        console.error('Error loading image:', err)
        setError(err instanceof Error ? err.message : 'Failed to load image')
      } finally {
        setLoading(false)
      }
    }

    if (url) {
      fetchImage()
    }

    // Cleanup function to revoke object URL
    return () => {
      if (imageData) {
        URL.revokeObjectURL(imageData)
      }
    }
  }, [url])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <CircleNotch className="h-8 w-8 animate-spin mb-2" />
        <p className="text-sm text-muted-foreground">Carregando imagem...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <WarningCircle className="h-12 w-12 text-destructive mb-4" />
        <p className="text-lg font-medium mb-2">Erro ao carregar imagem</p>
        <p className="text-sm text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex justify-center items-start h-full overflow-auto p-6 bg-muted/30">
      <div className="max-w-full">
        {imageData ? (
          <img
            src={imageData}
            alt={fileName}
            className="max-w-full h-auto object-contain shadow-lg rounded-lg"
            onError={() => {
              setError('Não foi possível exibir esta imagem')
            }}
          />
        ) : (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              Não foi possível exibir este arquivo
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
